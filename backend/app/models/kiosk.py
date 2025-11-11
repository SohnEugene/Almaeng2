from pydantic import BaseModel
from typing import List, Optional


class CreateKioskRequest(BaseModel):
    """Request model for creating a new kiosk"""
    name: str
    location: str


class CreateKioskResponse(BaseModel):
    """Response model for kiosk creation"""
    kid: str  # kiosk_id


class AddProductToKioskRequest(BaseModel):
    """Request model for adding a product to a kiosk"""
    pid: str  # product_id


class AddProductToKioskResponse(BaseModel):
    """Response model for adding a product to a kiosk"""
    message: str
    pid: str


class ProductSoldOutRequest(BaseModel):
    """Request model for marking product as sold out"""
    pid: str  # product_id
    sold_out: bool


class ProductSoldoutResponse(BaseModel):
    """Response model for marking product as sold out"""
    message: str
    pid: str
