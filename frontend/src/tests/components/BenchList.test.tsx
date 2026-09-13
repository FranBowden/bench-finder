import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BenchList } from "../../components/BenchList";
import type { BenchWithDirection } from "@shared/types";

const bench: BenchWithDirection = {
  id: 1,
  lat: 51.5,
  lng: -0.1,
  originalIndex: 0,
  distanceMiles: 0.3,
  durationMinutes: 6,
};

describe("BenchList", () => {
  it("shows a loading skeleton while loading", () => {
    const { container } = render(
      <BenchList benchesWithDirection={[]} selectedBenchIndex={null} onBenchClick={vi.fn()} loading />
    );
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it("shows an empty state when there are no benches and it isn't loading", () => {
    render(<BenchList benchesWithDirection={[]} selectedBenchIndex={null} onBenchClick={vi.fn()} />);
    expect(screen.getByText(/no benches found nearby/i)).toBeInTheDocument();
  });

  it("shows the error message instead of the empty state when a fetch failed", () => {
    render(
      <BenchList
        benchesWithDirection={[]}
        selectedBenchIndex={null}
        onBenchClick={vi.fn()}
        error="Too many requests right now — please wait a moment and try again."
      />
    );
    expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    expect(screen.queryByText(/no benches found nearby/i)).not.toBeInTheDocument();
  });

  it("renders a row per bench and calls onBenchClick with its list position", () => {
    const onBenchClick = vi.fn();
    render(
      <BenchList
        benchesWithDirection={[bench]}
        selectedBenchIndex={null}
        onBenchClick={onBenchClick}
      />
    );

    screen.getByText("0.30 mi away").closest("button")!.click();

    expect(onBenchClick).toHaveBeenCalledWith(0);
  });

  it("does not render tag chips for real Overpass-shaped tags (Record<string,string>)", () => {
    // Documents a known, still-open gap: Overpass tags come back as raw
    // OSM key/value pairs, not the array of label strings this component
    // renders via Array.isArray(bench.tags) — see the design skill notes.
    // This test should start failing (in a good way) once that's fixed.
    const realShapedBench = { ...bench, tags: { backrest: "yes" } };
    render(
      <BenchList
        benchesWithDirection={[realShapedBench]}
        selectedBenchIndex={null}
        onBenchClick={vi.fn()}
      />
    );

    expect(screen.queryByText("yes")).not.toBeInTheDocument();
  });

  it("renders distance in km when unit is km", () => {
    render(
      <BenchList
        benchesWithDirection={[bench]}
        selectedBenchIndex={null}
        onBenchClick={vi.fn()}
        unit="km"
      />
    );

    expect(screen.getByText(/km away$/)).toBeInTheDocument();
  });
});
