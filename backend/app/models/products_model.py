from pydantic import BaseModel
from typing import List, Optional


class Product(BaseModel):
    pid: str  # product_id
    name: str
    price: float
    description: str = ""
    image_url: str = ""
    tags: List[str] = []


class RegisterProductRequest(BaseModel):
    """Request model for creating a new product"""
    name: str
    price: float
    description: str = ""
    image_url: str = ""
    tags: List[str] = []


class RegisterProductResponse(BaseModel):
    """Response model for product creation"""
    pid: str  # product_id