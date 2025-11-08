from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models import (
    Product,
    CreateKioskRequest,
    CreateKioskResponse,
    AddProductToKioskRequest,
    AddProductToKioskResponse,
    ProductSoldOutRequest
)
from app.services.firebase import firebase_service
import secrets

router = APIRouter(
    prefix="/kiosk",
    tags=["kiosk"]
)


@router.post("/create", response_model=CreateKioskResponse, status_code=status.HTTP_201_CREATED)
async def create_kiosk(kiosk_request: CreateKioskRequest):
    """
    Register a new kiosk and generate unique_id

    This endpoint is called when a kiosk first connects to the server.
    The server generates a unique_id that the kiosk should store in localStorage.

    Args:
        kiosk_request: Kiosk creation data (name, location)

    Returns:
        KioskRegistrationResponse with kid (kiosk_id) and unique_id
    """
    try:
        # Generate a unique_id for the kiosk (8 characters alphanumeric)
        unique_id = secrets.token_urlsafe(6)[:8]

        kiosk_data = kiosk_request.model_dump()
        kiosk_data['status'] = 'active'
        kiosk_data['unique_id'] = unique_id
        kiosk_data['products'] = []  # Initialize empty products list

        kiosk_id = await firebase_service.create_kiosk(kiosk_data)

        return CreateKioskResponse(
            kid=kiosk_id,
            unique_id=unique_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating kiosk: {str(e)}"
        )


@router.post("/{kiosk_id}/products", response_model=AddProductToKioskResponse, status_code=status.HTTP_200_OK)
async def add_product_to_kiosk(kiosk_id: str, request: AddProductToKioskRequest):
    """
    Add a product to a kiosk

    This endpoint adds a single product to the kiosk's product list.

    Args:
        kiosk_id: Kiosk ID
        request: AddProductToKioskRequest with pid (product_id)

    Returns:
        AddProductToKioskResponse with message and pid
    """
    try:
        # Verify kiosk exists
        kiosk = await firebase_service.get_kiosk_by_id(kiosk_id)
        if not kiosk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kiosk with ID {kiosk_id} not found"
            )

        # Verify product exists
        product = await firebase_service.get_product_by_id(request.pid)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {request.pid} not found"
            )

        # Get current products list
        current_products = kiosk.get('products', [])

        # Check if product already exists
        if request.pid in current_products:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {request.pid} already exists in kiosk {kiosk_id}"
            )

        # Add product to kiosk
        current_products.append(request.pid)
        success = await firebase_service.update_kiosk(kiosk_id, {"products": current_products})

        if success:
            return AddProductToKioskResponse(
                message=f"Product {request.pid} added to kiosk {kiosk_id}.",
                pid=request.pid
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add product to kiosk"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding product to kiosk: {str(e)}"
        )


@router.get("/{kiosk_id}/products", response_model=List[Product])
async def get_kiosk_products(kiosk_id: str):
    """
    Get all products available at a specific kiosk with full product details

    This endpoint returns the complete product information (including name, price, availability)
    for all products assigned to this kiosk.

    Args:
        kiosk_id: Kiosk ID

    Returns:
        List of Product objects with full details
    """
    try:
        # Get kiosk information
        kiosk = await firebase_service.get_kiosk_by_id(kiosk_id)
        if not kiosk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kiosk with ID {kiosk_id} not found"
            )

        # Get product IDs assigned to this kiosk
        product_ids = kiosk.get('products', [])

        if not product_ids:
            return []

        # Fetch full product details for each product
        products = []
        for product_id in product_ids:
            product = await firebase_service.get_product_by_id(product_id)
            if product:
                # Map Firebase field names to API response format
                products.append({
                    "pid": product.get("product_id", product_id),
                    "name": product.get("name", ""),
                    "price": product.get("price", 0),
                    "available": product.get("available", True)
                })

        return products
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching kiosk products: {str(e)}"
        )


@router.patch("/{kiosk_id}/products/{product_id}/soldout", response_model=dict)
async def mark_product_soldout(kiosk_id: str, product_id: str, request: ProductSoldOutRequest):
    """
    Mark a specific product as sold out at a kiosk

    This endpoint allows a kiosk to mark a product as sold out (or back in stock).
    It updates the product's availability status.

    Args:
        kiosk_id: Kiosk ID
        product_id: Product ID to mark as sold out
        request: ProductSoldOutRequest with sold_out boolean

    Returns:
        Success message
    """
    try:
        # Verify kiosk exists
        kiosk = await firebase_service.get_kiosk_by_id(kiosk_id)
        if not kiosk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kiosk with ID {kiosk_id} not found"
            )

        # Verify product exists
        product = await firebase_service.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )

        # Verify product is assigned to this kiosk
        product_ids = kiosk.get('products', [])
        if product_id not in product_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product_id} is not available at kiosk {kiosk_id}"
            )

        # Update product availability (sold_out=True means available=False)
        available = not request.sold_out
        success = await firebase_service.update_product(product_id, {"available": available})

        if success:
            status_text = "sold out" if request.sold_out else "available"
            return {
                "message": f"Product {product_id} marked as {status_text}."
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update product status"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating product sold out status: {str(e)}"
        )
