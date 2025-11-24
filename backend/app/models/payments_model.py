from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class Payment(BaseModel):
    txid: str # 거래 ID
    kid: str
    pid: str 
    amount_grams: int
    extra_bottle: bool
    product_price: int
    total_price: int
    payment_method: str 
    manager: str
    status: str = "ONGOING"
    completed: bool = False 
    created_at: datetime = datetime.now()
    approved_at: Optional[datetime] = None


class PaymentRequest(BaseModel):
    kid: str
    pid: str
    amount_grams: int
    extra_bottle: bool
    product_price: int
    total_price: int
    payment_method: str
    manager: str

class PaymentResponse(BaseModel):
    txid: str
    qr_code_base64: Optional[str] = None


class PaymentApproveRequest(BaseModel):
    txid: str

class PaymentApproveResponse(BaseModel):
    message: str
