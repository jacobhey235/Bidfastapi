from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Optional
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from datetime import datetime
import auth
from auth import get_current_user
import base64
import json

app = FastAPI()
app.include_router(auth.router)

origins = [
    'https://bidfastapi-frontend.onrender.com/',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

models.Base.metadata.create_all(bind=engine)

class ProductBase(BaseModel):
    title: str
    category: str
    description: str
    bid_date: datetime
    cur_bid: float
    images: List[str] = []

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class ProductModel(ProductBase):
    id: int
    owner_id: int
    is_active: bool
    max_bid_user_id: Optional[int] = None

    @validator('images', pre=True)
    def parse_images(cls, v):
        if isinstance(v, str):  # Если из БД пришла строка
            try:
                return json.loads(v) if v else []
            except json.JSONDecodeError:
                return []
        return v  # Если уже список (например, при создании)

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class BidRequest(BaseModel):
    amount: float

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/products/", response_model=ProductModel)
async def create_product(
    files: List[UploadFile] = File(...),
    title: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    bid_date: str = Form(...),
    cur_bid: float = Form(...),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    image_base64_list = []
    for file in files:
        if file.content_type not in ['image/jpeg', 'image/png']:
            raise HTTPException(400, detail="Invalid image type")
        
        contents = await file.read()
        if len(contents) > 2 * 1024 * 1024:  # 2MB limit
            raise HTTPException(400, detail="Image too large")
        
        base64_image = base64.b64encode(contents).decode('utf-8')
        image_base64_list.append(base64_image)
    
    db_product = models.Product(
        title=title,
        category=category,
        description=description,
        bid_date=datetime.fromisoformat(bid_date),
        cur_bid=cur_bid,
        owner_id=user.get('id'),
        images=image_base64_list
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.get("/products/{product_id}/images")
async def get_product_images(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product.images if product.images else None

@app.get("/products/", response_model=List[ProductModel])
async def read_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(models.Product).filter(
        models.Product.is_active == True
    ).offset(skip).limit(limit).all()

@app.get("/products/{product_id}", response_model=ProductModel)
async def read_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products/{product_id}/bid")
async def make_bid(
    product_id: int,
    bid: BidRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not product.is_active:
        raise HTTPException(status_code=400, detail="Auction is closed")
    if bid.amount <= product.cur_bid:
        raise HTTPException(
            status_code=400,
            detail=f"Bid must be greater than current bid ({product.cur_bid})"
        )
    if product.owner_id == user.get('id'):
        raise HTTPException(status_code=400, detail="Cannot bid on your own product")
    
    product.cur_bid = bid.amount
    product.max_bid_user_id = user.get('id')
    db.commit()
    return {"message": "Bid placed successfully"}

@app.post("/products/{product_id}/favorite", status_code=status.HTTP_201_CREATED)
async def add_to_favorites(
    product_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product.is_active:
        raise HTTPException(status_code=400, detail="Cannot favorite inactive product")

    if product.owner_id == user.get('id'):
        raise HTTPException(status_code=400, detail="Cannot favorite your own product")

    if db.query(models.favorites).filter(
        models.favorites.c.user_id == user.get('id'),
        models.favorites.c.product_id == product_id
    ).first():
        raise HTTPException(status_code=400, detail="Product already in favorites")

    db.execute(models.favorites.insert().values(
        user_id=user.get('id'),
        product_id=product_id
    ))
    db.commit()
    return {"message": "Product added to favorites"}

@app.delete("/products/{product_id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_favorites(
    product_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = db.execute(models.favorites.delete().where(
        models.favorites.c.user_id == user.get('id'),
        models.favorites.c.product_id == product_id
    ))
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")

@app.get("/users/me/favorites", response_model=List[ProductModel])
async def get_user_favorites(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    products = db.query(models.Product).join(
        models.favorites,
        models.Product.id == models.favorites.c.product_id
    ).filter(models.favorites.c.user_id == user.get('id')).all()
    return products

@app.get("/users/me/products")
async def get_user_products(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    products = db.query(models.Product).filter(
        models.Product.owner_id == user.get('id')
    ).all()
    
    for product in products:
        if product.bid_date < datetime.now() and product.is_active:
            product.is_active = False
            db.commit()
    
    return products

@app.get("/products/{product_id}/favorite-status")
async def check_favorite_status(
    product_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    is_favorite = db.query(models.favorites).filter(
        models.favorites.c.user_id == user.get('id'),
        models.favorites.c.product_id == product_id
    ).first() is not None
    return {"is_favorite": is_favorite}

@app.patch("/products/{product_id}/close", status_code=status.HTTP_200_OK)
async def close_auction(
    product_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.owner_id != user.get('id'):
        raise HTTPException(status_code=403, detail="Not your product")

    product.is_active = False
    db.commit()
    return {"message": "Auction closed successfully"}

@app.get("/users/me/won", response_model=List[ProductModel])
async def get_user_won_products(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    products = db.query(models.Product).filter(
        models.Product.is_active == False,
        models.Product.max_bid_user_id == user.get('id')
    ).all()
    return products