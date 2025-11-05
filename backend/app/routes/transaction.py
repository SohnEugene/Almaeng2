from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from app.models.models import Transaction, CreateTransactionRequest
from app.services.firebase import firebase_service
from app.services.payment import payment_service
from app.utils.helpers import generate_receipt_number

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"]
)


@router.get("/", response_model=List[Transaction])
async def get_all_transactions(
    kiosk_id: Optional[str] = Query(None, description="Filter by kiosk ID"),
    limit: Optional[int] = Query(100, description="Maximum number of transactions to return")
):
    """
    Get all transactions with optional filters

    Args:
        kiosk_id: Optional kiosk ID filter
        limit: Maximum number of results

    Returns:
        List of transactions
    """
    try:
        if kiosk_id:
            transactions = await firebase_service.get_transactions_by_kiosk(kiosk_id)
        else:
            transactions = await firebase_service.get_all_transactions(limit=limit)

        return transactions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching transactions: {str(e)}"
        )


@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(transaction_id: str):
    """
    Get a specific transaction by ID

    Args:
        transaction_id: Transaction ID

    Returns:
        Transaction details
    """
    try:
        transaction = await firebase_service.get_transaction_by_id(transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {transaction_id} not found"
            )
        return transaction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching transaction: {str(e)}"
        )


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_transaction(transaction_request: CreateTransactionRequest):
    """
    Create a new transaction and initialize payment

    Args:
        transaction_request: Transaction creation data

    Returns:
        Created transaction details with payment information
    """
    try:
        # Verify kiosk exists
        kiosk = await firebase_service.get_kiosk_by_id(transaction_request.kiosk_id)
        if not kiosk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kiosk with ID {transaction_request.kiosk_id} not found"
            )

        # Prepare transaction data
        transaction_data = transaction_request.model_dump()
        transaction_data['timestamp'] = datetime.now()
        transaction_data['payment_status'] = 'pending'
        transaction_data['receipt_number'] = generate_receipt_number()

        # Create transaction in database
        transaction_id = await firebase_service.create_transaction(transaction_data)

        # Initialize payment
        payment_data = {
            "transaction_id": transaction_id,
            "amount": transaction_request.total_amount,
            "payment_method": transaction_request.payment_method,
            "customer_id": transaction_request.customer_id
        }

        payment_result = await payment_service.initialize_payment(payment_data)

        return {
            "message": "Transaction created successfully",
            "transaction_id": transaction_id,
            "receipt_number": transaction_data['receipt_number'],
            "payment_info": payment_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating transaction: {str(e)}"
        )


@router.post("/{transaction_id}/confirm", response_model=dict)
async def confirm_transaction(transaction_id: str):
    """
    Confirm a transaction payment

    Args:
        transaction_id: Transaction ID to confirm

    Returns:
        Payment confirmation details
    """
    try:
        # Check if transaction exists
        transaction = await firebase_service.get_transaction_by_id(transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {transaction_id} not found"
            )

        # Confirm payment
        payment_id = f"PAY_{transaction_id}"
        payment_result = await payment_service.confirm_payment(payment_id)

        # Update transaction status
        if payment_result.get('status') == 'success':
            await firebase_service.update_kiosk(
                transaction_id,
                {"payment_status": "completed"}
            )

        return {
            "message": "Transaction confirmed successfully",
            "transaction_id": transaction_id,
            "payment_result": payment_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error confirming transaction: {str(e)}"
        )


@router.post("/{transaction_id}/cancel", response_model=dict)
async def cancel_transaction(transaction_id: str, reason: Optional[str] = None):
    """
    Cancel a pending transaction

    Args:
        transaction_id: Transaction ID to cancel
        reason: Optional cancellation reason

    Returns:
        Cancellation confirmation
    """
    try:
        # Check if transaction exists
        transaction = await firebase_service.get_transaction_by_id(transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {transaction_id} not found"
            )

        if transaction.get('payment_status') != 'pending':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only pending transactions can be cancelled"
            )

        # Cancel payment
        payment_id = f"PAY_{transaction_id}"
        payment_result = await payment_service.cancel_payment(payment_id, reason)

        # Update transaction status
        if payment_result.get('status') == 'success':
            await firebase_service.update_kiosk(
                transaction_id,
                {"payment_status": "cancelled"}
            )

        return {
            "message": "Transaction cancelled successfully",
            "transaction_id": transaction_id,
            "payment_result": payment_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling transaction: {str(e)}"
        )


@router.post("/{transaction_id}/refund", response_model=dict)
async def refund_transaction(
    transaction_id: str,
    amount: Optional[float] = Query(None, description="Partial refund amount (full refund if not specified)")
):
    """
    Refund a completed transaction

    Args:
        transaction_id: Transaction ID to refund
        amount: Optional partial refund amount

    Returns:
        Refund confirmation
    """
    try:
        # Check if transaction exists
        transaction = await firebase_service.get_transaction_by_id(transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {transaction_id} not found"
            )

        if transaction.get('payment_status') != 'completed':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only completed transactions can be refunded"
            )

        # Process refund
        payment_id = f"PAY_{transaction_id}"
        payment_result = await payment_service.refund_payment(payment_id, amount)

        # Update transaction status
        if payment_result.get('status') == 'success':
            await firebase_service.update_kiosk(
                transaction_id,
                {"payment_status": "refunded"}
            )

        return {
            "message": "Transaction refunded successfully",
            "transaction_id": transaction_id,
            "payment_result": payment_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error refunding transaction: {str(e)}"
        )


@router.get("/{transaction_id}/receipt", response_model=dict)
async def get_transaction_receipt(transaction_id: str):
    """
    Get transaction receipt details

    Args:
        transaction_id: Transaction ID

    Returns:
        Receipt information
    """
    try:
        transaction = await firebase_service.get_transaction_by_id(transaction_id)
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction with ID {transaction_id} not found"
            )

        # Format receipt data
        receipt = {
            "receipt_number": transaction.get('receipt_number'),
            "transaction_id": transaction_id,
            "kiosk_id": transaction.get('kiosk_id'),
            "items": transaction.get('items', []),
            "total_amount": transaction.get('total_amount'),
            "payment_method": transaction.get('payment_method'),
            "payment_status": transaction.get('payment_status'),
            "timestamp": transaction.get('timestamp')
        }

        return receipt
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching receipt: {str(e)}"
        )
