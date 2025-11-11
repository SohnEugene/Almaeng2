from pydantic import BaseModel
from typing import List, Optional


class Product(BaseModel):
    """Product model for kiosk items"""
    pid: str  # product_id
    name: str
    price: float
    description: str = ""
    image_url: str = ""
    tags: List[str] = []
    available: bool = True


class CreateProductRequest(BaseModel):
    """Request model for creating a new product"""
    name: str
    price: float
    description: str = ""
    image_url: str = ""
    tags: List[str] = []


class CreateProductResponse(BaseModel):
    """Response model for product creation"""
    message: str
    pid: str  # product_id