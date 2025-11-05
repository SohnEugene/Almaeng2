from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.models import Kiosk, CreateKioskRequest, UpdateKioskRequest
from app.services.firebase import firebase_service
from app.utils.helpers import generate_unique_id

router = APIRouter(
    prefix="/kiosks",
    tags=["kiosks"]
)


@router.get("/", response_model=List[Kiosk])
async def get_all_kiosks():
    """
    Get all kiosks

    Returns:
        List of all kiosks
    """
    try:
        kiosks = await firebase_service.get_all_kiosks()
        return kiosks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching kiosks: {str(e)}"
        )


@router.get("/{kiosk_id}", response_model=Kiosk)
async def get_kiosk(kiosk_id: str):
    """
    Get a specific kiosk by ID

    Args:
        kiosk_id: Kiosk ID

    Returns:
        Kiosk details
    """
    try:
        kiosk = await firebase_service.get_kiosk_by_id(kiosk_id)
        if not kiosk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kiosk with ID {kiosk_id} not found"
            )
        return kiosk
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching kiosk: {str(e)}"
        )


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_kiosk(kiosk_request: CreateKioskRequest):
    """
    Create a new kiosk

    Args:
        kiosk_request: Kiosk creation data

    Returns:
        Created kiosk ID and success message
    """
    try:
        kiosk_data = kiosk_request.model_dump()
        kiosk_data['status'] = 'active'

        kiosk_id = await firebase_service.create_kiosk(kiosk_data)

        return {
            "message": "Kiosk created successfully",
            "kiosk_id": kiosk_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating kiosk: {str(e)}"
        )


@router.put("/{kiosk_id}", response_model=dict)
async def update_kiosk(kiosk_id: str, kiosk_request: UpdateKioskRequest):
    """
    Update an existing kiosk

    Args:
        kiosk_id: Kiosk ID to update
        kiosk_request: Kiosk update data

    Returns:
        Success message
    """
    try:
        # Check if kiosk exists
        existing_kiosk = await firebase_service.get_kiosk_by_id(kiosk_id)
        if not existing_kiosk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kiosk with ID {kiosk_id} not found"
            )

        # Update only provided fields
        update_data = kiosk_request.model_dump(exclude_unset=True)

        success = await firebase_service.update_kiosk(kiosk_id, update_data)

        if success:
            return {
                "message": "Kiosk updated successfully",
                "kiosk_id": kiosk_id
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update kiosk"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating kiosk: {str(e)}"
        )


@router.delete("/{kiosk_id}", response_model=dict)
async def delete_kiosk(kiosk_id: str):
    """
    Delete a kiosk (set status to inactive)

    Args:
        kiosk_id: Kiosk ID to delete

    Returns:
        Success message
    """
    try:
        # Check if kiosk exists
        existing_kiosk = await firebase_service.get_kiosk_by_id(kiosk_id)
        if not existing_kiosk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kiosk with ID {kiosk_id} not found"
            )

        # Soft delete by setting status to inactive
        success = await firebase_service.update_kiosk(kiosk_id, {"status": "inactive"})

        if success:
            return {
                "message": "Kiosk deleted successfully",
                "kiosk_id": kiosk_id
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete kiosk"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting kiosk: {str(e)}"
        )


@router.get("/{kiosk_id}/products", response_model=List[str])
async def get_kiosk_products(kiosk_id: str):
    """
    Get all products available at a specific kiosk

    Args:
        kiosk_id: Kiosk ID

    Returns:
        List of product IDs
    """
    try:
        kiosk = await firebase_service.get_kiosk_by_id(kiosk_id)
        if not kiosk:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Kiosk with ID {kiosk_id} not found"
            )

        return kiosk.get('products', [])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching kiosk products: {str(e)}"
        )
