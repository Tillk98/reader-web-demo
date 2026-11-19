import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, BookA, Check, ChevronRight, EyeOff, Languages, Play, Plus, Tags, TextCursorInput, Volume2 } from "lucide-react";
import flagIcon from "../assets/language_flag_icon.png";
import StatusButton, { BlueWordStatus, WORD_BAR_STATUSES } from "./StatusButton.jsx";

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

function placeCard(anchor, width, height) {
  const word = anchor.getBoundingClientRect();
  const margin = 8;
  let top = word.top - GAP - height;
  if (top < margin) top = word.bottom + GAP;
  if (top + height > window.innerHeight - margin) top = window.innerHeight - margin - height;
  if (top < margin) top = margin;

  const unclampedLeft = word.left + word.width / 2 - width / 2;
  const maxLeft = window.innerWidth - margin - width;

  return {
    top,
    left: clamp(unclampedLeft, margin, Math.max(margin, maxLeft)),
  };
}

function MediumStatusMenu({ anchorRef, status, onStatus, onClose }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    function place() {
      const button = anchorRef.current;
      const menu = menuRef.current;
      if (!button || !menu) return;
      const trigger = button.getBoundingClientRect();
      const width = menu.offsetWidth;
      const height = menu.offsetHeight;
      let left = trigger.right + 8;
      if (left + width > window.innerWidth - 8) left = Math.max(8, trigger.left - 8 - width);
      const margin = 8;
      let top = trigger.top + trigger.height / 2 - height / 2;
      if (top < margin) top = margin;
      if (top + height > window.innerHeight - margin) top = Math.max(margin, window.innerHeight - margin - height);
      setPos({ top, left });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef, status]);

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current?.contains(event.target)) return;
      if (anchorRef.current?.contains(event.target)) return;
      onClose();
    }
    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [anchorRef, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="widget-status-menu is-fixed"
      data-placed={pos ? "true" : "false"}
      role="menu"
      aria-label="Word status"
      style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0 }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {WORD_BAR_STATUSES.map((item) => (
        <StatusButton
          key={item}
          status={item}
          label
          state={item === status ? "focus" : "default"}
          onClick={() => onStatus(item)}
        />
      ))}
    </div>,
    document.body,
  );
}

function HeaderTools({ hideChevron, onOpenLarge, showStatus, showAudio = false, status, onToggleStatus, statusRef }) {
  if (hideChevron && !showStatus && !showAudio) return null;
  return (
    <div className="widget-medium-tools">
      {showStatus ? (
        <span className="widget-medium-status" ref={statusRef}>
          <StatusButton status={status} state="focus" onClick={onToggleStatus} />
        </span>
      ) : null}
      {showAudio ? (
        <button type="button" className="widget-medium-audio" aria-label="Play term">
          <Volume2 size={16} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
      ) : null}
      {hideChevron ? null : (
        <button type="button" className="widget-medium-chevron" aria-label="More details" onClick={onOpenLarge}>
          <ChevronRight size={16} strokeWidth={1.33} absoluteStrokeWidth />
        </button>
      )}
    </div>
  );
}

function SuggestedMeanings({ suggestions, onChoose }) {
  const rows = suggestions.filter(Boolean).slice(0, 2);
  if (!rows.length) return null;
  return (
    <div className="widget-medium-suggestions">
      <div className="widget-large-meanings">
        {rows.map((suggestion, index) => (
          <div
            key={`${suggestion}-${index}`}
            className="widget-large-meaning is-suggestion"
            role="button"
            tabIndex={0}
            onClick={() => onChoose(suggestion)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onChoose(suggestion);
              }
            }}
          >
            <p>{suggestion}</p>
            <span className="widget-suggested-add" aria-hidden="true">
              <Plus size={16} strokeWidth={1.33} absoluteStrokeWidth />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TagRow({ onSelectPhrase, onFromHere, quickStatus = false, onStatus }) {
  const drag = useDragScroll();
  return (
    <div className="widget-medium-tags" {...drag}>
      {quickStatus ? (
        <>
          <button type="button" className="widget-action is-icon" aria-label="Ignore" onClick={() => onStatus("Ignored")}>
            <EyeOff size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
          </button>
          <button type="button" className="widget-action is-icon" aria-label="Known" onClick={() => onStatus("Known")}>
            <Check size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
          </button>
        </>
      ) : null}
      <button type="button" className="widget-action" onClick={onSelectPhrase}>
        <TextCursorInput size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
        <span>Phrase</span>
      </button>
      <button type="button" className="widget-action" onClick={onFromHere}>
        <Play size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
        <span>From here</span>
      </button>
      <span className="widget-medium-tags-divider" aria-hidden="true" />
      <div className="widget-medium-tag-group">
        <button type="button" className="widget-medium-add-tag" aria-label="Add tag">
          <Tags size={16} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
        <div className="widget-medium-scroll">
          {TAGS.map((tag) => (
            <span key={tag} className="widget-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WidgetMedium({
  anchorId,
  boundaryRef,
  status,
  selectStatus = true,
  meaning,
  suggestions = [],
  isNew = false,
  isPhrase = false,
  onStatus,
  onChooseMeaning,
  onSelectPhrase,
  onFromHere,
  phraseError = null,
  onTranslate,
  onClose,
  onOpenLarge,
  hideChevron = false,
  fullStatusBar = true,
}) {
  const cardRef = useRef(null);
  const statusRef = useRef(null);
  const dictionaryDrag = useDragScroll();
  const [cardPos, setCardPos] = useState(null);
  const [statusMenu, setStatusMenu] = useState(false);
  const compactStatus = !fullStatusBar && !phraseError;
  const unsavedWord = isNew && !isPhrase && !phraseError;
  const buttonStatus = isNew ? "Blue" : status;

  useLayoutEffect(() => {
    const boundary = boundaryRef.current;
    const card = cardRef.current;
    const anchor = boundary?.querySelector(`[data-word-id="${anchorId}"]`);
    if (!boundary || !card || !anchor) return;
    setCardPos(placeCard(anchor, card.offsetWidth, card.offsetHeight));
  }, [anchorId, boundaryRef, meaning, isNew, suggestions, phraseError, status, hideChevron, fullStatusBar]);

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
      const nextCard = placeCard(anchor, card.offsetWidth, card.offsetHeight);
      setCardPos(nextCard);
    }

    boundary.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      boundary.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [anchorId, boundaryRef, onClose]);

  useEffect(() => {
    function onPointerDown(event) {
      if (cardRef.current?.contains(event.target)) return;
      if (event.target.closest?.(".word")) return;
      if (event.target.closest?.(".status-snackbar, .widget-status-menu")) return;
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

  return createPortal(
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
        ) : isNew && !unsavedWord ? (
          <>
            <div className="widget-medium-header is-suggested">
              <p className="widget-medium-suggested-label">Suggested Meanings</p>
              <HeaderTools
                hideChevron={hideChevron}
                onOpenLarge={onOpenLarge}
                showStatus={compactStatus}
                showAudio
                status={buttonStatus}
                onToggleStatus={() => onStatus("New")}
                statusRef={statusRef}
              />
            </div>
            <div className="widget-medium-content">
              <div className="widget-suggested">
                {suggestions.slice(0, 2).map((suggestion, index) => (
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
              <div className="widget-dictionaries">
                <button type="button" className="widget-dictionary-open" aria-label="Dictionaries">
                  <BookA size={16} strokeWidth={1.5} absoluteStrokeWidth />
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
            <TagRow onSelectPhrase={onSelectPhrase} onFromHere={onFromHere} quickStatus={compactStatus} onStatus={onStatus} />
          </>
        ) : (
          <>
            <div className="widget-medium-header">
              <p className="widget-medium-meaning">{meaning}</p>
              <HeaderTools
                hideChevron={hideChevron}
                onOpenLarge={onOpenLarge}
                showStatus={compactStatus && !unsavedWord}
                showAudio
                status={buttonStatus}
                onToggleStatus={() => setStatusMenu((open) => !open)}
                statusRef={statusRef}
              />
            </div>
            {unsavedWord ? <SuggestedMeanings suggestions={suggestions} onChoose={onChooseMeaning} /> : null}
            <TagRow onSelectPhrase={onSelectPhrase} onFromHere={onFromHere} quickStatus={compactStatus && !unsavedWord} onStatus={onStatus} />
          </>
        )}

        {!phraseError && !compactStatus && !unsavedWord ? (
          <div className="widget-medium-status-bar">
            {isNew ? (
              <BlueWordStatus
                onAdd={() => onStatus("New")}
                onKnown={() => onStatus("Known")}
                onIgnore={() => onStatus("Ignored")}
              />
            ) : WORD_BAR_STATUSES.map((item) => (
              <StatusButton
                key={item}
                status={item}
                state={selectStatus && item === status ? "focus" : "default"}
                onClick={() => onStatus(item)}
              />
            ))}
          </div>
        ) : null}
      </div>
      {compactStatus && statusMenu ? (
        <MediumStatusMenu
          anchorRef={statusRef}
          status={isNew ? null : status}
          onStatus={(next) => {
            setStatusMenu(false);
            onStatus(next);
          }}
          onClose={() => setStatusMenu(false)}
        />
      ) : null}
    </>,
    document.body,
  );
}
