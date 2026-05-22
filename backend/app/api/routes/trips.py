from fastapi import APIRouter, Depends

from app.models.trip import TripPlanRequest, TripPlanResponse
from app.services.trip_service import TripPlanningService


router = APIRouter(prefix="/trips", tags=["trips"])


def get_trip_service() -> TripPlanningService:
    return TripPlanningService()


@router.post("/plan", response_model=TripPlanResponse)
def create_trip_plan(
    request: TripPlanRequest,
    service: TripPlanningService = Depends(get_trip_service),
) -> TripPlanResponse:
    return service.generate_plan(request)
