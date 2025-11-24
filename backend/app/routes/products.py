# /products 로 들어오는 API 요청들을 처리하는 파일

from fastapi import APIRouter, status, UploadFile, File
from typing import List
from app.models import (
    RegisterProductRequest,
    RegisterProductResponse,
    UpdateProductResponse,
    DeleteProductResponse,
    UploadProductImageResponse,
    GetProductImageUrlResponse,
    Product
)
from app.services.firebase import firebase_service


router = APIRouter(
    prefix="/products",
    tags=["products"]
)


@router.get("/", response_model=List[Product], status_code=status.HTTP_200_OK)
async def get_all_products():
    """
    Get all products

    Returns:
        List[Product]: List of Product objects with full details

    Raises:
        ProductDataCorruptedException: 500 if product data is corrupted
        ProductException: 500 for database or other product-related errors
    """
    return firebase_service.get_all_products()

@router.post("/", response_model=RegisterProductResponse, status_code=status.HTTP_201_CREATED)
async def register_product(product_request: RegisterProductRequest):
    """
    Register a new product

    Args:
        RegisterProductRequest: Product creation data (name, price, description, image_url, tags, original_price, original_gram)

    Returns:
        RegisterProductResponse: Created product ID (pid)

    Raises:
        ProductException: 500 for database or other product-related errors
    """
    product_data = product_request.model_dump()
    product_id = firebase_service.register_product(product_data)

    return RegisterProductResponse(
        pid=product_id
    )



@router.get("/{pid}", response_model=Product, status_code=status.HTTP_200_OK)
async def get_product_by_id(pid: str):
    """
    Get a specific product by ID

    Args:
        pid (str): Product ID (e.g., "prod_001")

    Returns:
        Product: Product information with full details. Image URL is automatically converted to presigned S3 URL.

    Raises:
        ProductNotFoundException: 404 if product not found
        ProductException: 500 for database or other product-related errors
    """
    return firebase_service.get_product_by_id(pid)

@router.put("/{pid}", response_model=UpdateProductResponse, status_code=status.HTTP_200_OK)
async def update_product(pid: str, product_request: RegisterProductRequest):
    """
    Update a product by ID

    Args:
        pid (str): Product ID (e.g., "prod_001")
        product_request (RegisterProductRequest): Updated product data

    Returns:
        UpdateProductResponse: Success message

    Raises:
        ProductNotFoundException: 404 if product not found
        ProductException: 500 for database or other product-related errors
    """
    product_data = product_request.model_dump()
    firebase_service.update_product(pid, product_data)
    return UpdateProductResponse(message=f"Product {pid} updated successfully")

@router.delete("/{pid}", response_model=DeleteProductResponse, status_code=status.HTTP_200_OK)
async def delete_product(pid: str):
    """
    Delete a product by ID

    Args:
        pid (str): Product ID (e.g., "prod_001")

    Returns:
        DeleteProductResponse: Success message

    Raises:
        ProductNotFoundException: 404 if product not found
        ProductException: 500 for database or other product-related errors
    """
    firebase_service.delete_product(pid)
    return DeleteProductResponse(message=f"Product {pid} deleted successfully")



@router.post("/{pid}/image", response_model=UploadProductImageResponse, status_code=status.HTTP_200_OK)
async def upload_product_image(pid: str, file: UploadFile = File(...)):
    """
    Upload an image for a product to S3

    Args:
        pid (str): Product ID (e.g., "prod_001")
        file (UploadFile): Image file to upload

    Returns:
        UploadProductImageResponse: Success message with S3 key

    Raises:
        ProductNotFoundException: 404 if product not found
        S3ConfigException: 503 if S3 service not configured
        S3UploadException: 500 if S3 upload fails
        ProductException: 500 for database or other product-related errors
    """
    content_type = file.content_type or "image/png"
    filename = file.filename or "image.png"

    s3_key = firebase_service.upload_product_image(pid, file.file, filename, content_type)

    return UploadProductImageResponse(message="Image uploaded successfully", s3_key=s3_key)

@router.get("/{pid}/image", response_model=GetProductImageUrlResponse, status_code=status.HTTP_200_OK)
async def get_product_image_url(pid: str, expires_in: int = 3600):
    """
    Get presigned URL for product image

    Args:
        pid (str): Product ID (e.g., "prod_001")
        expires_in (int): URL expiration time in seconds (default: 3600)

    Returns:
        GetProductImageUrlResponse: Presigned URL for the product image with expiration time

    Raises:
        ProductNotFoundException: 404 if product not found
        S3PresignedException: 500 if presigned URL generation fails
        S3ConfigException: 503 if S3 service not configured
        ProductException: 500 for database or other product-related errors
    """
    url = firebase_service.get_product_image_url(pid, expires_in)

    return GetProductImageUrlResponse(url=url, expires_in=expires_in)
