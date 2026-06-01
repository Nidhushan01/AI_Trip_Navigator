import { useState } from "react";

import { createTripPlan } from "./services/tripApi";
import { defaultFormState, parseInterests } from "./utils/form";

const initialResult = null;

function normalizeText(text) {
  return text.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
}

function parseMarkdownBlocks(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" "),
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) {
      return;
    }

    blocks.push({
      type: "list",
      items: [...listItems],
    });
    listItems = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (/^-{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push({ type: "divider" });
      return;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      return;
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1].trim());
      return;
    }

    const orderedListMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedListMatch) {
      flushParagraph();
      listItems.push(orderedListMatch[1].trim());
      return;
    }

    flushList();
    paragraphLines.push(line);
  });

  flushParagraph();
  flushList();

  return blocks;
}

function renderInlineMarkdown(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function getItineraryTitle(result) {
  const headingMatch = result.markdown_itinerary.match(/^#\s+(.+)$/m);
  return normalizeText(headingMatch?.[1] || result.destination_city);
}

function getSectionText(markdown, headingName) {
  const lines = markdown.split(/\r?\n/);
  const target = headingName.toLowerCase();
  let capture = false;
  const collected = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const headingMatch = line.match(/^#{2,6}\s+(.*)$/);

    if (headingMatch) {
      const currentHeading = normalizeText(headingMatch[1]).toLowerCase();
      if (capture) {
        break;
      }

      capture = currentHeading === target;
      continue;
    }

    if (capture && line && !/^-{3,}$/.test(line)) {
      collected.push(line);
    }
  }

  return normalizeText(collected.join(" "));
}

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

  const itineraryTitle = result ? getItineraryTitle(result) : "";
  const itinerarySummary = result
    ? getSectionText(result.markdown_itinerary, "Summary") ||
      normalizeText(result.summary)
    : "";
  const itineraryBlocks = result ? parseMarkdownBlocks(result.markdown_itinerary) : [];

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
              <span className="empty-state-kicker">Waiting for itinerary</span>
              <h3>Generated plans will show up here in a cleaner travel brief.</h3>
              <p>
                Submit a trip request and this panel will render the itinerary as
                readable sections instead of raw markdown.
              </p>
              <small>
                Keep the backend running on `http://127.0.0.1:8000` or set
                `VITE_API_BASE_URL`.
              </small>
            </div>
          ) : (
            <div className="results-stack">
              <section className="result-card featured">
                <p className="card-label">Itinerary Overview</p>
                <h3>{itineraryTitle}</h3>
                <p>{itinerarySummary}</p>
                <div className="meta-row">
                  <span>{normalizeText(result.estimated_budget)}</span>
                  <span>{result.destination_city}</span>
                </div>
              </section>

              <section className="result-card">
                <p className="card-label">Formatted Itinerary</p>
                <div className="markdown-rendered">
                  {itineraryBlocks.map((block, index) => {
                    if (block.type === "heading") {
                      if (block.level === 1) {
                        return (
                          <h3 key={index} className="markdown-h1">
                            {block.text}
                          </h3>
                        );
                      }

                      if (block.level === 2) {
                        return (
                          <h4 key={index} className="markdown-h2">
                            {block.text}
                          </h4>
                        );
                      }

                      return (
                        <h5 key={index} className="markdown-h3">
                          {block.text}
                        </h5>
                      );
                    }

                    if (block.type === "list") {
                      return (
                        <ul key={index} className="markdown-list">
                          {block.items.map((item, itemIndex) => (
                            <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
                          ))}
                        </ul>
                      );
                    }

                    if (block.type === "divider") {
                      return <div key={index} className="markdown-divider" />;
                    }

                    return (
                      <p key={index} className="markdown-paragraph">
                        {renderInlineMarkdown(block.text)}
                      </p>
                    );
                  })}
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
                  <p className="card-label">Agent Notes</p>
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
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
