import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchBenches, OverpassError, resetBenchCache } from "../../api/benchesAPI";

describe("fetchBenches", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    resetBenchCache();
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

  it("retries once when Overpass returns 429, then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 429, statusText: "Too Many Requests" })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          elements: [{ type: "node", lat: 51.5, lon: -0.1, tags: {} }],
        }),
      });
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();

    const resultPromise = fetchBenches({ lat: 51.5, lng: -0.1 }, 500);
    await vi.runAllTimersAsync();
    const benches = await resultPromise;

    expect(benches).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("gives up and throws an OverpassError after exhausting retries on repeated 429", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 429, statusText: "Too Many Requests" });
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();

    const resultPromise = fetchBenches({ lat: 51.5, lng: -0.1 }, 500);
    const rejection = expect(resultPromise).rejects.toEqual(
      expect.objectContaining({
        status: 429,
        message: "Overpass API request failed with 429 Too Many Requests",
      })
    );
    await vi.runAllTimersAsync();
    await rejection;

    // (initial attempt + MAX_RETRIES retries) per endpoint, tried across
    // all 3 endpoints before giving up
    expect(fetchMock).toHaveBeenCalledTimes(9);
  });

  it("retries once when Overpass returns 504, then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 504, statusText: "Gateway Timeout" })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          elements: [{ type: "node", lat: 51.5, lon: -0.1, tags: {} }],
        }),
      });
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();

    const resultPromise = fetchBenches({ lat: 51.5, lng: -0.1 }, 500);
    await vi.runAllTimersAsync();
    const benches = await resultPromise;

    expect(benches).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-retryable errors, but still tries the fallback endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, statusText: "Server Error" });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchBenches({ lat: 51.5, lng: -0.1 }, 500)).rejects.toBeInstanceOf(
      OverpassError
    );
    // one attempt per endpoint, no retries within any of them
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("throws if every endpoint's request fails (e.g. network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(fetchBenches({ lat: 51.5, lng: -0.1 }, 500)).rejects.toThrow("network down");
  });

  it("falls back to the mirror endpoint when the primary is unreachable", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new TypeError("fetch failed"), {
          cause: { code: "ECONNREFUSED" },
        })
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          elements: [{ type: "node", lat: 51.5, lon: -0.1, tags: {} }],
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const benches = await fetchBenches({ lat: 51.5, lng: -0.1 }, 500);

    expect(benches).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain("overpass-api.de");
    expect(fetchMock.mock.calls[1][0]).toContain("overpass.private.coffee");
  });

  it("caches results so a repeat request for the same location/radius skips Overpass", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        elements: [{ type: "node", lat: 51.5, lon: -0.1, tags: {} }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await fetchBenches({ lat: 51.5, lng: -0.1 }, 500);
    const second = await fetchBenches({ lat: 51.5, lng: -0.1 }, 500);

    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not cache a failed request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, statusText: "Server Error" });
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchBenches({ lat: 51.5, lng: -0.1 }, 500)).rejects.toBeInstanceOf(
      OverpassError
    );
    await expect(fetchBenches({ lat: 51.5, lng: -0.1 }, 500)).rejects.toBeInstanceOf(
      OverpassError
    );

    // one attempt per endpoint, per call
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });
});
