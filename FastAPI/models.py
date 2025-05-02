from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Table
from sqlalchemy.orm import relationship
from database import Base

favorites = Table(
    'favorites',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('product_id', Integer, ForeignKey('products.id', ondelete="CASCADE"), primary_key=True)
)


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

    owner = relationship("User", back_populates="products")
    favorited_by = relationship("User", secondary=favorites, back_populates="favorites")


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    products = relationship("Product", back_populates="owner")
    favorites = relationship("Product", secondary=favorites, back_populates="favorited_by")
