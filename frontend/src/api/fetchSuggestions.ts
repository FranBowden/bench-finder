import type { Place } from "@shared/types/place";
import { fetchJson } from "./apiClient";

export type Suggestion = Place & {
  id: string | number;
  place_name: string;
};

type SuggestionsResponse = { suggestions?: Suggestion[] };

export async function fetchSuggestions(query: string): Promise<Suggestion[]> {
  if (!query) return [];

  const data = await fetchJson<SuggestionsResponse>("/api/search", { q: query });
  return data.suggestions ?? [];
}
