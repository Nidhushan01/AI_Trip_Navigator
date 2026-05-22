import re

from app.models.trip import AgentReport, DailyPlan, TripPlanRequest, TripPlanResponse
from app.services.graph.builder import build_trip_planning_graph


class TripPlanningService:
    def __init__(self) -> None:
        self.graph = build_trip_planning_graph()

    def generate_plan(self, request: TripPlanRequest) -> TripPlanResponse:
        state = {
            "from_city": request.from_city,
            "destination_city": request.destination_city,
            "departure_date": request.departure_date.isoformat(),
            "return_date": request.return_date.isoformat(),
            "interests": request.interests,
        }
        result = self.graph.invoke(state)
        planner_markdown = result["planner_report"]

        return TripPlanResponse(
            destination_city=request.destination_city,
            summary=self._extract_summary(planner_markdown),
            daily_plan=self._build_daily_plan(planner_markdown),
            estimated_budget=self._extract_budget(planner_markdown),
            travel_tips=self._extract_tips(planner_markdown),
            location_report=AgentReport(
                agent_name="location_expert",
                content=result["location_report"],
            ),
            guide_report=AgentReport(
                agent_name="guide_expert",
                content=result["guide_report"],
            ),
            planner_report=AgentReport(
                agent_name="planner_expert",
                content=planner_markdown,
            ),
            markdown_itinerary=planner_markdown,
        )

    def _extract_summary(self, markdown: str) -> str:
        lines = [line.strip() for line in markdown.splitlines() if line.strip()]
        return lines[0] if lines else "Trip plan generated successfully."

    def _build_daily_plan(self, markdown: str) -> list[DailyPlan]:
        day_lines = [
            line.strip("- ").strip()
            for line in markdown.splitlines()
            if re.match(r"^\s*(Day|\d+\.)", line, flags=re.IGNORECASE)
        ]
        if not day_lines:
            return [
                DailyPlan(
                    day=1,
                    title="Suggested itinerary",
                    activities=["See markdown_itinerary for the complete generated plan."],
                )
            ]

        plans: list[DailyPlan] = []
        for index, line in enumerate(day_lines, start=1):
            plans.append(
                DailyPlan(
                    day=index,
                    title=line,
                    activities=[line],
                )
            )
        return plans

    def _extract_budget(self, markdown: str) -> str:
        for line in markdown.splitlines():
            if "budget" in line.lower() or "cost" in line.lower() or "expense" in line.lower():
                return line.strip()
        return "Budget details are included in the markdown itinerary."

    def _extract_tips(self, markdown: str) -> list[str]:
        tips = [
            line.strip("- ").strip()
            for line in markdown.splitlines()
            if line.strip().startswith("-")
        ]
        if tips:
            return tips[:5]
        return ["Review the markdown itinerary for planning tips and local guidance."]
