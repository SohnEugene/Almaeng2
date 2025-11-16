from fastapi import APIRouter, status
from fastapi.responses import StreamingResponse
from app.models import (
    Payment,
    PaymentRequest,
    PaymentResponse,
    PaymentApproveRequest,
    PaymentApproveResponse
)
from app.exceptions import (
    ProductNotAvailableException,
    UnsupportedPaymentMethodException,
    PaymentPreparationException,
    PaymentApprovalException,
    PaymentAlreadyCompletedException,
    PaymentNotFoundException
)
from app.services.firebase import firebase_service
from app.services.qrcode_generator import qrcode_service
from datetime import datetime
import base64
from io import BytesIO

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)


@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_200_OK)
async def request_payment(request: PaymentRequest):
    """
    Prepare a payment and generate QR code for Kakao Pay.

    Args:
        request: PaymentPrepareRequest containing payment details
            - kid: Kiosk ID
            - pid: Product ID
            - amount_grams: Amount in grams
            - extra_bottle: Extra bottle included
            - product_price: Product price
            - total_price: Total price
            - payment_method: Payment method (kakaopay, tosspay)

    Returns:
        StreamingResponse with QR code image (PNG)

    Raises:
        ProductNotAvailableException: If the product is not available at the kiosk
        UnsupportedPaymentMethodException: If the payment method is unsupported
        PaymentPreparationException: If QR code generation or transaction creation fails
    """
    try:
        # Validate kiosk exists
        kiosk = firebase_service.get_kiosk_by_id(request.kid)

        # Validate product exists (just for validation, not used further)
        _ = firebase_service.get_product_by_id(request.pid)

        # Check product availability at this kiosk
        # kiosk.products is a list of dicts: [{"pid": "prod_001", "available": True}]
        product_pids = [p.get("pid") for p in kiosk.products if isinstance(p, dict)]
        if not kiosk.products or request.pid not in product_pids:
            raise ProductNotAvailableException(request.pid, request.kid)

        # Validate payment method
        if request.payment_method not in ["kakaopay", "tosspay"]:
            raise UnsupportedPaymentMethodException(request.payment_method)

        # Generate QR code
        try:
            qrcode_service.set_payment_info(
                request.payment_method,
                request.manager,
                request.total_price
            )
            qr_img_io = qrcode_service.generate_qr_img()
            qr_base64 = base64.b64encode(qr_img_io.getvalue()).decode("utf-8")
        except ValueError as ve:
            raise PaymentPreparationException(f"QR code generation failed: {str(ve)}")

        # Create transaction data
        payment_data = {
            "kid": request.kid,
            "pid": request.pid,
            "amount_grams": request.amount_grams,
            "extra_bottle": request.extra_bottle,
            "product_price": request.product_price,
            "total_price": request.total_price,
            "payment_method": request.payment_method,
            "manager": request.manager
        }

        # Save transaction to Firebase
        txid = firebase_service.create_transaction(payment_data)

        return PaymentResponse(
            txid=txid,
            qr_code_base64=qr_base64
        )

    except (ProductNotAvailableException, UnsupportedPaymentMethodException, PaymentPreparationException):
        raise

    except Exception as e:
        raise PaymentPreparationException(f"Unexpected error: {str(e)}")


@router.post("/approve", response_model=PaymentApproveResponse, status_code=200)
async def approve_payment(request: PaymentApproveRequest):
    """
    Approve a payment after the user completes payment.

    Args:
        request: PaymentApproveRequest containing:
            - txid: Transaction ID generated in the prepare step

    Returns:
        PaymentApproveResponse with success or failure message

    Raises:
        PaymentNotFoundException: If the txid does not exist
        PaymentAlreadyCompletedException: If the payment was already approved
        PaymentApprovalException: For other unexpected errors
    """
    try:
        # 1. Get transaction from Firebase
        transaction: Payment = firebase_service.get_transaction_by_id(request.txid)

        # 2. Check if already completed
        if transaction.completed:
            raise PaymentAlreadyCompletedException(request.txid)

        # 3. Update transaction as approved
        updates = {
            "status": "COMPLETED",
            "completed": True,
            "approved_at": datetime.now()
        }

        firebase_service.update_transaction(request.txid, updates)

        return PaymentApproveResponse(message="success")

    except (PaymentNotFoundException, PaymentAlreadyCompletedException) as e:
        raise e 
    except Exception as e:
        raise PaymentApprovalException(request.txid, str(e))