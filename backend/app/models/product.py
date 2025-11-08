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
    pid: str  # product_id


class UpdateProductRequest(BaseModel):
    """Request model for updating a product"""
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    available: Optional[bool] = None


class ProductListResponse(BaseModel):
    """Response model for product list"""
    products: List[Product]
    total: int
