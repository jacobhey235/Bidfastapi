from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from database import Base


class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    category = Column(String)
    description = Column(String)
    bid_date = Column(DateTime)
    cur_bid = Column(Float)


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
