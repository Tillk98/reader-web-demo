import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StatusButton, { WORD_BAR_STATUSES } from "./StatusButton.jsx";

const GAP = 8;
const STATUS_BAR_WIDTH = 296;

function placeWidget(anchor, boundary, width, height) {
  const word = anchor.getBoundingClientRect();
  const bounds = boundary.getBoundingClientRect();
  const aboveTop = word.top - GAP - height;
  const placeBelow = aboveTop < bounds.top;
  const top = placeBelow
    ? word.bottom - bounds.top + boundary.scrollTop + GAP
    : aboveTop - bounds.top + boundary.scrollTop;
  const unclampedLeft = word.left - bounds.left + boundary.scrollLeft + word.width / 2 - width / 2;
  const minLeft = boundary.scrollLeft;
  const maxLeft = boundary.scrollLeft + boundary.clientWidth - width;
  const left = Math.min(Math.max(unclampedLeft, minLeft), Math.max(minLeft, maxLeft));

  return { top, left };
}

export default function WidgetSmall({
  anchorId,
  boundaryRef,
  status,
  meaning,
  mode,
  onMode,
  onStatus,
  onClose,
  onOpenLarge,
  hideChevron = false,
}) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const boundary = boundaryRef.current;
    const card = cardRef.current;
    const anchor = boundary?.querySelector(`[data-word-id="${anchorId}"]`);
    if (!boundary || !card || !anchor) return;

    const width = mode === "status" ? STATUS_BAR_WIDTH : card.offsetWidth;
    setPos(placeWidget(anchor, boundary, width, card.offsetHeight));
  }, [anchorId, boundaryRef, mode, status, meaning]);

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary) return undefined;

    function sync() {
      const card = cardRef.current;
      const anchor = boundary.querySelector(`[data-word-id="${anchorId}"]`);
      if (!card || !anchor) return;
      const word = anchor.getBoundingClientRect();
      const bounds = boundary.getBoundingClientRect();
      const inView = word.bottom > bounds.top && word.top < bounds.bottom;
      if (!inView) {
        onClose();
        return;
      }
      const width = mode === "status" ? STATUS_BAR_WIDTH : card.offsetWidth;
      setPos(placeWidget(anchor, boundary, width, card.offsetHeight));
    }

    boundary.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      boundary.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [anchorId, boundaryRef, mode, onClose]);

  useEffect(() => {
    function onPointerDown(event) {
      if (cardRef.current?.contains(event.target)) return;
      if (event.target.closest?.(".word")) return;
      if (event.target.closest?.(".status-snackbar")) return;
      onClose();
    }

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  function transition(update) {
    if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(() => {
        flushSync(update);
      });
      return;
    }
    update();
  }

  return (
    <div
      ref={cardRef}
      className="widget-small"
      data-mode={mode}
      data-placed={pos ? "true" : "false"}
      role="dialog"
      aria-label={mode === "status" ? "Word status" : meaning}
      style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0 }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {mode === "status" ? (
        <button
          type="button"
          className="widget-chevron"
          aria-label="Back to meaning"
          onClick={() => transition(() => onMode("meaning"))}
        >
          <ChevronLeft size={18} strokeWidth={1.17} absoluteStrokeWidth />
        </button>
      ) : null}

      {mode === "meaning" ? (
        <StatusButton
          status={status}
          state="focus"
          flipping
          onClick={() => transition(() => onMode("status"))}
        />
      ) : (
        WORD_BAR_STATUSES.map((item) => (
          <StatusButton
            key={item}
            status={item}
            state={item === status ? "focus" : "default"}
            flipping={item === status}
            onClick={() => {
              if (item !== status) onStatus(item);
              onClose();
            }}
          />
        ))
      )}

      {mode === "meaning" ? (
        <>
          <p className="widget-meaning">{meaning}</p>
          {hideChevron ? null : (
            <button type="button" className="widget-chevron" aria-label="More details" onClick={onOpenLarge}>
              <ChevronRight size={18} strokeWidth={1.17} absoluteStrokeWidth />
            </button>
          )}
        </>
      ) : null}
    </div>
  );
}
