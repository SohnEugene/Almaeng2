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
    KioskRegistrationResponse,
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
    # Kiosk
    "Product",
    "CreateKioskRequest",
    "KioskRegistrationResponse",
    "AddProductToKioskRequest",
    "AddProductToKioskResponse",
    "ProductSoldOutRequest",
    # Payment
    "PaymentPrepareRequest",
    "PaymentPrepareResponse",
    "PaymentApproveRequest",
    "PaymentApproveResponse",
]
