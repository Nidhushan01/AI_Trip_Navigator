const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export async function createTripPlan(payload) {
  const response = await fetch(`${API_BASE_URL}/trips/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await safeParseJson(response);
    const errorMessage =
      errorPayload?.detail ||
      `Trip planner request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}

async function safeParseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
