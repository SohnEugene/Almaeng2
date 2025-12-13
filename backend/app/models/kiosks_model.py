# /kiosks로 들어오는 요청을 처리하는 데 필요한 객체

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.models.products_model import Product


class Kiosk(BaseModel):
    kid: Optional[str] = None
    name: str = Field(..., min_length=1, description="Kiosk name must not be empty")
    location: str = Field(
        ..., min_length=1, description="Kiosk location must not be empty"
    )
    status: str = "active"
    products: List[Dict[str, Any]] = []  # List of {"pid": str, "available": bool}


class KioskProductItem(BaseModel):
    product: "Product"
    available: bool


KioskProductItem.model_rebuild()


class RegisterKioskRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Kiosk name must not be empty")
    location: str = Field(
        ..., min_length=1, description="Kiosk location must not be empty"
    )


class RegisterKioskResponse(BaseModel):
    kid: str


class DeleteKioskResponse(BaseModel):
    message: str


class GetKioskProductsResponse(BaseModel):
    products: List[KioskProductItem]


class AddProductToKioskRequest(BaseModel):
    pid: str


class AddProductToKioskResponse(BaseModel):
    message: str


class DeleteProductFromKioskResponse(BaseModel):
    message: str
