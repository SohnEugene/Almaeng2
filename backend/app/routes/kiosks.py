# /kiosks 로 들어오는 API 요청들을 처리하는 파일

from fastapi import APIRouter, status
from app.services.firebase import firebase_service
from typing import List
from app.models import (
    Kiosk,
    RegisterKioskRequest,
    RegisterKioskResponse,
    DeleteKioskResponse,
    AddProductToKioskRequest,
    AddProductToKioskResponse,
    GetKioskProductsResponse,
    UpdateProductStatusRequest,
    UpdateProductStatusResponse,
    DeleteProductFromKioskResponse
)
from app.exceptions import (
    KioskInvalidDataException,
    ProductAlreadyExistsException,
    ProductNotAssignedException,
    ProductStatusUnchangedException
)


router = APIRouter(
    prefix="/kiosks",
    tags=["kiosk"]
)

@router.get("/", response_model=List[dict], status_code=status.HTTP_200_OK)
async def get_all_kiosks():
    """
    Get all registered kiosks.

    Returns:
        List of kiosk objects with kiosk_id, name, location, status, products

    Raises:
        KioskException: 500 for database or other kiosk-related errors
    """
    return firebase_service.get_all_kiosks()

@router.post("/", response_model=RegisterKioskResponse, status_code=status.HTTP_201_CREATED)
async def register_kiosk(request: RegisterKioskRequest):
    """
    Register a new kiosk.

    Args:
        request (RegisterKioskRequest): Kiosk creation data (name, location).

    Returns:
        RegisterKioskResponse: Created kiosk ID (kid).

    Raises:
        KioskInvalidDataException: 400 if name or location is empty
        KioskAlreadyExistsException: 409 if kiosk already exists
        KioskException: 500 for other kiosk-related errors
    """
    # Additional validation for empty strings (after stripping whitespace)
    if not request.name.strip():
        raise KioskInvalidDataException("Kiosk name cannot be empty or whitespace only")

    if not request.location.strip():
        raise KioskInvalidDataException("Kiosk location cannot be empty or whitespace only")

    kiosk = Kiosk(
        name=request.name.strip(),
        location=request.location.strip(),
        status="active",
        products=[],
    )

    # convert kiosk model to dict to store in firebase
    kiosk_data = kiosk.model_dump(exclude_none=True, exclude={"kid"})
    kiosk_id = firebase_service.register_kiosk(kiosk_data)
    return RegisterKioskResponse(kid=kiosk_id)



@router.get("/{kid}", response_model=Kiosk, status_code=status.HTTP_200_OK)
async def get_kiosk(kid: str):
    """
    Get a specific kiosk by ID

    Args:
        kid: Kiosk ID

    Returns:
        Kiosk: Kiosk information

    Raises:
        KioskNotFoundException: 404 if kiosk not found
        KioskException: 500 for other errors
    """
    kiosk = firebase_service.get_kiosk_by_id(kid)
    return kiosk

@router.delete("/{kid}", response_model=DeleteKioskResponse, status_code=status.HTTP_200_OK)
async def delete_kiosk(kid: str):
    """
    Delete a kiosk by ID

    Args:
        kid: Kiosk ID

    Returns:
        DeleteKioskResponse: Success message

    Raises:
        KioskNotFoundException: 404 if kiosk not found
        KioskException: 500 for other errors
    """
    firebase_service.delete_kiosk(kid)
    return DeleteKioskResponse(message=f"Kiosk {kid} deleted successfully")



@router.get("/{kid}/products", response_model=GetKioskProductsResponse, status_code=status.HTTP_200_OK)
async def get_kiosk_products(kid: str):
    """
    Get all products available at a specific kiosk with full product details

    Args:
        kid: Kiosk ID

    Returns:
        GetKioskProductsResponse: List of products with kiosk-specific availability

    Raises:
        KioskNotFoundException: 404 if kiosk not found
        ProductNotFoundException: 404 if any product not found
        KioskException: 500 for other errors
        ProductException: 500 for other errors
    """
    kiosk = firebase_service.get_kiosk_by_id(kid)

    if not kiosk.products:
        return GetKioskProductsResponse(products=[])

    products = []
    for kiosk_prod in kiosk.products:
        product_id = kiosk_prod.get('pid')
        kiosk_available = kiosk_prod.get('available', False)

        product = firebase_service.get_product_by_id(product_id)

        products.append({
            "product": product,
            "available": kiosk_available
        })

    return GetKioskProductsResponse(products=products)

@router.post("/{kid}/products", response_model=AddProductToKioskResponse, status_code=status.HTTP_200_OK)
async def add_product_to_kiosk(kid: str, request: AddProductToKioskRequest):
    """
    Add a product to a kiosk

    Args:
        kid (str): Kiosk ID
        request (AddProductToKioskRequest): Contains pid

    Returns:
        AddProductToKioskResponse: Success message

    Raises:
        KioskNotFoundException: 404 if kiosk not found
        ProductNotFoundException: 404 if product not found
        ProductAlreadyExistsException: 409 if product already exists in kiosk
        KioskException: 500 for database or other kiosk-related errors
        ProductException: 500 for product-related errors
    """
    kiosk = firebase_service.get_kiosk_by_id(kid)
    product = firebase_service.get_product_by_id(request.pid)

    if any(p.get("pid") == product.pid for p in kiosk.products):
        raise ProductAlreadyExistsException(f"Product {product.pid} already exists in kiosk {kid}")

    kiosk.products.append({
        "pid": product.pid,
        "available": True
    })

    firebase_service.update_kiosk(kid, {"products": kiosk.products})

    return AddProductToKioskResponse(
        message=f"Product {product.pid} added to kiosk {kid}"
    )

@router.patch("/{kid}/products/{pid}", response_model=UpdateProductStatusResponse, status_code=status.HTTP_200_OK)
async def update_product_status(kid: str, pid: str, request: UpdateProductStatusRequest):
    """
    Update product availability status at a specific kiosk

    Args:
        kid: Kiosk ID
        pid: Product ID
        request: UpdateProductStatusRequest with available boolean

    Returns:
        UpdateProductStatusResponse: Success message with updated available status

    Raises:
        KioskNotFoundException: 404 if kiosk not found
        ProductNotFoundException: 404 if product not found
        ProductNotAssignedException: 404 if product not assigned to kiosk
        ProductStatusUnchangedException: 400 if status is already set to the requested value
        KioskException: 500 for database or other kiosk-related errors
        ProductException: 500 for product-related errors
    """
    kiosk = firebase_service.get_kiosk_by_id(kid)
    firebase_service.get_product_by_id(pid)

    product_found = False
    current_availability = None
    updated_products = []

    for kiosk_prod in kiosk.products:
        prod_id = kiosk_prod.get('pid')

        if prod_id == pid:
            product_found = True
            current_availability = kiosk_prod.get('available', False)
            
            if current_availability == request.available:
                raise ProductStatusUnchangedException(pid=pid, current_status=current_availability)

            updated_products.append({
                "pid": prod_id,
                "available": request.available
            })
        else:
            updated_products.append(kiosk_prod)
    
    if not product_found:
        raise ProductNotAssignedException(pid=pid, kid=kid)
    
    firebase_service.update_kiosk(kid, {"products": updated_products})

    status_text = "available" if request.available else "sold out"
    return UpdateProductStatusResponse(
        message=f"Product {pid} marked as {status_text}"
    )

@router.delete("/{kid}/products/{pid}", response_model=DeleteProductFromKioskResponse, status_code=status.HTTP_200_OK)
async def remove_product_from_kiosk(kid: str, pid: str):
    """
    Delete a product from a kiosk

    Args:
        kid: Kiosk ID
        pid: Product ID

    Returns:
        DeleteProductFromKioskResponse: Success message

    Raises:
        KioskNotFoundException: 404 if kiosk not found
        ProductNotAssignedException: 404 if product not assigned to kiosk
        KioskException: 500 for database or other kiosk-related errors
    """
    kiosk = firebase_service.get_kiosk_by_id(kid)

    product_found = False
    updated_products = []

    for kiosk_prod in kiosk.products:
        prod_id = kiosk_prod.get('pid')
        if prod_id == pid:
            product_found = True
        else:
            updated_products.append(kiosk_prod)
    
    if not product_found:
        raise ProductNotAssignedException(pid=pid, kid=kid)
    
    firebase_service.update_kiosk(kid, {"products": updated_products})

    return DeleteProductFromKioskResponse(message=f"Product {pid} removed from kiosk {kid}")
