import uuid
from datetime import datetime, timedelta
from typing import Optional
import hashlib


def generate_unique_id(prefix: str = "") -> str:
    """
    Generate a unique ID with optional prefix

    Args:
        prefix: Optional prefix for the ID (e.g., "KIOSK", "PROD", "TXN")

    Returns:
        A unique ID string
    """
    unique_id = str(uuid.uuid4())
    if prefix:
        return f"{prefix}_{unique_id}"
    return unique_id


def generate_receipt_number() -> str:
    """
    Generate a unique receipt number

    Returns:
        A formatted receipt number (e.g., "RCP-20250105-123456")
    """
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    random_suffix = str(uuid.uuid4())[:6].upper()
    return f"RCP-{timestamp}-{random_suffix}"


def format_datetime(dt: datetime, format_string: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format datetime object to string

    Args:
        dt: Datetime object to format
        format_string: Format string (default: "%Y-%m-%d %H:%M:%S")

    Returns:
        Formatted datetime string
    """
    return dt.strftime(format_string)


def parse_datetime(dt_string: str, format_string: str = "%Y-%m-%d %H:%M:%S") -> Optional[datetime]:
    """
    Parse datetime string to datetime object

    Args:
        dt_string: Datetime string to parse
        format_string: Format string (default: "%Y-%m-%d %H:%M:%S")

    Returns:
        Datetime object or None if parsing fails
    """
    try:
        return datetime.strptime(dt_string, format_string)
    except ValueError:
        return None


def get_date_range(days_back: int = 7) -> tuple[datetime, datetime]:
    """
    Get date range for queries

    Args:
        days_back: Number of days back from today

    Returns:
        Tuple of (start_date, end_date)
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days_back)
    return start_date, end_date


def calculate_total(items: list, price_key: str = "price", quantity_key: str = "quantity") -> float:
    """
    Calculate total price from a list of items

    Args:
        items: List of item dictionaries
        price_key: Key for price in item dictionary
        quantity_key: Key for quantity in item dictionary

    Returns:
        Total price as float
    """
    total = 0.0
    for item in items:
        price = item.get(price_key, 0)
        quantity = item.get(quantity_key, 1)
        total += price * quantity
    return round(total, 2)


def hash_string(input_string: str) -> str:
    """
    Generate SHA256 hash of a string

    Args:
        input_string: String to hash

    Returns:
        Hexadecimal hash string
    """
    return hashlib.sha256(input_string.encode()).hexdigest()


def validate_payment_method(payment_method: str) -> bool:
    """
    Validate if payment method is supported

    Args:
        payment_method: Payment method string

    Returns:
        True if valid, False otherwise
    """
    valid_methods = ["card", "cash", "kakaopay", "naverpay", "mobile"]
    return payment_method.lower() in valid_methods


def format_currency(amount: float, currency: str = "KRW") -> str:
    """
    Format currency amount

    Args:
        amount: Amount to format
        currency: Currency code (default: "KRW")

    Returns:
        Formatted currency string
    """
    if currency == "KRW":
        return f"₩{amount:,.0f}"
    else:
        return f"{currency} {amount:,.2f}"


def paginate_results(items: list, page: int = 1, page_size: int = 10) -> dict:
    """
    Paginate a list of items

    Args:
        items: List of items to paginate
        page: Page number (1-indexed)
        page_size: Number of items per page

    Returns:
        Dictionary with paginated results and metadata
    """
    total_items = len(items)
    total_pages = (total_items + page_size - 1) // page_size

    start_index = (page - 1) * page_size
    end_index = start_index + page_size

    return {
        "items": items[start_index:end_index],
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1
    }


def sanitize_input(input_string: str) -> str:
    """
    Sanitize user input to prevent injection attacks

    Args:
        input_string: String to sanitize

    Returns:
        Sanitized string
    """
    # Basic sanitization - remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", ';', '&', '|']
    sanitized = input_string
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')
    return sanitized.strip()
