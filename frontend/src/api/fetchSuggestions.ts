/*
export async function fetchSuggestions(query: string) {
  if (!query) return [];

  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const res = await fetch(
      `${API_URL}/api/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}
*/
