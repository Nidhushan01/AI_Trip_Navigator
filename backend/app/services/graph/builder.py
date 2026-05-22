from langgraph.graph import END, START, StateGraph

from app.services.graph.nodes import guide_expert, location_expert, planner_expert
from app.services.graph.state import TripPlanningState


def build_trip_planning_graph():
    graph = StateGraph(TripPlanningState)
    graph.add_node("location_expert", location_expert)
    graph.add_node("guide_expert", guide_expert)
    graph.add_node("planner_expert", planner_expert)

    graph.add_edge(START, "location_expert")
    graph.add_edge("location_expert", "guide_expert")
    graph.add_edge("guide_expert", "planner_expert")
    graph.add_edge("planner_expert", END)

    return graph.compile()
