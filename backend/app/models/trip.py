from datetime import date

from pydantic import BaseModel, Field, model_validator


class TripPlanRequest(BaseModel):
    from_city: str = Field(..., min_length=1, examples=["Colombo"])
    destination_city: str = Field(..., min_length=1, examples=["New Delhi"])
    departure_date: date
    return_date: date
    interests: list[str] = Field(
        ...,
        min_length=1,
        examples=[["food", "history", "adventure"]],
    )

    @model_validator(mode="after")
    def validate_dates(self) -> "TripPlanRequest":
        if self.return_date < self.departure_date:
            raise ValueError("return_date must be on or after departure_date")
        return self


class AgentReport(BaseModel):
    agent_name: str
    content: str


class DailyPlan(BaseModel):
    day: int
    title: str
    activities: list[str]


class TripPlanResponse(BaseModel):
    destination_city: str
    summary: str
    daily_plan: list[DailyPlan]
    estimated_budget: str
    travel_tips: list[str]
    location_report: AgentReport
    guide_report: AgentReport
    planner_report: AgentReport
    markdown_itinerary: str
