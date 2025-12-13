# /payments 로 들어오는 API 요청들을 처리하는 파일

import base64
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Query, status

from app.exceptions import (
    InvalidManagerException,
    InvalidPaymentTypeException,
    PaymentAlreadyCompletedException,
    ProductNotAvailableException,
)
from app.models import (
    PaymentApproveRequest,
    PaymentApproveResponse,
    PaymentRequest,
    PaymentResponse,
)
from app.services.firebase import firebase_service
from app.services.qrcode_generator import qrcode_service

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
    # 1. Validate kiosk and product exist
    kiosk = firebase_service.get_kiosk_by_id(request.kid)
    firebase_service.get_product_by_id(request.pid)

    # 2. Validate product is available at kiosk
    product_pids = [p.get("pid") for p in kiosk.products if isinstance(p, dict)]
    if not kiosk.products or request.pid not in product_pids:
        raise ProductNotAvailableException(request.pid, request.kid)

    # 3. Validate payment method
    valid_payment_methods = ["kakaopay", "tosspay"]
    if request.payment_method not in valid_payment_methods:
        raise InvalidPaymentTypeException(request.payment_method)

    # 4. Validate manager
    valid_managers = ["KIM", "SOHN", "AHN", "LEE", "HWANG"]
    if request.manager.upper() not in valid_managers:
        raise InvalidManagerException(request.manager, valid_managers)

    # 5. Generate QR code (validation already done in router)
    qr_img_io = qrcode_service.generate_qr_code(
        payment_method=request.payment_method,
        manager=request.manager.upper(),
        amount=request.total_price
    )
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
        PaymentApproveRequest: Payment approval request with txid

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