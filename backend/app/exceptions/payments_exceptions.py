from fastapi import HTTPException, status

class PaymentException(HTTPException):
    """Base exception for payment-related errors."""
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(
            detail=detail,
            status_code=status_code
        )


# --- Prepare 단계 관련 ---
class PaymentPreparationException(PaymentException):
    """Raised when payment preparation fails (e.g., QR code generation)."""
    def __init__(self, reason: str):
        super().__init__(
            detail=f"Payment preparation failed: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class UnsupportedPaymentMethodException(PaymentException):
    """Raised when an unsupported payment method is requested."""
    def __init__(self, method: str):
        super().__init__(
            detail=f"Payment method '{method}' is not supported.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ProductNotAvailableException(PaymentException):
    """Raised when the product is not available at the specified kiosk."""
    def __init__(self, pid: str, kid: str):
        super().__init__(
            detail=f"Product {pid} is not available at kiosk {kid}",
            status_code=status.HTTP_400_BAD_REQUEST
        )


# --- Approve 단계 관련 ---
class PaymentApprovalException(PaymentException):
    """Raised when payment approval fails after user completes the payment."""
    def __init__(self, txid: str, reason: str):
        super().__init__(
            detail=f"Payment approval failed for transaction '{txid}': {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class PaymentAlreadyCompletedException(PaymentException):
    """Raised when a transaction is already completed and cannot be approved again."""
    def __init__(self, txid: str):
        super().__init__(
            detail=f"Transaction '{txid}' is already completed",
            status_code=status.HTTP_400_BAD_REQUEST
        )


# --- Transaction 조회/관리 관련 ---
class PaymentNotFoundException(PaymentException):
    """Raised when a transaction/payment is not found (e.g., invalid txid)."""
    def __init__(self, txid: str):
        super().__init__(
            detail=f"Transaction '{txid}' not found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class TransactionStorageException(PaymentException):
    """Raised when saving or updating transaction in DB fails."""
    def __init__(self, txid: str, reason: str):
        super().__init__(
            detail=f"Failed to store transaction '{txid}': {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
