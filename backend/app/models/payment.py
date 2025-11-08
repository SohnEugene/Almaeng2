from pydantic import BaseModel


class PaymentPrepareRequest(BaseModel):
    """Request model for payment preparation"""
    kid: str  # kiosk_id
    pid: str  # product_id
    amount_grams: int
    extra_bottle: bool
    product_price: float
    total_price: float
    payment_method: str  # "kakaopay", "card", "naverpay", etc.


class PaymentPrepareResponse(BaseModel):
    """Response model for payment preparation"""
    tid: str  # Transaction ID
    next_redirect_pc_url: str  # Redirect URL for payment


class PaymentApproveRequest(BaseModel):
    """Request model for payment approval"""
    tid: str
    pg_token: str  # Payment gateway token


class PaymentApproveResponse(BaseModel):
    """Response model for payment approval"""
    txid: str  # Transaction ID (서버 생성)
    status: str  # "success", "failed", etc.
    approved_at: str  # ISO 8601 datetime string
