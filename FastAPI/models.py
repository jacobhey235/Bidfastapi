from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, Table, TypeDecorator
import json
from sqlalchemy.orm import relationship
from database import Base

favorites = Table(
    'favorites',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.id', ondelete="CASCADE"), primary_key=True)
)


class JSONList(TypeDecorator):
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, str):  # Если вдруг передали строку
            return value
        return json.dumps(value)  # Список -> JSON-строка

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        if isinstance(value, list):  # Если уже список (например, из кэша)
            return value
        try:
            return json.loads(value)  # JSON-строка -> список
        except (json.JSONDecodeError, TypeError):
            return []  # Если не JSON, возвращаем пустой список

class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    category = Column(String)
    description = Column(String)
    bid_date = Column(DateTime)
    cur_bid = Column(Float)
    owner_id = Column(Integer, ForeignKey('users.id'))
    is_active = Column(Boolean, default=True)
    max_bid_user_id = Column(Integer, ForeignKey('users.id'))
    images = Column(JSONList, nullable=False, default=[])

    owner = relationship("User", foreign_keys=[owner_id], back_populates="products")
    max_bid_user = relationship("User", foreign_keys=[max_bid_user_id])
    favorited_by = relationship(
        "User", 
        secondary=favorites, 
        back_populates="favorites"
    )

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    products = relationship(
        "Product", 
        foreign_keys="Product.owner_id",
        back_populates="owner"
    )
    favorites = relationship(
        "Product",
        secondary=favorites,
        back_populates="favorited_by"
    )