export async function fetchSuggestions(query: string) {
  if (!query) return [];

  try {
    const res = await fetch(
      `http://localhost:3000/api/search?q=${encodeURIComponent(query)}`
    );

    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}
