from fastapi import HTTPException, status

class ProductException(HTTPException):
    """Base exception for product-related errors."""
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(
            detail=detail,
            status_code=status_code
        )


class ProductNotFoundException(ProductException):
    """Raised when the requested product cannot be found."""
    def __init__(self, pid: str):
        super().__init__(
            detail=f"Product with ID {pid} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class ProductAlreadyExistsException(ProductException):
    """Raised when trying to add a product that already exists in a kiosk."""
    def __init__(self, detail: str):
        super().__init__(
            detail=detail,
            status_code=status.HTTP_409_CONFLICT
        )


class ProductInvalidDataException(ProductException):
    """Raised when product input data is invalid."""
    def __init__(self, reason: str = ""):
        msg = "Invalid product data"
        if reason:
            msg += f": {reason}"
        super().__init__(
            detail=msg,
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ProductNotAssignedException(ProductException):
    """Raised when a product is not assigned to a kiosk."""
    def __init__(self, pid: str, kid: str):
        super().__init__(
            detail=f"Product {pid} is not assigned to kiosk {kid}",
            status_code=status.HTTP_404_NOT_FOUND
        )


class ProductStatusUnchangedException(ProductException):
    """Raised when trying to update product status to the same value."""
    def __init__(self, pid: str, current_status: bool):
        status_text = "available" if current_status else "sold out"
        super().__init__(
            detail=f"Product {pid} is already {status_text}",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class ProductDataCorruptedException(ProductException):
    """Raised when product data in database is corrupted or invalid."""
    def __init__(self, pid: str, reason: str = ""):
        msg = f"Product {pid} data is corrupted"
        if reason:
            msg += f": {reason}"
        super().__init__(
            detail=msg,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
