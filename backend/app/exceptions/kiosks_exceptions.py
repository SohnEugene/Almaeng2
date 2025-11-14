from fastapi import HTTPException, status

class KioskException(HTTPException):
    """Base exception for kiosk-related errors."""
    def __init__(self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        super().__init__(
            detail=detail,
            status_code=status_code
        )


class KioskAlreadyExistsException(KioskException):
    """Raised when trying to create a kiosk that already exists."""
    def __init__(self, kid: str):
        super().__init__(
            detail=f"Kiosk with ID {kid} already exists",
            status_code=status.HTTP_409_CONFLICT
        )


class KioskNotFoundException(KioskException):
    """Raised when the requested kiosk cannot be found."""
    def __init__(self, kid: str):
        super().__init__(
            detail=f"Kiosk with ID {kid} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )


class KioskInvalidDataException(KioskException):
    """Raised when kiosk input data is invalid."""
    def __init__(self, reason: str = ""):
        msg = "Invalid kiosk data"
        if reason:
            msg += f": {reason}"
        super().__init__(
            detail=msg,
            status_code=status.HTTP_400_BAD_REQUEST
        )
