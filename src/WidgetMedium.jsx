import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, BookA, Brackets, Check, ChevronRight, EyeOff, Languages, Plus, Tags, Volume2 } from "lucide-react";
import flagIcon from "../assets/language_flag_icon.png";
import StatusButton, { WORD_BAR_STATUSES } from "./StatusButton.jsx";

const GAP = 8;
const TAGS = ["Noun", "Proper Noun"];
const DICTIONARIES = ["Google Translate", "Linguee", "DeepL", "WörterBuch"];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function useDragScroll() {
  const ref = useRef(null);

  function onPointerDown(event) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const scroller = ref.current;
    if (!scroller) return;

    const state = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
      moved: false,
    };

    function onMove(moveEvent) {
      if (moveEvent.pointerId !== state.pointerId) return;
      const delta = moveEvent.clientX - state.startX;
      if (Math.abs(delta) > 4) {
        state.moved = true;
        scroller.classList.add("is-dragging");
      }
      if (state.moved) scroller.scrollLeft = state.scrollLeft - delta;
    }

    function onUp(upEvent) {
      if (upEvent.pointerId !== state.pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      scroller.classList.remove("is-dragging");
      if (!state.moved) return;
      function stopClick(clickEvent) {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        scroller.removeEventListener("click", stopClick, true);
      }
      scroller.addEventListener("click", stopClick, true);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  return { ref, onPointerDown };
}

function placeCard(anchor, boundary, width, height) {
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

  return {
    top,
    left: clamp(unclampedLeft, minLeft, maxLeft),
  };
}

function placeMenu(button, boundary, width, height) {
  const trigger = button.getBoundingClientRect();
  const bounds = boundary.getBoundingClientRect();
  let left = trigger.right - bounds.left + boundary.scrollLeft + GAP;
  const minLeft = boundary.scrollLeft;
  const maxLeft = boundary.scrollLeft + boundary.clientWidth - width;

  if (left > maxLeft) {
    left = trigger.left - bounds.left + boundary.scrollLeft - GAP - width;
  }

  const minTop = boundary.scrollTop;
  const maxTop = boundary.scrollTop + boundary.clientHeight - height;
  const top = clamp(trigger.top - bounds.top + boundary.scrollTop, minTop, maxTop);

  return {
    top,
    left: clamp(left, minLeft, maxLeft),
  };
}

function TagRow() {
  return (
    <div className="widget-medium-tags">
      <button type="button" className="widget-medium-add-tag" aria-label="Add tag">
        <Tags size={18} strokeWidth={1.5} absoluteStrokeWidth />
      </button>
      <div className="widget-medium-scroll">
        {TAGS.map((tag) => (
          <span key={tag} className="widget-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function WidgetMedium({
  anchorId,
  boundaryRef,
  status,
  meaning,
  suggestions = [],
  isNew = false,
  statusMenu,
  onToggleStatusMenu,
  onStatus,
  onChooseMeaning,
  onSelectPhrase,
  phraseError = null,
  onTranslate,
  onClose,
  onOpenLarge,
}) {
  const cardRef = useRef(null);
  const menuRef = useRef(null);
  const statusButtonRef = useRef(null);
  const actionsDrag = useDragScroll();
  const dictionaryDrag = useDragScroll();
  const [cardPos, setCardPos] = useState(null);
  const [menuPos, setMenuPos] = useState(null);

  useLayoutEffect(() => {
    const boundary = boundaryRef.current;
    const card = cardRef.current;
    const anchor = boundary?.querySelector(`[data-word-id="${anchorId}"]`);
    if (!boundary || !card || !anchor) return;
    setCardPos(placeCard(anchor, boundary, card.offsetWidth, card.offsetHeight));
  }, [anchorId, boundaryRef, meaning, isNew, suggestions, phraseError]);

  useLayoutEffect(() => {
    const boundary = boundaryRef.current;
    const menu = menuRef.current;
    const button = statusButtonRef.current;
    if (!statusMenu || !boundary || !menu || !button) {
      setMenuPos(null);
      return;
    }
    setMenuPos(placeMenu(button, boundary, menu.offsetWidth, menu.offsetHeight));
  }, [anchorId, boundaryRef, statusMenu, status, cardPos]);

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
      const nextCard = placeCard(anchor, boundary, card.offsetWidth, card.offsetHeight);
      setCardPos(nextCard);
      const menu = menuRef.current;
      const button = statusButtonRef.current;
      if (statusMenu && menu && button) {
        setMenuPos(placeMenu(button, boundary, menu.offsetWidth, menu.offsetHeight));
      }
    }

    boundary.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      boundary.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [anchorId, boundaryRef, onClose, statusMenu]);

  useEffect(() => {
    function onPointerDown(event) {
      if (cardRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
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

  return (
    <>
      <div
        ref={cardRef}
        className={phraseError ? "phrase-error" : "widget-medium"}
        data-placed={cardPos ? "true" : "false"}
        role="dialog"
        data-variant={phraseError ? "error" : isNew ? "new" : "lingq"}
        aria-label={phraseError || (isNew ? "Suggested meanings" : meaning)}
        style={cardPos ? { top: cardPos.top, left: cardPos.left } : { top: 0, left: 0 }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {phraseError ? (
          <>
            <p className="phrase-error-text">{phraseError}</p>
            <div className="phrase-error-actions">
              <button type="button" className="phrase-error-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="phrase-error-translate" onClick={() => onTranslate(phraseError)}>
                <Languages size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
                <span>Google Translate</span>
                <ArrowUpRight size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
              </button>
            </div>
          </>
        ) : isNew ? (
          <>
            <div className="widget-medium-header is-suggested">
              <p className="widget-medium-suggested-label">Suggested Meanings</p>
              <div className="widget-medium-tools">
                <button type="button" className="widget-medium-chevron" aria-label="More details" onClick={onOpenLarge}>
                  <ChevronRight size={18} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
              </div>
            </div>
            <div className="widget-medium-content">
              <div className="widget-suggested">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion}-${index}`}
                    className="widget-suggested-row"
                    onClick={() => onChooseMeaning(suggestion)}
                  >
                    <p className="widget-suggested-meaning">{suggestion}</p>
                    <button
                      type="button"
                      className="widget-suggested-add"
                      aria-label={`Save ${suggestion}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onChooseMeaning(suggestion);
                      }}
                    >
                      <Plus size={16} strokeWidth={1.33} absoluteStrokeWidth />
                    </button>
                  </div>
                ))}
              </div>
              <TagRow />
              <div className="widget-dictionaries">
                <button type="button" className="widget-dictionary-open" aria-label="Dictionaries">
                  <BookA size={18} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
                <div className="widget-medium-scroll" {...dictionaryDrag}>
                  {DICTIONARIES.map((name) => (
                    <div key={name} className="widget-dictionary">
                      <img className="widget-dictionary-flag" src={flagIcon} alt="" width={24} height={18} />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="widget-medium-header">
              <div className="widget-medium-meaning-group">
                <button type="button" className="widget-medium-audio" aria-label="Play audio">
                  <Volume2 size={18} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
                <p className="widget-medium-meaning">{meaning}</p>
              </div>
              <div className="widget-medium-tools">
                <span ref={statusButtonRef}>
                  <StatusButton status={status} state="focus" onClick={onToggleStatusMenu} />
                </span>
                <button type="button" className="widget-medium-chevron" aria-label="More details" onClick={onOpenLarge}>
                  <ChevronRight size={18} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
              </div>
            </div>
            <TagRow />
          </>
        )}

        {phraseError ? null : (
        <div className="widget-medium-actions">
          <div className="widget-medium-scroll" {...actionsDrag}>
            <button type="button" className="widget-action" onClick={() => { onStatus("Ignored"); onClose(); }}>
              <EyeOff size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
              <span>Ignore</span>
            </button>
            <button type="button" className="widget-action" onClick={() => { onStatus("Known"); onClose(); }}>
              <Check size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
              <span>Known</span>
            </button>
            <button type="button" className="widget-action" onClick={onSelectPhrase}>
              <Brackets size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
              <span>Select Phrase</span>
            </button>
          </div>
        </div>
        )}
      </div>

      {statusMenu ? (
        <div
          ref={menuRef}
          className="widget-status-menu"
          data-placed={menuPos ? "true" : "false"}
          role="menu"
          aria-label="Word status"
          style={menuPos ? { top: menuPos.top, left: menuPos.left } : { top: 0, left: 0 }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          {WORD_BAR_STATUSES.map((item) => (
            <StatusButton
              key={item}
              status={item}
              label
              state={item === status ? "focus" : "default"}
              onClick={() => {
                onStatus(item);
                onToggleStatusMenu();
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
