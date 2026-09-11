import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleBenchClick } from "../../utils/handleBenchClick";
import { fetchDirection } from "../../api/fetchDirection";
import type { BenchWithDirection } from "@shared/types/BenchWithDirection";

vi.mock("../../api/fetchDirection", () => ({
  fetchDirection: vi.fn(),
}));

const bench: BenchWithDirection = {
  id: 1,
  lat: 51.51,
  lng: -0.12,
  originalIndex: 0,
  distanceText: "~0.3 mi away",
  durationText: "~6 mins",
  distanceMiles: 0.3,
  durationMinutes: 6,
};

describe("handleBenchClick", () => {
  let setBenchesWithDirection: ReturnType<typeof vi.fn>;
  let setSelectedBenchIndex: ReturnType<typeof vi.fn>;
  let setSelectedRoute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setBenchesWithDirection = vi.fn();
    setSelectedBenchIndex = vi.fn();
    setSelectedRoute = vi.fn();
  });

  it("selects the bench and draws its route WITHOUT changing the displayed distance/duration text", async () => {
    // The real routed figures are deliberately very different from the
    // list's straight-line estimate (0.3mi/6min) — the list must keep
    // showing its estimate rather than having the number jump around,
    // per explicit feedback that this felt "unreliable".
    const geojson = {
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: [] as [number, number][] },
    };
    vi.mocked(fetchDirection).mockResolvedValue({
      distanceMiles: 0.9,
      durationMinutes: 18,
      geojson,
    });

    await handleBenchClick(
      0,
      [bench],
      { lat: 51.5, lng: -0.1 },
      setBenchesWithDirection,
      setSelectedBenchIndex,
      setSelectedRoute
    );

    expect(setSelectedBenchIndex).toHaveBeenCalledWith(0);
    expect(setSelectedRoute).toHaveBeenCalledWith(geojson);

    const updater = setBenchesWithDirection.mock.calls[0][0];
    const updated = updater([bench]);
    expect(updated[0].geojson).toEqual(geojson);
    expect(updated[0].distanceText).toBe("~0.3 mi away");
    expect(updated[0].durationText).toBe("~6 mins");
  });

  it("does nothing when there is no user location", async () => {
    await handleBenchClick(
      0,
      [bench],
      null,
      setBenchesWithDirection,
      setSelectedBenchIndex,
      setSelectedRoute
    );

    expect(setSelectedBenchIndex).not.toHaveBeenCalled();
    expect(fetchDirection).not.toHaveBeenCalled();
  });

  it("does nothing when the bench has no coordinates", async () => {
    const badBench = { ...bench, lat: undefined, lng: undefined } as unknown as BenchWithDirection;

    await handleBenchClick(
      0,
      [badBench],
      { lat: 51.5, lng: -0.1 },
      setBenchesWithDirection,
      setSelectedBenchIndex,
      setSelectedRoute
    );

    expect(setSelectedBenchIndex).not.toHaveBeenCalled();
    expect(fetchDirection).not.toHaveBeenCalled();
  });

  it("does not update state when fetchDirection throws", async () => {
    vi.mocked(fetchDirection).mockRejectedValue(new Error("Mapbox returned invalid direction data"));

    await handleBenchClick(
      0,
      [bench],
      { lat: 51.5, lng: -0.1 },
      setBenchesWithDirection,
      setSelectedBenchIndex,
      setSelectedRoute
    );

    expect(setSelectedBenchIndex).toHaveBeenCalledWith(0);
    expect(setBenchesWithDirection).not.toHaveBeenCalled();
    expect(setSelectedRoute).not.toHaveBeenCalled();
  });
});
