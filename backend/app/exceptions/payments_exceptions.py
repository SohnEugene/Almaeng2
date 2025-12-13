from fastapi import HTTPException, status


class PaymentException(HTTPException):
    """Base exception for payment-related errors."""

    def __init__(
        self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    ):
        super().__init__(detail=detail, status_code=status_code)


class ProductNotAvailableException(PaymentException):
    """Raised when the product is not available at the specified kiosk."""

    def __init__(self, pid: str, kid: str):
        super().__init__(
            detail=f"Product {pid} is not available at kiosk {kid}",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class PaymentAlreadyCompletedException(PaymentException):
    """Raised when a transaction is already completed and cannot be approved again."""

    def __init__(self, txid: str):
        super().__init__(
            detail=f"Transaction '{txid}' is already completed",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


# --- Transaction 조회/관리 관련 ---
class PaymentNotFoundException(PaymentException):
    """Raised when a transaction/payment is not found (e.g., invalid txid)."""

    def __init__(self, txid: str):
        super().__init__(
            detail=f"Transaction '{txid}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )


# --- Payment Validation Exceptions (used in Router layer) ---
class InvalidPaymentTypeException(PaymentException):
    """Raised when an invalid payment type is provided (validation at router layer)."""

    def __init__(self, pay_type: str):
        super().__init__(
            detail=f"Invalid payment type: {pay_type}. Must be 'kakaopay' or 'tosspay'",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


class InvalidManagerException(PaymentException):
    """Raised when an invalid manager is provided (validation at router layer)."""

    def __init__(self, manager: str, valid_managers: list):
        super().__init__(
            detail=f"Invalid manager: {manager}. Must be one of: {', '.join(valid_managers)}",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
