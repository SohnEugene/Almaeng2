from pydantic import BaseModel
from typing import List, Optional


class Product(BaseModel):
    pid: str  # product_id
    name: str
    price: float
    description: str = ""
    image_url: str = ""
    tags: List[str] = []
    original_price: Optional[int] = None
    original_gram: Optional[int] = None


class RegisterProductRequest(BaseModel):
    name: str
    price: float
    description: str = ""
    image_url: str = ""
    tags: List[str] = []
    original_price: Optional[int] = None
    original_gram: Optional[int] = None


class RegisterProductResponse(BaseModel):
    pid: str  # product_id


class UpdateProductResponse(BaseModel):
    message: str


class DeleteProductResponse(BaseModel):
    message: str


class UploadProductImageResponse(BaseModel):
    message: str
    s3_key: str


class GetProductImageUrlResponse(BaseModel):
    url: str
    expires_in: int
