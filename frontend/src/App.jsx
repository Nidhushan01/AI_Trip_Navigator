import { useState } from "react";

import { createTripPlan } from "./services/tripApi";
import { defaultFormState, parseInterests } from "./utils/form";

const initialResult = null;

function App() {
  const [form, setForm] = useState(defaultFormState);
  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = {
        from_city: form.fromCity.trim(),
        destination_city: form.destinationCity.trim(),
        departure_date: form.departureDate,
        return_date: form.returnDate,
        interests: parseInterests(form.interests),
      };

      const response = await createTripPlan(payload);
      setResult(response);
    } catch (submitError) {
      setResult(null);
      setError(
        submitError.message ||
          "We could not generate the trip plan. Please check the backend and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">FastAPI + LangGraph</p>
          <h1>Plan a richer trip with three specialized AI travel agents.</h1>
          <p className="hero-text">
            Build a full itinerary from logistics, local recommendations, and a
            final planner synthesis, all from your new backend API.
          </p>
        </div>

        <div className="hero-card">
          <span>Agents in flow</span>
          <strong>location_expert</strong>
          <strong>guide_expert</strong>
          <strong>planner_expert</strong>
        </div>
      </header>

      <main className="dashboard">
        <section className="panel form-panel">
          <div className="section-heading">
            <p>Trip Request</p>
            <h2>Create itinerary request</h2>
          </div>

          <form onSubmit={handleSubmit} className="trip-form">
            <label>
              <span>From city</span>
              <input
                name="fromCity"
                value={form.fromCity}
                onChange={handleChange}
                placeholder="Colombo"
                required
              />
            </label>

            <label>
              <span>Destination city</span>
              <input
                name="destinationCity"
                value={form.destinationCity}
                onChange={handleChange}
                placeholder="New Delhi"
                required
              />
            </label>

            <div className="date-grid">
              <label>
                <span>Departure date</span>
                <input
                  type="date"
                  name="departureDate"
                  value={form.departureDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Return date</span>
                <input
                  type="date"
                  name="returnDate"
                  value={form.returnDate}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label>
              <span>Interests</span>
              <textarea
                name="interests"
                value={form.interests}
                onChange={handleChange}
                placeholder="food, history, adventure"
                rows={4}
                required
              />
            </label>

            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Generating trip plan..." : "Generate travel plan"}
            </button>
          </form>

          {error ? <div className="error-box">{error}</div> : null}
        </section>

        <section className="panel results-panel">
          <div className="section-heading">
            <p>Response</p>
            <h2>Trip planner output</h2>
          </div>

          {!result ? (
            <div className="empty-state">
              <p>Your itinerary will appear here once the backend responds.</p>
              <small>
                Tip: keep the backend running on `http://127.0.0.1:8000` or set
                `VITE_API_BASE_URL`.
              </small>
            </div>
          ) : (
            <div className="results-stack">
              <section className="result-card featured">
                <p className="card-label">Summary</p>
                <h3>{result.destination_city}</h3>
                <p>{result.summary}</p>
                <div className="meta-row">
                  <span>{result.estimated_budget}</span>
                </div>
              </section>

              <section className="result-card">
                <p className="card-label">Daily Plan</p>
                <div className="daily-list">
                  {result.daily_plan.map((day) => (
                    <article key={`${day.day}-${day.title}`} className="daily-item">
                      <h4>
                        Day {day.day}: {day.title}
                      </h4>
                      <ul>
                        {day.activities.map((activity, index) => (
                          <li key={`${day.day}-${index}`}>{activity}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              <section className="result-grid">
                <article className="result-card">
                  <p className="card-label">Travel Tips</p>
                  <ul className="tip-list">
                    {result.travel_tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </article>

                <article className="result-card">
                  <p className="card-label">Agent Reports</p>
                  <div className="agent-list">
                    <div>
                      <h4>{result.location_report.agent_name}</h4>
                      <p>{result.location_report.content}</p>
                    </div>
                    <div>
                      <h4>{result.guide_report.agent_name}</h4>
                      <p>{result.guide_report.content}</p>
                    </div>
                    <div>
                      <h4>{result.planner_report.agent_name}</h4>
                      <p>{result.planner_report.content}</p>
                    </div>
                  </div>
                </article>
              </section>

              <section className="result-card">
                <p className="card-label">Markdown Itinerary</p>
                <pre className="markdown-output">{result.markdown_itinerary}</pre>
              </section>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
