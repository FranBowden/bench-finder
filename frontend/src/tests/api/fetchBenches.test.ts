import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchBenches } from "../../api/fetchBenches";

describe("fetchBenches", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("computes straight-line distance/duration for each bench and sorts by distance", async () => {
    const userLocation = { lat: 51.5074, lng: -0.1278 };
    const rawBenches = [
      { id: 1, lat: 51.52, lng: -0.14 }, // farther
      { id: 2, lat: 51.508, lng: -0.128 }, // closer
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => rawBenches }));

    const result = await fetchBenches(userLocation, 5000);

    expect(result).toHaveLength(2);
    // the closer bench should be sorted first, regardless of input order
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(1);
    expect(result[0].distanceMiles!).toBeLessThan(result[1].distanceMiles!);
    expect(result[0].distanceText).toMatch(/mi away$/);
    expect(result[0].durationText).toMatch(/^~\d+ mins$/);
  });

  it("filters out benches without numeric lat/lng", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 1, lat: 51.5, lng: -0.1 }, { id: 2 }],
      })
    );

    const result = await fetchBenches({ lat: 51.5, lng: -0.1 }, 1000);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("throws when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: "Server Error" })
    );

    await expect(fetchBenches({ lat: 51.5, lng: -0.1 }, 1000)).rejects.toThrow();
  });

  it("throws if the request itself fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchBenches({ lat: 51.5, lng: -0.1 }, 1000)).rejects.toThrow("network down");
  });
});
