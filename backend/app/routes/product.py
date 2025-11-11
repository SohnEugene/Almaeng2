from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models import (
    CreateProductRequest,
    CreateProductResponse,
    Product
)
from app.services.firebase import firebase_service

router = APIRouter(
    prefix="/product",
    tags=["product"]
)


@router.post("/create", response_model=CreateProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product_request: CreateProductRequest):
    """
    Create a new product

    This endpoint creates a new product in the products collection.
    The server generates a sequential product_id (prod_001, prod_002, ...).

    Args:
        product_request: Product creation data
            - name: Product name
            - price: Product price
            - description: Product description (optional)
            - image_url: Product image URL (optional)
            - tags: Product tags (optional)

    Returns:
        CreateProductResponse with pid (product_id)
    """
    try:
        product_data = product_request.model_dump()

        product_id = await firebase_service.create_product(product_data)

        return CreateProductResponse(
            message=f"Product {product_id} created successfully.",
            pid=product_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating product: {str(e)}"
        )


@router.get("/list", response_model=List[Product])
async def get_all_products():
    """
    Get all products

    This endpoint retrieves all products from the products collection.

    Returns:
        List of Product objects with full details
    """
    try:
        products = await firebase_service.get_all_products()

        # Format products for response
        formatted_products = []
        for product in products:
            formatted_products.append({
                "pid": product.get("product_id", ""),
                "name": product.get("name", ""),
                "price": product.get("price", 0),
                "description": product.get("description", ""),
                "image_url": product.get("image_url", ""),
                "tags": product.get("tags", []),
                "available": product.get("available", True)
            })

        return formatted_products
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching products: {str(e)}"
        )


@router.get("/{product_id}", response_model=Product)
async def get_product_by_id(product_id: str):
    """
    Get a product by ID

    This endpoint retrieves detailed information about a specific product.

    Args:
        product_id: Product ID (e.g., "prod_001")

    Returns:
        Product object with full details
    """
    try:
        product = await firebase_service.get_product_by_id(product_id)

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )

        # Format product for response
        return {
            "pid": product.get("product_id", product_id),
            "name": product.get("name", ""),
            "price": product.get("price", 0),
            "description": product.get("description", ""),
            "image_url": product.get("image_url", ""),
            "tags": product.get("tags", []),
            "available": product.get("available", True)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching product: {str(e)}"
        )
