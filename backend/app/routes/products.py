from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models import (
    RegisterProductRequest,
    RegisterProductResponse,
    Product
)
from app.services.firebase import firebase_service

router = APIRouter(
    prefix="/product",
    tags=["product"]
)


@router.post("/", response_model=RegisterProductResponse, status_code=status.HTTP_201_CREATED)
async def register_product(product_request: RegisterProductRequest):
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
        RegisterProductResponse with pid (product_id)

    Raises:
        ProductException: 500 for product creation errors
    """
    product_data = product_request.model_dump()
    product_id = await firebase_service.register_product(product_data)

    return RegisterProductResponse(
        pid=product_id
    )

@router.get("/list", response_model=List[Product])
async def get_all_products():
    """
    Get all products

    This endpoint retrieves all products from the products collection.

    Returns:
        List of Product objects with full details

    Raises:
        ProductDataCorruptedException: 500 if product data is corrupted
        ProductException: 500 for other errors
    """
    products = await firebase_service.get_all_products()
    return products

@router.get("/{pid}", response_model=Product)
async def get_product_by_id(pid: str):
    """
    Get a product by ID

    This endpoint retrieves detailed information about a specific product.

    Args:
        product_id: Product ID (e.g., "prod_001")

    Returns:
        Product object with full details

    Raises:
        ProductNotFoundException: 404 if product not found
        ProductException: 500 for other errors
    """
    product = await firebase_service.get_product_by_id(pid)
    return product
