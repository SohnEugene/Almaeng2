# /payments 로 들어오는 API 요청들을 처리하는 파일

from fastapi import APIRouter, status, Query
from typing import List, Optional
from app.models import (
    PaymentRequest,
    PaymentResponse,
    PaymentApproveRequest,
    PaymentApproveResponse
)
from app.exceptions import (
    ProductNotAvailableException,
    PaymentAlreadyCompletedException,
)
from app.services.firebase import firebase_service
from app.services.qrcode_generator import qrcode_service
from datetime import datetime
import base64

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_200_OK)
async def request_payment(request: PaymentRequest):
    """
    Prepare a payment and generate QR code

    Args:
        PaymentRequest: Payment request containing kid, pid, amount_grams, extra_bottle, product_price, total_price, product_method, and manager

    Returns:
        PaymentResponse: Transaction ID (txid) and QR code (base64)

    Raises:
        KioskNotFoundException: 404 if kiosk not found
        ProductNotFoundException: 404 if product not found
        ProductNotAvailableException: 400 if product not available at kiosk
        InvalidPaymentTypeException: 400 if payment type is invalid
        InvalidManagerException: 400 if manager is invalid
        QRCodeGenerationException: 500 if QR code generation fails
        KioskException: 500 for kiosk-related errors
        ProductException: 500 for product-related errors
        PaymentException: 500 for transaction creation errors
    """
    kiosk = firebase_service.get_kiosk_by_id(request.kid)
    firebase_service.get_product_by_id(request.pid)
    
    product_pids = [p.get("pid") for p in kiosk.products if isinstance(p, dict)]
    if not kiosk.products or request.pid not in product_pids:
        raise ProductNotAvailableException(request.pid, request.kid)
    
    qrcode_service.set_payment_info(
        request.payment_method,
        request.manager,
        request.total_price
    )
    qr_img_io = qrcode_service.generate_qr_img()
    qr_base64 = base64.b64encode(qr_img_io.getvalue()).decode("utf-8")

    payment_data = request.model_dump()
    txid = firebase_service.create_transaction(payment_data)

    return PaymentResponse(
        txid=txid,
        qr_code_base64=qr_base64
    )



@router.post("/approve", response_model=PaymentApproveResponse, status_code=status.HTTP_200_OK)
async def approve_payment(request: PaymentApproveRequest):
    """
    Approve a payment after user completes payment

    Args:
        request (PaymentApproveRequest): Payment approval request with txid

    Returns:
        PaymentApproveResponse: Success message

    Raises:
        PaymentNotFoundException: 404 if transaction not found
        PaymentAlreadyCompletedException: 400 if payment already completed
        PaymentException: 500 for database or other payment-related errors
    """
    transaction = firebase_service.get_transaction_by_id(request.txid)

    if transaction.completed:
        raise PaymentAlreadyCompletedException(request.txid)

    updates = {
        "status": "COMPLETED",
        "completed": True,
        "approved_at": datetime.now()
    }
    firebase_service.update_transaction(request.txid, updates)

    return PaymentApproveResponse(message="success")



@router.get("/transactions", response_model=List[dict], status_code=status.HTTP_200_OK)
async def get_transactions(
    kiosk_id: Optional[str] = Query(None, description="Filter by kiosk ID"),
    limit: Optional[int] = Query(None, description="Limit number of results")
):
    """
    Get all transactions with optional filters

    Args:
        kiosk_id (Optional[str]): Optional kiosk ID to filter transactions
        limit (Optional[int]): Optional limit on number of results

    Returns:
        List[dict]: List of transaction objects

    Raises:
        PaymentException: 500 for database or other payment-related errors
    """
    if kiosk_id:
        transactions = firebase_service.get_transactions_by_kiosk(kiosk_id)
    else:
        transactions = firebase_service.get_all_transactions(limit=limit)
    return transactions