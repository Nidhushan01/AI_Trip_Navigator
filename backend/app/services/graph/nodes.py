from langchain_core.prompts import ChatPromptTemplate

from app.services.llm.client import build_llm
from app.services.tools.web_search import search_web


def _join_interests(interests: list[str]) -> str:
    return ", ".join(interests)


def location_expert(state: dict) -> dict:
    llm = build_llm()
    destination_city = state["destination_city"]
    search_results = search_web(
        f"{destination_city} visa transportation accommodation weather local events"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are location_expert, a travel logistics specialist. "
                "Provide practical and concise destination guidance.",
            ),
            (
                "human",
                "Traveler is going from {from_city} to {destination_city}.\n"
                "Departure date: {departure_date}\n"
                "Return date: {return_date}\n"
                "Use this research:\n{search_results}\n\n"
                "Write a logistics report covering visa, local transport, stays, weather, "
                "budget expectations, and planning notes.",
            ),
        ]
    )

    message = prompt.invoke(
        {
            "from_city": state["from_city"],
            "destination_city": destination_city,
            "departure_date": state["departure_date"],
            "return_date": state["return_date"],
            "search_results": search_results,
        }
    )
    response = llm.invoke(message)
    return {"location_report": response.content}


def guide_expert(state: dict) -> dict:
    llm = build_llm()
    destination_city = state["destination_city"]
    interests = _join_interests(state["interests"])
    search_results = search_web(
        f"{destination_city} attractions food activities events for {interests}"
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are guide_expert, a local experience specialist. "
                "Recommend memorable activities tailored to the traveler's interests.",
            ),
            (
                "human",
                "Destination: {destination_city}\n"
                "Interests: {interests}\n"
                "Departure date: {departure_date}\n"
                "Return date: {return_date}\n"
                "Use this research:\n{search_results}\n\n"
                "Write a guide report with attractions, food, events, and special experiences.",
            ),
        ]
    )

    message = prompt.invoke(
        {
            "destination_city": destination_city,
            "interests": interests,
            "departure_date": state["departure_date"],
            "return_date": state["return_date"],
            "search_results": search_results,
        }
    )
    response = llm.invoke(message)
    return {"guide_report": response.content}


def planner_expert(state: dict) -> dict:
    llm = build_llm()
    interests = _join_interests(state["interests"])

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are planner_expert, a senior travel planner. "
                "Synthesize the reports into a polished itinerary.",
            ),
            (
                "human",
                "Destination: {destination_city}\n"
                "Travel dates: {departure_date} to {return_date}\n"
                "Interests: {interests}\n\n"
                "Location report:\n{location_report}\n\n"
                "Guide report:\n{guide_report}\n\n"
                "Create a final itinerary with:\n"
                "1. A short summary\n"
                "2. Day-by-day plan\n"
                "3. Estimated budget\n"
                "4. Travel tips\n"
                "5. Clear markdown formatting",
            ),
        ]
    )

    message = prompt.invoke(
        {
            "destination_city": state["destination_city"],
            "departure_date": state["departure_date"],
            "return_date": state["return_date"],
            "interests": interests,
            "location_report": state["location_report"],
            "guide_report": state["guide_report"],
        }
    )
    response = llm.invoke(message)
    return {"planner_report": response.content}
