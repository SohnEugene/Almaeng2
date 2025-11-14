# /kiosks로 들어오는 요청을 처리하는 데 필요한 객체

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class Kiosk(BaseModel):
    kid: Optional[str] = None
    name: str = Field(..., min_length=1, description="Kiosk name must not be empty")
    location: str = Field(..., min_length=1, description="Kiosk location must not be empty")
    status: str = "active"
    products: List[Dict[str, Any]] = []  # List of {"pid": str, "available": bool}


class RegisterKioskRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Kiosk name must not be empty")
    location: str = Field(..., min_length=1, description="Kiosk location must not be empty")

class RegisterKioskResponse(BaseModel):
    kid: str


class AddProductToKioskRequest(BaseModel):
    pid: str

class AddProductToKioskResponse(BaseModel):
    message: str


class KioskProductItem(BaseModel):
    """Single product with kiosk-specific availability"""
    product: dict  # Product dict to avoid circular import issues
    available: bool

class GetKioskProductsResponse(BaseModel):
    """Response model for getting all products at a kiosk"""
    products: List[KioskProductItem]


class UpdateProductStatusRequest(BaseModel):
    available: bool

class UpdateProductStatusResponse(BaseModel):
    message: str
