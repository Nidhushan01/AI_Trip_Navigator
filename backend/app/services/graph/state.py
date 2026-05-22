from typing import TypedDict


class TripPlanningState(TypedDict, total=False):
    from_city: str
    destination_city: str
    departure_date: str
    return_date: str
    interests: list[str]
    location_report: str
    guide_report: str
    planner_report: str
