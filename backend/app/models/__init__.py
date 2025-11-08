"""
Models package for the Kiosk Management API

This package contains Pydantic models organized by domain:
- product: Product-related models and API request/response models
- kiosk: Kiosk-related models and API request/response models
- payment: Payment-related API request/response models
"""

# Product models
from app.models.product import (
    Product,
    CreateProductRequest,
    CreateProductResponse,
    UpdateProductRequest,
    ProductListResponse
)

# Kiosk models
from app.models.kiosk import (
    CreateKioskRequest,
    CreateKioskResponse,
    AddProductToKioskRequest,
    AddProductToKioskResponse,
    ProductSoldOutRequest
)

# Payment models
from app.models.payment import (
    PaymentPrepareRequest,
    PaymentPrepareResponse,
    PaymentApproveRequest,
    PaymentApproveResponse
)

__all__ = [
    # Product
    "Product",
    "CreateProductRequest",
    "CreateProductResponse",
    "UpdateProductRequest",
    "ProductListResponse",
    # Kiosk
    "CreateKioskRequest",
    "CreateKioskResponse",
    "AddProductToKioskRequest",
    "AddProductToKioskResponse",
    "ProductSoldOutRequest",
    # Payment
    "PaymentPrepareRequest",
    "PaymentPrepareResponse",
    "PaymentApproveRequest",
    "PaymentApproveResponse",
]
