const today = new Date().toISOString().slice(0, 10);

export const defaultFormState = {
  fromCity: "Colombo",
  destinationCity: "New Delhi",
  departureDate: today,
  returnDate: today,
  interests: "food, history, adventure",
};

export function parseInterests(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
