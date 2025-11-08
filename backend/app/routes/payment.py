from fastapi import APIRouter, HTTPException, status
from app.models import (
    PaymentPrepareRequest,
    PaymentPrepareResponse,
    PaymentApproveRequest,
    PaymentApproveResponse
)
from app.services.payment import payment_service
from app.services.firebase import firebase_service
from datetime import datetime
import secrets

router = APIRouter(
    prefix="/payment",
    tags=["payment"]
)


@router.post("/prepare", response_model=PaymentPrepareResponse, status_code=status.HTTP_200_OK)
async def prepare_payment(request: PaymentPrepareRequest):
    """
    Prepare a payment and get redirect URL

    This endpoint initiates a payment process with Kakao Pay.
    The server generates a tid and redirect URL for payment completion.

    Args:
        request: PaymentPrepareRequest containing payment details
            - kid: Kiosk ID
            - pid: Product ID
            - amount_grams: Amount in grams
            - extra_bottle: Extra bottle included
            - product_price: Product price
            - total_price: Total price
            - payment_method: Payment method (e.g., "kakaopay")

    Returns:
        PaymentPrepareResponse with tid and next_redirect_pc_url
    """
    try:
        # Verify kiosk exists
        kiosk = await firebase_service.get_kiosk_by_id(request.kid)
        if not kiosk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kiosk with ID {request.kid} not found"
            )

        # Verify product exists and get product name
        product = await firebase_service.get_product_by_id(request.pid)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {request.pid} not found"
            )

        # Check if product is available at this specific kiosk
        kiosk_products = kiosk.get('products', [])
        product_available = False

        for kiosk_prod in kiosk_products:
            # Handle both old format (string) and new format (dict)
            if isinstance(kiosk_prod, str):
                if kiosk_prod == request.pid:
                    product_available = True
                    break
            else:
                if kiosk_prod.get('pid') == request.pid:
                    product_available = kiosk_prod.get('available', True)
                    break

        if not product_available:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {request.pid} is currently not available at this kiosk"
            )

        # Prepare payment data for Kakao Pay service
        payment_data = {
            "kiosk_id": request.kid,
            "product_id": request.pid,
            "product_name": product.get("name", "Product"),
            "amount_grams": request.amount_grams,
            "extra_bottle": request.extra_bottle,
            "product_price": request.product_price,
            "total_price": request.total_price
        }

        # Handle different payment methods
        if request.payment_method.lower() == "kakaopay":
            result = await payment_service.kakao_pay_prepare(payment_data)

            return PaymentPrepareResponse(
                tid=result["tid"],
                next_redirect_pc_url=result["next_redirect_pc_url"]
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Payment method '{request.payment_method}' is not currently supported. Use 'kakaopay'."
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error preparing payment: {str(e)}"
        )


@router.post("/approve", response_model=PaymentApproveResponse, status_code=status.HTTP_200_OK)
async def approve_payment(request: PaymentApproveRequest):
    """
    Approve a payment after user completes payment

    This endpoint is called after the user completes the payment
    and is redirected back from Kakao Pay.

    Args:
        request: PaymentApproveRequest containing:
            - tid: Transaction ID from prepare step
            - pg_token: Payment gateway token from Kakao Pay

    Returns:
        PaymentApproveResponse with txid, status, and approved_at
    """
    try:
        # Approve payment with Kakao Pay
        result = await payment_service.kakao_pay_approve(
            tid=request.tid,
            pg_token=request.pg_token
        )

        # Generate unique transaction ID
        txid = f"txn_{secrets.token_hex(8)}"

        # Get original payment data from result (returned by kakao_pay_approve)
        payment_data = result.get("payment_data", {})

        # Create transaction record in Firebase with all payment details
        transaction_data = {
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

        # Store transaction in Firebase
        try:
            await firebase_service.create_transaction(transaction_data)
        except Exception as e:
            print(f"Warning: Failed to store transaction in Firebase: {e}")
            # Don't fail the approval if transaction storage fails

        return PaymentApproveResponse(
            txid=txid,
            status=result["status"],
            approved_at=result["approved_at"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error approving payment: {str(e)}"
        )
