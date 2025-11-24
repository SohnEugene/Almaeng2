"""
Models package for the Kiosk Management API

This package contains Pydantic models organized by domain:
- product: Product-related models and API request/response models
- kiosk: Kiosk-related models and API request/response models
- payment: Payment-related API request/response models
"""

# Kiosk models
from app.models.kiosks_model import (
    Kiosk,
    RegisterKioskRequest,
    RegisterKioskResponse,
    AddProductToKioskRequest,
    AddProductToKioskResponse,
    GetKioskProductsResponse,
    UpdateProductStatusRequest,
    UpdateProductStatusResponse,
    DeleteKioskResponse,
    DeleteProductFromKioskResponse
)

# Product models
from app.models.products_model import (
    Product,
    RegisterProductRequest,
    RegisterProductResponse,
    UpdateProductResponse,
    DeleteProductResponse,
    UploadProductImageResponse,
    GetProductImageUrlResponse
)

# Payment models
from app.models.payments_model import (
    Payment,
    PaymentRequest,
    PaymentResponse,
    PaymentApproveRequest,
    PaymentApproveResponse
)

__all__ = [
    # Kiosk
    "Kiosk",
    "RegisterKioskRequest",
    "RegisterKioskResponse",
    "AddProductToKioskRequest",
    "AddProductToKioskResponse",
    "GetKioskProductsResponse",
    "UpdateProductStatusRequest",
    "UpdateProductStatusResponse",
    "DeleteKioskResponse",
    "DeleteProductFromKioskResponse",
    # Product
    "Product",
    "RegisterProductRequest",
    "RegisterProductResponse",
    "UpdateProductResponse",
    "DeleteProductResponse",
    "UploadProductImageResponse",
    "GetProductImageUrlResponse",
    # Payment
    "Payment",
    "PaymentRequest",
    "PaymentResponse",
    "PaymentApproveRequest",
    "PaymentApproveResponse",
]
