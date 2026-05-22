from langchain_community.tools import DuckDuckGoSearchResults

from app.core.config import get_settings


def search_web(query: str) -> str:
    settings = get_settings()
    search_tool = DuckDuckGoSearchResults(num_results=settings.search_results_limit)
    return search_tool.run(query)
