from fastapi import HTTPException, status


class PaymentException(HTTPException):
    """Base exception for payment-related errors."""
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(
            detail=detail,
            status_code=status_code
        )


class KioskNotFoundForPaymentException(PaymentException):
    """Raised when the kiosk for payment is not found."""
    def __init__(self, kid: str):
        super().__init__(
            detail=f"Kiosk {kid} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class ProductNotFoundForPaymentException(PaymentException):
    """Raised when the product for payment is not found."""
    def __init__(self, pid: str):
        super().__init__(
            detail=f"Product {pid} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class ProductNotAvailableException(PaymentException):
    """Raised when the product is not available at the specified kiosk."""
    def __init__(self, pid: str, kid: str):
        super().__init__(
            detail=f"Product {pid} is not available at kiosk {kid}",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class UnsupportedPaymentMethodException(PaymentException):
    """Raised when an unsupported payment method is requested."""
    def __init__(self, method: str):
        super().__init__(
            detail=f"Payment method '{method}' is not supported. Currently only 'kakaopay' is supported.",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class PaymentPreparationException(PaymentException):
    """Raised when payment preparation fails."""
    def __init__(self, reason: str):
        super().__init__(
            detail=f"Error preparing payment: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class PaymentApprovalException(PaymentException):
    """Raised when payment approval fails."""
    def __init__(self, reason: str):
        super().__init__(
            detail=f"Error approving payment: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class TransactionStorageException(PaymentException):
    """Raised when storing transaction data fails (non-critical)."""
    def __init__(self, reason: str):
        super().__init__(
            detail=f"Warning: Failed to store transaction data: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
