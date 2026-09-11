import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchSuggestions } from "../../api/searchAPI";

describe("fetchSuggestions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps Mapbox features to suggestions, swapping [lng, lat] to lat/lng", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          features: [
            {
              id: "place.123",
              text: "Hyde Park",
              place_name: "Hyde Park, London, UK",
              geometry: { coordinates: [-0.1, 51.5] },
            },
          ],
        }),
      })
    );

    const suggestions = await fetchSuggestions("Hyde Park");

    expect(suggestions).toEqual([
      {
        id: "place.123",
        name: "Hyde Park",
        place_name: "Hyde Park, London, UK",
        lat: 51.5,
        lng: -0.1,
      },
    ]);
  });

  it("throws when Mapbox responds with an error status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: "Server Error" })
    );

    await expect(fetchSuggestions("anywhere")).rejects.toThrow(
      "Mapbox geocoding error: 500 Server Error"
    );
  });

  it("throws if the request itself fails (e.g. network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchSuggestions("anywhere")).rejects.toThrow("network down");
  });
});
