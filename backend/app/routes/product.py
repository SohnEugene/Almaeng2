from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from app.models.models import Product, CreateProductRequest, UpdateProductRequest
from app.services.firebase import firebase_service
from app.utils.helpers import generate_unique_id

router = APIRouter(
    prefix="/products",
    tags=["products"]
)


@router.get("/", response_model=List[Product])
async def get_all_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    available: Optional[bool] = Query(None, description="Filter by availability")
):
    """
    Get all products with optional filters

    Args:
        category: Optional category filter
        available: Optional availability filter

    Returns:
        List of products
    """
    try:
        products = await firebase_service.get_all_products()

        # Apply filters if provided
        if category:
            products = [p for p in products if p.get('category') == category]

        if available is not None:
            products = [p for p in products if p.get('available', True) == available]

        return products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching products: {str(e)}"
        )


@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """
    Get a specific product by ID

    Args:
        product_id: Product ID

    Returns:
        Product details
    """
    try:
        product = await firebase_service.get_product_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching product: {str(e)}"
        )


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_product(product_request: CreateProductRequest):
    """
    Create a new product

    Args:
        product_request: Product creation data

    Returns:
        Created product ID and success message
    """
    try:
        product_data = product_request.model_dump()
        product_data['available'] = True

        product_id = await firebase_service.create_product(product_data)

        return {
            "message": "Product created successfully",
            "product_id": product_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating product: {str(e)}"
        )


@router.put("/{product_id}", response_model=dict)
async def update_product(product_id: str, product_request: UpdateProductRequest):
    """
    Update an existing product

    Args:
        product_id: Product ID to update
        product_request: Product update data

    Returns:
        Success message
    """
    try:
        # Check if product exists
        existing_product = await firebase_service.get_product_by_id(product_id)
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )

        # Update only provided fields
        update_data = product_request.model_dump(exclude_unset=True)

        success = await firebase_service.update_product(product_id, update_data)

        if success:
            return {
                "message": "Product updated successfully",
                "product_id": product_id
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update product"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating product: {str(e)}"
        )


@router.delete("/{product_id}", response_model=dict)
async def delete_product(product_id: str):
    """
    Delete a product (set available to False)

    Args:
        product_id: Product ID to delete

    Returns:
        Success message
    """
    try:
        # Check if product exists
        existing_product = await firebase_service.get_product_by_id(product_id)
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )

        # Soft delete by setting available to False
        success = await firebase_service.update_product(product_id, {"available": False})

        if success:
            return {
                "message": "Product deleted successfully",
                "product_id": product_id
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete product"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting product: {str(e)}"
        )


@router.patch("/{product_id}/availability", response_model=dict)
async def toggle_product_availability(product_id: str, available: bool):
    """
    Toggle product availability

    Args:
        product_id: Product ID
        available: New availability status

    Returns:
        Success message
    """
    try:
        # Check if product exists
        existing_product = await firebase_service.get_product_by_id(product_id)
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )

        success = await firebase_service.update_product(product_id, {"available": available})

        if success:
            return {
                "message": f"Product availability set to {available}",
                "product_id": product_id,
                "available": available
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update product availability"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating product availability: {str(e)}"
        )
