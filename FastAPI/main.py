from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import auth
from auth import get_current_user

app = FastAPI()
app.include_router(auth.router)

origins = [
    'http://localhost:3000',
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


class ProductModel(ProductBase):
    id: int

    class Config:
        from_attributes = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]


@app.post("/products/", response_model=ProductModel, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductBase,
    db: db_dependency,
    user: user_dependency
):
    db_product = models.Product(**product.dict(), owner_id=user.get('id'))
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@app.get("/products/", response_model=List[ProductModel])
async def read_products(db: db_dependency, skip: int = 0, limit: int = 100):
    return db.query(models.Product).offset(skip).limit(limit).all()


@app.get("/products/{product_id}", response_model=ProductModel)
async def read_product(product_id: int, db: db_dependency):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Добавим после существующих эндпоинтов

@app.post("/products/{product_id}/favorite", status_code=status.HTTP_201_CREATED)
async def add_to_favorites(
    product_id: int,
    db: db_dependency,
    user: user_dependency
):
    # Проверяем существование товара
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Проверяем, не добавлен ли уже в избранное
    if db.query(models.favorites).filter(
        models.favorites.c.user_id == user.get('id'),
        models.favorites.c.product_id == product_id
    ).first():
        raise HTTPException(status_code=400, detail="Product already in favorites")

    # Добавляем в избранное
    db.execute(models.favorites.insert().values(
        user_id=user.get('id'),
        product_id=product_id
    ))
    db.commit()
    return {"message": "Product added to favorites"}

@app.delete("/products/{product_id}/favorite", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_favorites(
    product_id: int,
    db: db_dependency,
    user: user_dependency
):
    result = db.execute(models.favorites.delete().where(
        models.favorites.c.user_id == user.get('id'),
        models.favorites.c.product_id == product_id
    ))
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")

@app.get("/users/me/favorites", response_model=List[ProductModel])
async def get_user_favorites(db: db_dependency, user: user_dependency):
    products = db.query(models.Product).join(
        models.favorites,
        models.Product.id == models.favorites.c.product_id
    ).filter(models.favorites.c.user_id == user.get('id')).all()
    return products

@app.get("/users/me/products", response_model=List[ProductModel])
async def get_user_products(db: db_dependency, user: user_dependency):
    products = db.query(models.Product).filter(
        models.Product.owner_id == user.get('id')
    ).all()
    return products
