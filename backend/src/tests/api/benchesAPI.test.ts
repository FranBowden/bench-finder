import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchBenches, OverpassError } from "../../api/benchesAPI";

describe("fetchBenches", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a User-Agent header (Overpass rejects requests without one)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [] }) });
    vi.stubGlobal("fetch", fetchMock);

    await fetchBenches({ lat: 51.5, lng: -0.1 }, 500);

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["User-Agent"]).toBeTruthy();
  });

  it("parses node elements using lat/lon directly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          elements: [{ type: "node", lat: 51.5, lon: -0.1, tags: { backrest: "yes" } }],
        }),
      })
    );

    const benches = await fetchBenches({ lat: 51.5, lng: -0.1 }, 500);

    expect(benches).toHaveLength(1);
    expect(benches[0]).toMatchObject({ id: 0, lat: 51.5, lng: -0.1, tags: { backrest: "yes" } });
  });

  it("falls back to center.lat/lon for way/relation elements", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          elements: [{ type: "way", center: { lat: 51.6, lon: -0.2 }, tags: {} }],
        }),
      })
    );

    const benches = await fetchBenches({ lat: 51.5, lng: -0.1 }, 500);

    expect(benches).toHaveLength(1);
    expect(benches[0].lat).toBe(51.6);
    expect(benches[0].lng).toBe(-0.2);
  });

  it("filters out elements with no usable coordinates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ elements: [{ type: "node", tags: {} }] }) })
    );

    const benches = await fetchBenches({ lat: 51.5, lng: -0.1 }, 500);

    expect(benches).toHaveLength(0);
  });

  it("throws an OverpassError carrying the real status when Overpass errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429, statusText: "Too Many Requests" })
    );

    await expect(fetchBenches({ lat: 51.5, lng: -0.1 }, 500)).rejects.toEqual(
      expect.objectContaining({
        status: 429,
        message: "Overpass API request failed with 429 Too Many Requests",
      })
    );
    await expect(fetchBenches({ lat: 51.5, lng: -0.1 }, 500)).rejects.toBeInstanceOf(
      OverpassError
    );
  });

  it("throws if the request itself fails (e.g. network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchBenches({ lat: 51.5, lng: -0.1 }, 500)).rejects.toThrow("network down");
  });
});
