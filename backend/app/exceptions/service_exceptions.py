from fastapi import HTTPException, status


# --- Firebase Service Exceptions ---
class FirebaseException(HTTPException):
    """Base exception for Firebase service errors."""

    def __init__(
        self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    ):
        super().__init__(detail=detail, status_code=status_code)


class FirebaseConnectionException(FirebaseException):
    """Raised when Firebase connection fails."""

    def __init__(self, reason: str):
        super().__init__(
            detail=f"Firebase connection failed: {reason}",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class FirebaseInitializationException(FirebaseException):
    """Raised when Firebase initialization fails."""

    def __init__(self, reason: str):
        super().__init__(
            detail=f"Firebase initialization failed: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class FirebaseCredentialsException(FirebaseException):
    """Raised when Firebase credentials are missing or invalid."""

    def __init__(self, reason: str):
        super().__init__(
            detail=f"Firebase credentials error: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# --- QR Code Service Exceptions ---
class QRCodeServiceException(HTTPException):
    """Base exception for QR code service errors."""

    def __init__(
        self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    ):
        super().__init__(detail=detail, status_code=status_code)


class QRCodeGenerationException(QRCodeServiceException):
    """Raised when QR code generation fails (e.g., image encoding, URL generation)."""

    def __init__(self, reason: str):
        super().__init__(
            detail=f"QR code generation failed: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# --- S3 Service Exceptions ---
class S3Exception(HTTPException):
    """Base exception for S3 operations"""

    def __init__(
        self, detail: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    ):
        super().__init__(detail=detail, status_code=status_code)


class S3UploadException(S3Exception):
    """Exception raised when S3 upload fails"""

    def __init__(self, key: str, reason: str):
        self.key = key
        self.reason = reason
        super().__init__(
            detail=f"Failed to upload {key}: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class S3PresignedException(S3Exception):
    """Exception raised when presigned URL generation fails"""

    def __init__(self, key: str, reason: str):
        self.key = key
        self.reason = reason
        super().__init__(
            detail=f"Failed to generate presigned URL for {key}: {reason}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class S3ConfigException(S3Exception):
    """Exception raised when S3 configuration is invalid"""

    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(
            detail=f"S3 configuration error: {reason}",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
