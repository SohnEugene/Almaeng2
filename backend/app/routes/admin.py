from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import Counter
from app.models.models import AdminStats
from app.services.firebase import firebase_service
from app.utils.helpers import get_date_range, format_currency

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)


@router.get("/stats", response_model=AdminStats)
async def get_admin_statistics(
    days: Optional[int] = Query(7, description="Number of days to include in statistics")
):
    """
    Get comprehensive admin statistics

    Args:
        days: Number of days to include in statistics (default: 7)

    Returns:
        Admin statistics including kiosks, products, transactions, and revenue
    """
    try:
        # Fetch all data
        kiosks = await firebase_service.get_all_kiosks()
        products = await firebase_service.get_all_products()
        transactions = await firebase_service.get_all_transactions()

        # Filter transactions for time period
        start_date, end_date = get_date_range(days)
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        # Calculate totals
        total_kiosks = len(kiosks)
        total_products = len(products)
        total_transactions = len(transactions)

        # Calculate revenue
        total_revenue = sum(
            t.get('total_amount', 0)
            for t in transactions
            if t.get('payment_status') == 'completed'
        )

        # Today's statistics
        transactions_today = [
            t for t in transactions
            if isinstance(t.get('timestamp'), datetime) and t['timestamp'] >= today_start
        ]

        revenue_today = sum(
            t.get('total_amount', 0)
            for t in transactions_today
            if t.get('payment_status') == 'completed'
        )

        # Top products
        product_counts = Counter()
        for transaction in transactions:
            if transaction.get('payment_status') == 'completed':
                for item in transaction.get('items', []):
                    product_id = item.get('product_id')
                    quantity = item.get('quantity', 1)
                    product_counts[product_id] += quantity

        top_products = [
            {
                "product_id": product_id,
                "sales_count": count
            }
            for product_id, count in product_counts.most_common(10)
        ]

        # Kiosk performance
        kiosk_revenue = {}
        kiosk_transaction_count = {}

        for transaction in transactions:
            if transaction.get('payment_status') == 'completed':
                kiosk_id = transaction.get('kiosk_id')
                amount = transaction.get('total_amount', 0)

                if kiosk_id not in kiosk_revenue:
                    kiosk_revenue[kiosk_id] = 0
                    kiosk_transaction_count[kiosk_id] = 0

                kiosk_revenue[kiosk_id] += amount
                kiosk_transaction_count[kiosk_id] += 1

        kiosk_performance = [
            {
                "kiosk_id": kiosk_id,
                "revenue": revenue,
                "transaction_count": kiosk_transaction_count[kiosk_id]
            }
            for kiosk_id, revenue in sorted(
                kiosk_revenue.items(),
                key=lambda x: x[1],
                reverse=True
            )
        ]

        return AdminStats(
            total_kiosks=total_kiosks,
            total_products=total_products,
            total_transactions=total_transactions,
            total_revenue=total_revenue,
            transactions_today=len(transactions_today),
            revenue_today=revenue_today,
            top_products=top_products,
            kiosk_performance=kiosk_performance
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching admin statistics: {str(e)}"
        )


@router.get("/revenue", response_model=Dict[str, Any])
async def get_revenue_report(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    kiosk_id: Optional[str] = Query(None, description="Filter by kiosk ID")
):
    """
    Get detailed revenue report

    Args:
        start_date: Start date for report
        end_date: End date for report
        kiosk_id: Optional kiosk ID filter

    Returns:
        Revenue report with breakdown
    """
    try:
        # Parse dates
        if start_date:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        else:
            start_dt, _ = get_date_range(30)

        if end_date:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        else:
            end_dt = datetime.now()

        # Fetch transactions
        if kiosk_id:
            transactions = await firebase_service.get_transactions_by_kiosk(kiosk_id)
        else:
            transactions = await firebase_service.get_all_transactions()

        # Filter by date and status
        completed_transactions = [
            t for t in transactions
            if t.get('payment_status') == 'completed' and
            isinstance(t.get('timestamp'), datetime) and
            start_dt <= t['timestamp'] <= end_dt
        ]

        # Calculate metrics
        total_revenue = sum(t.get('total_amount', 0) for t in completed_transactions)
        transaction_count = len(completed_transactions)
        average_transaction = total_revenue / transaction_count if transaction_count > 0 else 0

        # Revenue by payment method
        revenue_by_method = {}
        for transaction in completed_transactions:
            method = transaction.get('payment_method', 'unknown')
            amount = transaction.get('total_amount', 0)
            revenue_by_method[method] = revenue_by_method.get(method, 0) + amount

        # Daily revenue breakdown
        daily_revenue = {}
        for transaction in completed_transactions:
            date_key = transaction['timestamp'].strftime("%Y-%m-%d")
            amount = transaction.get('total_amount', 0)
            daily_revenue[date_key] = daily_revenue.get(date_key, 0) + amount

        return {
            "period": {
                "start_date": start_dt.strftime("%Y-%m-%d"),
                "end_date": end_dt.strftime("%Y-%m-%d")
            },
            "summary": {
                "total_revenue": total_revenue,
                "transaction_count": transaction_count,
                "average_transaction": average_transaction,
                "formatted_revenue": format_currency(total_revenue)
            },
            "revenue_by_payment_method": revenue_by_method,
            "daily_revenue": daily_revenue
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating revenue report: {str(e)}"
        )


@router.get("/products/performance", response_model=List[Dict[str, Any]])
async def get_product_performance(
    limit: Optional[int] = Query(10, description="Number of top products to return")
):
    """
    Get product performance metrics

    Args:
        limit: Number of top products to return

    Returns:
        List of products with performance metrics
    """
    try:
        products = await firebase_service.get_all_products()
        transactions = await firebase_service.get_all_transactions()

        # Calculate metrics for each product
        product_metrics = {}

        for product in products:
            product_id = product.get('product_id')
            product_metrics[product_id] = {
                "product_id": product_id,
                "product_name": product.get('name'),
                "sales_count": 0,
                "revenue": 0
            }

        # Aggregate from transactions
        for transaction in transactions:
            if transaction.get('payment_status') == 'completed':
                for item in transaction.get('items', []):
                    product_id = item.get('product_id')
                    if product_id in product_metrics:
                        product_metrics[product_id]['sales_count'] += item.get('quantity', 1)
                        product_metrics[product_id]['revenue'] += item.get('subtotal', 0)

        # Sort by revenue and return top products
        sorted_products = sorted(
            product_metrics.values(),
            key=lambda x: x['revenue'],
            reverse=True
        )[:limit]

        return sorted_products

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching product performance: {str(e)}"
        )


@router.get("/kiosks/performance", response_model=List[Dict[str, Any]])
async def get_kiosk_performance():
    """
    Get detailed kiosk performance metrics

    Returns:
        List of kiosks with performance metrics
    """
    try:
        kiosks = await firebase_service.get_all_kiosks()
        transactions = await firebase_service.get_all_transactions()

        kiosk_metrics = {}

        # Initialize metrics
        for kiosk in kiosks:
            kiosk_id = kiosk.get('kiosk_id')
            kiosk_metrics[kiosk_id] = {
                "kiosk_id": kiosk_id,
                "kiosk_name": kiosk.get('name'),
                "location": kiosk.get('location'),
                "transaction_count": 0,
                "revenue": 0,
                "status": kiosk.get('status', 'unknown')
            }

        # Aggregate from transactions
        for transaction in transactions:
            kiosk_id = transaction.get('kiosk_id')
            if kiosk_id in kiosk_metrics:
                kiosk_metrics[kiosk_id]['transaction_count'] += 1
                if transaction.get('payment_status') == 'completed':
                    kiosk_metrics[kiosk_id]['revenue'] += transaction.get('total_amount', 0)

        # Sort by revenue
        sorted_kiosks = sorted(
            kiosk_metrics.values(),
            key=lambda x: x['revenue'],
            reverse=True
        )

        return sorted_kiosks

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching kiosk performance: {str(e)}"
        )


@router.get("/dashboard", response_model=Dict[str, Any])
async def get_dashboard_overview():
    """
    Get comprehensive dashboard overview with all key metrics

    Returns:
        Dashboard data with statistics, charts, and recent activity
    """
    try:
        # Get basic statistics
        stats = await get_admin_statistics(days=30)

        # Get recent transactions
        recent_transactions = await firebase_service.get_all_transactions(limit=10)

        # Get active kiosks
        kiosks = await firebase_service.get_all_kiosks()
        active_kiosks = [k for k in kiosks if k.get('status') == 'active']

        return {
            "statistics": stats.model_dump(),
            "active_kiosks_count": len(active_kiosks),
            "recent_transactions": recent_transactions[:5],
            "last_updated": datetime.now().isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )
