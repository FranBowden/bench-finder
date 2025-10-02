export async function fetchSuggestions(query: string) {
  if (!query) return [];

  try {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const res = await fetch(
      `${API_URL}/api/search?q=${encodeURIComponent(query)}`
    );
    
    const data = await res.json();

    return data["suggestions"];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
}
/*
 let sessionToken: string | null = null;

  function getSessionToken() {
  if (!sessionToken) {
    sessionToken = crypto.randomUUID(); // one token per "typing session"
  }
  return sessionToken;
}

export function resetSessionToken() {
  sessionToken = null; // call this after user selects a result or clears input
}*/