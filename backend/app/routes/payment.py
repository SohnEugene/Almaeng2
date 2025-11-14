from fastapi import APIRouter, status
from fastapi.responses import StreamingResponse
from app.models import (
    PaymentPrepareRequest,
    PaymentApproveRequest,
    PaymentApproveResponse
)
from app.exceptions import (
    KioskNotFoundForPaymentException,
    ProductNotFoundForPaymentException,
    ProductNotAvailableException,
    UnsupportedPaymentMethodException,
    PaymentPreparationException,
    PaymentApprovalException
)
from app.services.payment import payment_service
from app.services.firebase import firebase_service
from app.services.generate_qrcode import qrcode_service
from datetime import datetime
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/payment",
    tags=["payment"]
)


@router.post("/prepare", status_code=status.HTTP_200_OK)
async def prepare_payment(request: PaymentPrepareRequest):
    """
    Prepare a payment and generate QR code for Kakao Pay.

    This endpoint validates the kiosk and product, checks product availability,
    and returns a QR code image for payment processing.

    Args:
        request: PaymentPrepareRequest containing payment details
            - kid: Kiosk ID
            - pid: Product ID
            - amount_grams: Amount in grams
            - extra_bottle: Extra bottle included
            - product_price: Product price
            - total_price: Total price
            - payment_method: Payment method (currently only "kakaopay" is supported)

    Returns:
        StreamingResponse with QR code image (PNG)

    Raises:
        KioskNotFoundForPaymentException: If kiosk is not found
        ProductNotFoundForPaymentException: If product is not found
        ProductNotAvailableException: If product is not available at the kiosk
        UnsupportedPaymentMethodException: If payment method is not supported
        PaymentPreparationException: If payment preparation fails
    """
    try:
        # Validate kiosk and product exist
        kiosk = firebase_service.get_kiosk_by_id(request.kid)
        if not kiosk:
            raise KioskNotFoundForPaymentException(request.kid)

        product = firebase_service.get_product_by_id(request.pid)
        if not product:
            raise ProductNotFoundForPaymentException(request.pid)

        # Check product availability at this kiosk
        _validate_product_availability(kiosk, request.pid)

        # Generate payment based on method
        if request.payment_method.lower() == "kakaopay":
            return _generate_kakaopay_qr(request.total_price)
        else:
            raise UnsupportedPaymentMethodException(request.payment_method)

    except (
        KioskNotFoundForPaymentException,
        ProductNotFoundForPaymentException,
        ProductNotAvailableException,
        UnsupportedPaymentMethodException
    ):
        raise
    except Exception as e:
        logger.error(f"Unexpected error in prepare_payment: {e}", exc_info=True)
        raise PaymentPreparationException(str(e))


def _validate_product_availability(kiosk, product_id: str) -> None:
    """
    Validate that a product is available at the given kiosk.

    Args:
        kiosk: Kiosk object containing products list
        product_id: Product ID to check

    Raises:
        ProductNotAvailableException: If product is not available at the kiosk
    """
    kiosk_products = kiosk.products or []
    available = any(
        kp.get('pid') == product_id and kp.get('available', False)
        for kp in kiosk_products
    )

    if not available:
        raise ProductNotAvailableException(product_id, kiosk.kid)


def _generate_kakaopay_qr(amount: float) -> StreamingResponse:
    """
    Generate Kakao Pay QR code for the given amount.

    Args:
        amount: Payment amount

    Returns:
        StreamingResponse with QR code image (PNG)
    """
    img_io = qrcode_service.generate_qr_code(amount)
    return StreamingResponse(img_io, media_type="image/png")


@router.post("/approve", response_model=PaymentApproveResponse, status_code=status.HTTP_200_OK)
async def approve_payment(request: PaymentApproveRequest):
    """
    Approve a payment after user completes payment.

    This endpoint is called after the user completes the payment
    and is redirected back from Kakao Pay.

    Args:
        request: PaymentApproveRequest containing:
            - tid: Transaction ID from prepare step
            - pg_token: Payment gateway token from Kakao Pay

    Returns:
        PaymentApproveResponse with txid, status, and approved_at

    Raises:
        PaymentApprovalException: If payment approval fails
    """
    try:
        # Approve payment with Kakao Pay
        result = await payment_service.kakao_pay_approve(
            tid=request.tid,
            pg_token=request.pg_token
        )

        # Generate unique transaction ID
        txid = _generate_transaction_id()

        # Get original payment data from result (returned by kakao_pay_approve)
        payment_data = result.get("payment_data", {})

        # Create and store transaction record
        transaction_data = _build_transaction_data(txid, payment_data, result)
        _store_transaction_safely(transaction_data)

        return PaymentApproveResponse(
            txid=txid,
            status=result["status"],
            approved_at=result["approved_at"]
        )

    except PaymentApprovalException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in approve_payment: {e}", exc_info=True)
        raise PaymentApprovalException(str(e))


def _generate_transaction_id() -> str:
    """
    Generate a unique transaction ID.

    Returns:
        Transaction ID in format 'txn_{random_hex}'
    """
    return f"txn_{secrets.token_hex(8)}"


def _build_transaction_data(txid: str, payment_data: dict, result: dict) -> dict:
    """
    Build transaction data dictionary for storage.

    Args:
        txid: Generated transaction ID
        payment_data: Payment data from Kakao Pay result
        result: Full result from Kakao Pay approval

    Returns:
        Dictionary containing all transaction data
    """
    return {
        "txid": txid,
        "kid": payment_data.get("kiosk_id"),
        "pid": payment_data.get("product_id"),
        "product_name": payment_data.get("product_name"),
        "amount_grams": payment_data.get("amount_grams"),
        "extra_bottle": payment_data.get("extra_bottle"),
        "product_price": payment_data.get("product_price"),
        "total_price": payment_data.get("total_price"),
        "payment_method": "kakaopay",
        "payment_method_type": result.get("payment_method_type", "UNKNOWN"),
        "tid": result["tid"],
        "status": result["status"],
        "approved_at": result["approved_at"],
        "created_at": datetime.now()
    }


def _store_transaction_safely(transaction_data: dict) -> None:
    """
    Safely store transaction in Firebase.

    This function logs errors but does not raise exceptions,
    as transaction storage failure should not prevent payment approval.

    Args:
        transaction_data: Transaction data to store
    """
    try:
        firebase_service.create_transaction(transaction_data)
    except Exception as e:
        logger.warning(
            f"Failed to store transaction in Firebase: {e}",
            extra={"transaction_id": transaction_data.get("txid")},
            exc_info=True
        )
        # Don't fail the approval if transaction storage fails
