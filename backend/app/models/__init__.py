"""
Models package for the Kiosk Management API

This package contains Pydantic models organized by domain:
- kiosk: Kiosk-related models and API request/response models
- payment: Payment-related API request/response models
"""

# Kiosk models
from app.models.kiosk import (
    Product,
    CreateKioskRequest,
    CreateKioskResponse,
    AddProductToKioskRequest,
    AddProductToKioskResponse,
    ProductSoldOutRequest,
    CreateProductRequest,
    CreateProductResponse
)

# Payment models
from app.models.payment import (
    PaymentPrepareRequest,
    PaymentPrepareResponse,
    PaymentApproveRequest,
    PaymentApproveResponse
)

__all__ = [
    # Kiosk
    "Product",
    "CreateKioskRequest",
    "CreateKioskResponse",
    "AddProductToKioskRequest",
    "AddProductToKioskResponse",
    "ProductSoldOutRequest",
    "CreateProductRequest",
    "CreateProductResponse",
    # Payment
    "PaymentPrepareRequest",
    "PaymentPrepareResponse",
    "PaymentApproveRequest",
    "PaymentApproveResponse",
]
