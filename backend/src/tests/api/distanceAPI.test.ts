import { describe, it, expect, vi, afterEach } from "vitest";
import { getDirection } from "../../api/distanceAPI";

describe("getDirection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed distance/duration/geojson on a successful response", async () => {
    const mockRoute = {
      routes: [
        {
          distance: 1609.34, // 1 mile in meters
          duration: 600, // 10 minutes in seconds
          geometry: {
            type: "LineString",
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => mockRoute })
    );

    const result = await getDirection(
      { lat: 51.5, lng: -0.1 },
      { lat: 51.51, lng: -0.11 }
    );

    expect(result.distanceMiles).toBeCloseTo(1, 2);
    expect(result.durationMinutes).toBeCloseTo(10, 2);
    expect(result.geojson?.geometry.coordinates).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it("throws on a non-ok response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, statusText: "Server Error" });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getDirection({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })
    ).rejects.toThrow("Mapbox error 500: Server Error");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when Mapbox returns no routes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ routes: [] }) })
    );

    await expect(
      getDirection({ lat: 0, lng: 0 }, { lat: 0, lng: 0 })
    ).rejects.toThrow("No valid route returned by Mapbox");
  });
});
