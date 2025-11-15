from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class Payment(BaseModel): 
    txid: str                     # 내부 시스템에서 생성된 거래 ID
    kid: str                      # Kiosk ID
    pid: str                      # Product ID
    amount_grams: int
    extra_bottle: bool
    product_price: int
    total_price: int
    payment_method: str            # kakao/toss 등
    manager: str
    status: str = "ONGOING"        # 초기 상태: ONGOING
    created_at: datetime = datetime.now()
    approved_at: Optional[datetime] = None


class PaymentRequest(BaseModel):
    """Request model for payment preparation"""
    kid: str  # kiosk_id
    pid: str  # product_id
    amount_grams: int
    extra_bottle: bool
    product_price: int
    total_price: int
    payment_method: str
    manager: str

class PaymentResponse(BaseModel):
    """Response model for payment preparation"""
    txid: str
    qr_code_base64: Optional[str] = None


class PaymentApproveRequest(BaseModel):
    """Request model for payment approval"""
    txid: str

class PaymentApproveResponse(BaseModel):
    """Response model for payment approval"""
    message: str  # "success", "failed", etc.
