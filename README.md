# Agentic AI Trip Navigator

Agentic AI Trip Navigator is a full-stack travel planning app that generates trip itineraries with a multi-agent workflow.

The project combines:

- A `FastAPI` backend for trip-planning APIs
- A `LangGraph` workflow that runs specialized travel agents in sequence
- A `React + Vite` frontend for submitting trip requests and viewing results

## Features

- Generate a trip plan from origin, destination, dates, and interests
- Run a three-step agent workflow:
  - `location_expert`
  - `guide_expert`
  - `planner_expert`
- Return a structured API response with:
  - trip summary
  - daily itinerary
  - estimated budget note
  - travel tips
  - individual agent reports
  - full markdown itinerary
- Simple browser UI for testing and interacting with the planner

## Tech Stack

- Backend: `FastAPI`, `Pydantic`, `LangGraph`, `LangChain`, `langchain-openai`
- Frontend: `React`, `Vite`
- LLM provider: `OpenAI`

## How It Works

The backend builds a LangGraph pipeline in this order:

1. `location_expert`
2. `guide_expert`
3. `planner_expert`

The final planner output is then transformed into a response model that the frontend can render as cards, lists, and markdown.

## Project Structure

```text
.
|-- backend/
|   `-- app/
|       |-- api/
|       |   `-- routes/
|       |-- core/
|       |-- models/
|       `-- services/
|           |-- graph/
|           |-- llm/
|           `-- tools/
|-- frontend/
|   |-- src/
|   |   |-- services/
|   |   `-- utils/
|   |-- package.json
|   `-- vite.config.js
|-- .env.example
|-- requirements.txt
`-- README.md
```

## Environment Variables

This project uses a single root `.env` file for both backend and frontend configuration.

Create `.env` from `.env.example`:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Notes:

- `OPENAI_API_KEY` is used only by the backend
- `VITE_API_BASE_URL` is exposed to the frontend because it starts with `VITE_`
- Do not place secrets in `VITE_` variables

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Agentic AI trip navigator"
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

On Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 5. Create the environment file

Copy `.env.example` to `.env` and fill in your OpenAI API key.

## Running the App

You need two terminals.

### Terminal 1: Start the backend

```bash
cd backend
uvicorn app.main:app --reload
```

Backend URLs:

- API root: `http://127.0.0.1:8000/`
- Swagger UI: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/v1/health`

### Terminal 2: Start the frontend

```bash
cd frontend
npm run dev
```

Frontend URL:

- `http://127.0.0.1:5173`

## API Overview

### `GET /api/v1/health`

Returns a simple health response from the backend.

### `POST /api/v1/trips/plan`

Generates a trip itinerary.

Request example:

```json
{
  "from_city": "Colombo",
  "destination_city": "New Delhi",
  "departure_date": "2026-06-10",
  "return_date": "2026-06-14",
  "interests": ["food", "history", "shopping"]
}
```

Response shape:

```json
{
  "destination_city": "New Delhi",
  "summary": "Trip summary...",
  "daily_plan": [
    {
      "day": 1,
      "title": "Day 1: Arrival and exploration",
      "activities": ["Activity 1", "Activity 2"]
    }
  ],
  "estimated_budget": "Budget details...",
  "travel_tips": ["Tip 1", "Tip 2"],
  "location_report": {
    "agent_name": "location_expert",
    "content": "..."
  },
  "guide_report": {
    "agent_name": "guide_expert",
    "content": "..."
  },
  "planner_report": {
    "agent_name": "planner_expert",
    "content": "..."
  },
  "markdown_itinerary": "Full itinerary in markdown"
}
```

## Frontend Behavior

The frontend sends trip requests to:

`VITE_API_BASE_URL/trips/plan`

By default this resolves to:

`http://127.0.0.1:8000/api/v1/trips/plan`

## Development Notes

- The backend expects the root `.env` file even when you run `uvicorn` from the `backend` directory
- The frontend reads environment variables from the repo root through `vite.config.js`
- If the backend is not running, the frontend will show an error when submitting a trip request

## License

Add your preferred license here before publishing the repository.
