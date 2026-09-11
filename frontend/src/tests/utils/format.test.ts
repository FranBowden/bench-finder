import { describe, it, expect } from "vitest";
import { formatBenchCount, metresToMiles, milesToMetres } from "../../utils/format";

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
