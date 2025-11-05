from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ProductOption(BaseModel):
    """Product option model (e.g., size, temperature)"""
    name: str
    value: str
    price_modifier: float = 0.0  # Additional price for this option


class Product(BaseModel):
    """Product model for kiosk items"""
    product_id: str
    name: str
    price: float
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    available: bool = True
    options: Optional[List[ProductOption]] = []


class Kiosk(BaseModel):
    """Kiosk model representing a physical kiosk location"""
    kiosk_id: str
    location: str
    name: str
    status: str = "active"  # active, inactive, maintenance
    products: List[str] = []  # List of product_ids available at this kiosk
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TransactionItem(BaseModel):
    """Individual item in a transaction"""
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    options: Optional[List[ProductOption]] = []
    subtotal: float


class Transaction(BaseModel):
    """Transaction model for purchases"""
    transaction_id: str
    kiosk_id: str
    items: List[TransactionItem]
    total_amount: float
    payment_method: str  # "card", "cash", "kakaopay", etc.
    payment_status: str = "pending"  # pending, completed, failed, refunded
    timestamp: datetime
    customer_id: Optional[str] = None
    receipt_number: Optional[str] = None


# Request/Response models
class CreateKioskRequest(BaseModel):
    """Request model for creating a new kiosk"""
    location: str
    name: str
    products: Optional[List[str]] = []


class UpdateKioskRequest(BaseModel):
    """Request model for updating a kiosk"""
    location: Optional[str] = None
    name: Optional[str] = None
    status: Optional[str] = None
    products: Optional[List[str]] = None


class CreateProductRequest(BaseModel):
    """Request model for creating a new product"""
    name: str
    price: float
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    options: Optional[List[ProductOption]] = []


class UpdateProductRequest(BaseModel):
    """Request model for updating a product"""
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None
    options: Optional[List[ProductOption]] = None


class CreateTransactionRequest(BaseModel):
    """Request model for creating a new transaction"""
    kiosk_id: str
    items: List[TransactionItem]
    total_amount: float
    payment_method: str
    customer_id: Optional[str] = None


class AdminStats(BaseModel):
    """Admin statistics response model"""
    total_kiosks: int
    total_products: int
    total_transactions: int
    total_revenue: float
    transactions_today: int
    revenue_today: float
    top_products: List[Dict[str, Any]]
    kiosk_performance: List[Dict[str, Any]]
