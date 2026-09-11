import { useEffect, useRef, useState, type ReactNode } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

type SheetState = "collapsed" | "expanded";

const COLLAPSED_HEIGHT = 88; // px — just the handle + summary row
const EXPANDED_HEIGHT_VH = 78; // vh — leaves the map visible above it

type MobileBottomSheetProps = {
  summaryLabel: ReactNode;
  children: ReactNode;
};

export const MobileBottomSheet = ({ summaryLabel, children }: MobileBottomSheetProps) => {
  const [sheetState, setSheetState] = useState<SheetState>("collapsed");
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragStartHeight = useRef<number>(COLLAPSED_HEIGHT);

  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const expandedHeightPx = (viewportHeight * EXPANDED_HEIGHT_VH) / 100;

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY;
    dragStartHeight.current = sheetState === "expanded" ? expandedHeightPx : COLLAPSED_HEIGHT;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current === null) return;
    const delta = dragStartY.current - e.clientY; // positive = dragging up
    setDragHeight(
      Math.min(expandedHeightPx, Math.max(COLLAPSED_HEIGHT, dragStartHeight.current + delta))
    );
  };

  const endDrag = () => {
    if (dragStartY.current === null) return;
    const current = dragHeight ?? dragStartHeight.current;
    const threshold = (expandedHeightPx + COLLAPSED_HEIGHT) / 2;
    setSheetState(current > threshold ? "expanded" : "collapsed");
    setDragHeight(null);
    dragStartY.current = null;
  };

  // Fires for a genuine tap (the browser suppresses `click` after a real
  // drag), so this is the tap-to-toggle path independent of the drag logic.
  const handleClick = () => {
    setSheetState((s) => (s === "expanded" ? "collapsed" : "expanded"));
  };

  const height = dragHeight ?? (sheetState === "expanded" ? expandedHeightPx : COLLAPSED_HEIGHT);
  const isDragging = dragHeight !== null;

  return (
    <div
      style={{ height }}
      className={`relative z-10 flex flex-col w-full bg-[var(--color-surface)] rounded-t-3xl shadow-[0_-8px_24px_rgba(16,40,26,0.14)] overflow-hidden ${
        isDragging ? "" : "transition-[height] duration-300 ease-out"
      }`}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-expanded={sheetState === "expanded"}
        aria-label={sheetState === "expanded" ? "Collapse bench list" : "Expand bench list"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className="shrink-0 flex flex-col items-center gap-2 pt-2.5 pb-2 px-4 touch-none select-none cursor-grab active:cursor-grabbing"
      >
        <span className="w-9 h-1.5 rounded-full bg-[var(--color-border)]" />
        <span className="w-full flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--color-text)]">{summaryLabel}</span>
          {sheetState === "expanded" ? (
            <FaChevronDown size={12} className="text-[var(--color-text-muted)]" />
          ) : (
            <FaChevronUp size={12} className="text-[var(--color-text-muted)]" />
          )}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
    </div>
  );
};
