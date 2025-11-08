from fastapi import APIRouter, HTTPException, status
from app.models import (
    CreateProductRequest,
    CreateProductResponse
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

        return CreateProductResponse(pid=product_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating product: {str(e)}"
        )
