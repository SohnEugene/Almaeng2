class ServiceException(Exception):
    """Base exception for general service errors."""
    pass


class DatabaseUnavailable(ServiceException):
    """When Firebase/DB is down or unreachable."""
    pass


class ExternalAPIError(ServiceException):
    """When an external API request fails."""
    pass
