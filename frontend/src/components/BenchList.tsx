import { FaWalking, FaRegClock, FaExclamationTriangle } from "react-icons/fa";
import type { BenchWithDirection } from "@shared/types/BenchWithDirection";
import benchIcon from "../../assets/bench.png";

type BenchListProps = {
  benchesWithDirection: BenchWithDirection[];
  selectedBenchIndex: number | null;
  onBenchClick: (index: number) => void;
  loading?: boolean;
  error?: string | null;
};

export function BenchList({
  benchesWithDirection,
  selectedBenchIndex,
  onBenchClick,
  loading,
  error,
}: BenchListProps) {
  return (
    <section className="px-4 sm:px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[var(--color-text)] text-base sm:text-lg font-bold tracking-tight">
          Nearby benches
        </h2>
        {!loading && !error && (
          <span className="text-xs font-semibold text-[var(--color-primary-dark)] bg-[var(--color-primary-50)] px-2.5 py-0.5 rounded-full">
            {benchesWithDirection.length}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-2" aria-live="polite" aria-busy="true">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[var(--color-bg)] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-8 px-4">
          <FaExclamationTriangle className="mx-auto mb-3 text-[var(--color-text-muted)]" size={28} />
          <p className="text-sm font-medium text-[var(--color-text)]">{error}</p>
        </div>
      )}

      {!loading && !error && benchesWithDirection.length === 0 && (
        <div className="text-center py-8 px-4">
          <img src={benchIcon} alt="" className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-[var(--color-text)]">No benches found nearby</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Try increasing the search radius above.
          </p>
        </div>
      )}

      {!loading && !error && benchesWithDirection.length > 0 && (
        <ul className="list-none flex flex-col gap-2">
          {benchesWithDirection.map((bench, sortedIndex) => {
            const selected = selectedBenchIndex === sortedIndex;
            return (
              <li key={bench.originalIndex}>
                <button
                  type="button"
                  onClick={() => onBenchClick(sortedIndex)}
                  className={`relative w-full text-left rounded-xl border pl-4 pr-3.5 py-3.5 overflow-hidden transition-all ${
                    selected
                      ? "bg-[var(--color-primary-50)] border-[var(--color-primary)] shadow-[var(--shadow-sm)]"
                      : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary-light)] hover:shadow-[var(--shadow-sm)]"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${
                      selected ? "bg-[var(--color-primary)]" : "bg-transparent"
                    }`}
                  />

                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-dark)] shrink-0">
                      <FaWalking size={13} />
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      {bench.distanceText}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto text-[var(--color-primary)]">
                      <FaRegClock size={13} />
                      <span className="text-sm font-bold">{bench.durationText}</span>
                    </div>
                  </div>

                  {Array.isArray(bench.tags) && bench.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pl-11">
                      {bench.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-[var(--color-primary-100)] text-[var(--color-primary-dark)] text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
