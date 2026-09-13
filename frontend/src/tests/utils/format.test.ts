import { describe, it, expect } from "vitest";
import {
  formatBenchCount,
  formatDistance,
  formatDuration,
  metresToMiles,
  metresToUnit,
  milesToMetres,
} from "../../utils/format";

describe("formatBenchCount", () => {
  it("pluralizes correctly for 0, 1, and many", () => {
    expect(formatBenchCount(0)).toBe("0 benches nearby");
    expect(formatBenchCount(1)).toBe("1 bench nearby");
    expect(formatBenchCount(5)).toBe("5 benches nearby");
  });
});

describe("metresToMiles / milesToMetres", () => {
  it("round-trips a value", () => {
    expect(metresToMiles(milesToMetres(1))).toBeCloseTo(1, 6);
  });

  it("converts a known distance", () => {
    expect(metresToMiles(1609.34)).toBeCloseTo(1, 4);
  });
});

describe("metresToUnit", () => {
  it("converts to miles or km depending on unit", () => {
    expect(metresToUnit(1609.34, "mi")).toBeCloseTo(1, 4);
    expect(metresToUnit(1000, "km")).toBeCloseTo(1, 6);
  });
});

describe("formatDistance / formatDuration", () => {
  it("formats distance in the given unit", () => {
    expect(formatDistance(1, "mi")).toBe("1.00 mi away");
    expect(formatDistance(1, "km")).toBe("1.61 km away");
  });

  it("formats duration, rounding up to at least 1 minute", () => {
    expect(formatDuration(0.2)).toBe("~1 mins");
    expect(formatDuration(6.4)).toBe("~6 mins");
  });
});
