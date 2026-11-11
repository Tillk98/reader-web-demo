import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Settings,
  Volume2,
  X,
} from "lucide-react";
import StatusButton, { WORD_BAR_STATUSES } from "./StatusButton.jsx";
import {
  LEAVE_BLUE,
  MOVE_STATUSES,
  statusOption,
} from "./accumulator.js";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function focusable(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter((node) => !node.disabled && node.tabIndex !== -1 && node.getClientRects().length > 0);
}

function SheetHandle({ onClose }) {
  const drag = useRef(null);

  function onPointerDown(event) {
    if (event.button !== 0) return;
    drag.current = { y: event.clientY, handled: false };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointer events cannot capture.
    }
  }

  function onPointerMove(event) {
    const current = drag.current;
    if (!current || current.handled) return;
    if (event.clientY - current.y < 40) return;
    current.handled = true;
    onClose();
  }

  function onClick() {
    if (drag.current?.handled) {
      drag.current = null;
      return;
    }
    onClose();
  }

  return (
    <button
      type="button"
      className="player-drag-handle"
      aria-label="Close"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onClick={onClick}
    />
  );
}

function useNarrow() {
  const query = "(max-width: 767px)";
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setNarrow(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);
  return narrow;
}

function useFocusTrap(open, ref, initial) {
  useEffect(() => {
    if (!open || !ref.current) return undefined;
    const root = ref.current;
    const previous = document.activeElement;
    const start = typeof initial === "string" ? root.querySelector(initial) : focusable(root)[0];
    start?.focus();
    function onKeyDown(event) {
      if (event.key !== "Tab") return;
      const items = focusable(root);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("keydown", onKeyDown);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open, ref, initial]);
}

function TermChips({ terms, onOpen }) {
  const shown = terms.slice(0, 4);
  const more = terms.length - shown.length;
  return (
    <button type="button" className="accumulator-card" onClick={onOpen}>
      <span className="accumulator-card-main">
        <span className="accumulator-card-copy">
          <span className="accumulator-card-heading">
            <span className="accumulator-count-line">
              <span className="accumulator-count">{terms.length}</span>
              {` blue ${terms.length === 1 ? "term" : "terms"} passed`}
            </span>
            <span className="accumulator-card-chevron" aria-hidden="true">
              <ChevronRight size={16} strokeWidth={1.5} absoluteStrokeWidth />
            </span>
          </span>
          <span className="accumulator-note">What should we do with them?</span>
        </span>
        <span className="accumulator-chips">
          {shown.map((term) => <span key={term.key}>{term.text}</span>)}
          {more > 0 ? <span className="is-more">{`+ ${more} more`}</span> : null}
        </span>
      </span>
    </button>
  );
}

function SplitButton({ status, options, onCommit, onSelect, menuUp = false, autoFocus = false, label = "Move these terms to …", action = null }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const current = statusOption(status);
  const actionLabel = action ? `${action[0].toUpperCase()}${action.slice(1)}` : null;
  const statusName = current.numeral ? `${current.button} (${current.numeral})` : current.button;

  useEffect(() => {
    if (!open) return undefined;
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        rootRef.current?.querySelector(".accumulator-split-main")?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function onMenuKeyDown(event) {
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = event.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
      items[next]?.focus();
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.activeElement?.click();
    }
  }

  return (
    <div className={`accumulator-split${menuUp ? " is-up" : ""}${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="accumulator-split-main"
        autoFocus={autoFocus}
        onClick={() => onCommit(status)}
      >
        {actionLabel ? `Move to ${statusName} and ${actionLabel}` : `Move to ${statusName}`}
      </button>
      <button
        type="button"
        className="accumulator-split-chevron"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <ChevronDown size={20} strokeWidth={1.5} absoluteStrokeWidth />
      </button>
      {open ? (
        <div
          ref={menuRef}
          className="accumulator-status-menu"
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
        >
          <p>{label}</p>
          {options.map((option) => (
            <StatusButton
              key={option.id}
              role="menuitem"
              status={option.id === "Leave Blue" ? "Blue" : option.id}
              label
              text={option.id === "Leave Blue" ? "Leave Blue" : undefined}
              state={option.id === status ? "focus" : "default"}
              onClick={() => {
                setOpen(false);
                onSelect(option.id);
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AutoMoveRow({ on, onOpen }) {
  return (
    <button type="button" className="accumulator-settings-row" onClick={onOpen}>
      <Settings size={16} strokeWidth={1.5} absoluteStrokeWidth />
      <span>Auto-move blue terms</span>
      <em>{on ? "On" : "Off"}</em>
      <ChevronRight size={16} strokeWidth={1.5} absoluteStrokeWidth />
    </button>
  );
}

export function ProgressPopover({
  open,
  terms,
  prefs,
  status,
  onApply,
  onSelect,
  onContinue,
  onClose,
  onOpenList,
  onOpenSettings,
  settingsOpen = false,
  covered = false,
  action = "exit",
}) {
  const panelRef = useRef(null);
  const narrow = useNarrow();
  useFocusTrap(open && !settingsOpen, panelRef, ".accumulator-split-main");
  useEffect(() => {
    if (!open || settingsOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, settingsOpen, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="accumulator-scrim is-progress" onClick={settingsOpen ? undefined : onClose}>
      <div
        ref={panelRef}
        className={`accumulator-popover${covered ? " is-covered" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-lesson-progress"
        onClick={(event) => event.stopPropagation()}
      >
        <SheetHandle onClose={onClose} />
        <header className="accumulator-popover-header">
          <h2 id="update-lesson-progress">Update Lesson Progress</h2>
          <button type="button" className="accumulator-close" aria-label="Close" onClick={onClose}>
            <X size={16} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
        </header>
        <TermChips terms={terms} onOpen={onOpenList} />
        <SplitButton status={status} options={MOVE_STATUSES} onCommit={onApply} onSelect={onSelect} menuUp={narrow} action={action} autoFocus />
        <button type="button" className="accumulator-secondary" onClick={onContinue}>
          {action === "finish" ? "Leave Blue and Finish" : "Leave Blue and Exit"}
          <ArrowRight size={16} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
        <div className="accumulator-dialog-divider" />
        <AutoMoveRow on={prefs.autoMove} onOpen={onOpenSettings} />
      </div>
    </div>,
    document.body,
  );
}

function TermRow({ term, peek, onPeekDone, onStatus, onOpen, onCancelPeek }) {
  const [offset, setOffset] = useState(0);
  const [leaving, setLeaving] = useState(null);
  const drag = useRef(null);

  useEffect(() => {
    if (!peek) return undefined;
    function onPointerDown() {
      onCancelPeek();
    }
    window.addEventListener("pointerdown", onPointerDown, { once: true });
    const timer = window.setTimeout(onPeekDone, 2600);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.clearTimeout(timer);
    };
  }, [peek, onPeekDone, onCancelPeek]);

  function commit(status) {
    if (leaving) return;
    setLeaving(status);
    window.setTimeout(() => onStatus(term, status), 420);
  }

  function onPointerDown(event) {
    if (event.pointerType !== "touch" || leaving) return;
    onCancelPeek();
    drag.current = { x: event.clientX, y: event.clientY, axis: null };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    if (!drag.current.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      drag.current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (drag.current.axis !== "x") return;
    setOffset(Math.max(-140, Math.min(140, dx)));
  }

  function onPointerUp() {
    if (!drag.current) return;
    const next = offset;
    drag.current = null;
    if (next >= 80) commit("Known");
    else if (next <= -80) commit("Ignored");
    else setOffset(0);
  }

  return (
    <div className={`accumulator-row${leaving ? " is-leaving" : ""}${peek ? " is-peek" : ""}`}>
      <div className="review-row-clip">
        <div className="accumulator-row-under is-known"><Check size={16} strokeWidth={1.5} absoluteStrokeWidth /> Known</div>
        <div className="accumulator-row-under is-ignore">Ignore</div>
        <div
          className="review-row is-blue accumulator-row-face"
          style={offset ? { transform: `translateX(${offset}px)` } : undefined}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="review-row-lead">
            <span className="review-row-status">
              <StatusButton status={leaving === "New" ? "New" : "Blue"} state="focus" onClick={() => commit("New")} />
            </span>
            <button type="button" className="review-row-term" onClick={() => onOpen(term)}>{term.text}</button>
            <div className="review-row-audio">
              <span className="blue-status review-row-quick" role="group" aria-label={`Ignore or known ${term.text}`}>
                <StatusButton status="Ignored" state={leaving === "Ignored" ? "focus" : "default"} onClick={() => commit("Ignored")} />
                <StatusButton status="Known" state={leaving === "Known" ? "focus" : "default"} onClick={() => commit("Known")} />
              </span>
              <button type="button" className="review-speak" aria-label={`Play ${term.text}`}>
                <Volume2 size={16} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
            </div>
          </div>
          <p className="review-row-meaning">{term.meaning}</p>
          <div className="review-row-bar" role="group" aria-label={`Status for ${term.text}`}>
            {WORD_BAR_STATUSES.map((item) => (
              <StatusButton
                key={item}
                status={item}
                state={leaving === item ? "focus" : "default"}
                onClick={() => commit(item)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlueTermsModal({
  open,
  terms,
  status,
  swipeSeen,
  onStatus,
  onBulk,
  onSelect,
  onOpenTerm,
  onPeekSeen,
  onClose,
  onLeave,
  edited = false,
  action = null,
}) {
  const panelRef = useRef(null);
  const titleId = useId();
  const [peeking, setPeeking] = useState(false);
  const peekNoted = useRef(false);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open || swipeSeen || !coarse || !terms.length || peekNoted.current) return undefined;
    peekNoted.current = true;
    setPeeking(true);
    onPeekSeen();
    return undefined;
  }, [open, swipeSeen, coarse, terms.length, onPeekSeen]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="accumulator-scrim is-terms" onClick={onClose}>
      <div
        ref={panelRef}
        className="accumulator-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="accumulator-modal-header">
          <div>
            <h2 id={titleId}>
              <span className="accumulator-count">{terms.length}</span>
              {` blue ${terms.length === 1 ? "term" : "terms"} passed`}
            </h2>
            <p>What should we do with them?</p>
          </div>
          <button type="button" className="accumulator-close" aria-label="Close" onClick={onClose}>
            <X size={16} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
        </header>
        <div className="accumulator-rows">
          {terms.map((term, index) => (
            <div key={term.key}>
              <TermRow
                term={term}
                peek={peeking && index === 0}
                onPeekDone={() => setPeeking(false)}
                onCancelPeek={() => setPeeking(false)}
                onStatus={onStatus}
                onOpen={onOpenTerm}
              />
              {index < terms.length - 1 ? <div className="review-divider" /> : null}
            </div>
          ))}
        </div>
        <div className="accumulator-bulk">
          <SplitButton status={status} options={MOVE_STATUSES} onCommit={onBulk} onSelect={onSelect} menuUp action={action} />
          <div className={`accumulator-bulk-leave${edited ? " is-shown" : ""}`}>
            <div>
              <button
                type="button"
                className="accumulator-secondary"
                onClick={onLeave}
                tabIndex={edited ? undefined : -1}
                aria-hidden={edited ? undefined : true}
              >
                {action === "finish" ? "Leave Remaining Blue and Finish" : "Leave Remaining Blue and Exit"}
                <ArrowRight size={16} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Radio({ checked, label, note, onSelect }) {
  return (
    <button type="button" className={`accumulator-radio${checked ? " is-selected" : ""}`} role="radio" aria-checked={checked} onClick={onSelect}>
      <span className="accumulator-radio-mark" aria-hidden="true" />
      <span>
        <strong>{label}</strong>
        {note ? <em>{note}</em> : null}
      </span>
    </button>
  );
}

function AutoMoveFields({ prefs, onAutoMove, onMoveTo }) {
  const options = [...MOVE_STATUSES, LEAVE_BLUE];
  return (
    <>
      <section className="accumulator-setting-card">
        <h3>Move blue terms automatically</h3>
        <p>What should happen to blue terms when you read past them without tapping?</p>
        <div role="radiogroup" aria-label="Move blue terms automatically">
          <Radio
            checked={!prefs.autoMove}
            label="Off"
            note="Ask me when I finish or leave a lesson."
            onSelect={() => onAutoMove(false)}
          />
          <Radio
            checked={prefs.autoMove}
            label="On"
            note="Automatically update the status of blue terms I read past."
            onSelect={() => onAutoMove(true)}
          />
        </div>
      </section>
      {prefs.autoMove ? (
        <section className="accumulator-setting-card">
          <h3>Move them to</h3>
          <p>Also changes when you pick a status at the end of a lesson.</p>
          <div role="radiogroup" aria-label="Move them to">
            {options.map((option) => (
              <Radio
                key={option.id}
                checked={prefs.moveTo === option.id}
                label={option.menu}
                onSelect={() => onMoveTo(option.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

const APP_SETTINGS_SECTIONS = ["General", "Reader", "Review", "Lynx AI", "Playlist", "Languages"];

export function AutoMoveSettings({ open, prefs, onAutoMove, onMoveTo, onClose }) {
  const panelRef = useRef(null);
  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      onClose();
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="accumulator-scrim is-app-settings" onClick={onClose}>
      <div
        ref={panelRef}
        className="accumulator-settings app-settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-settings"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="app-settings-header">
          <Settings size={20} strokeWidth={1.5} absoluteStrokeWidth />
          <h2 id="app-settings">App Settings</h2>
          <button type="button" className="accumulator-close" aria-label="Close" onClick={onClose}>
            <X size={16} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
        </header>
        <div className="app-settings-body">
          <aside className="app-settings-nav" aria-label="Settings sections">
            <div>
              {APP_SETTINGS_SECTIONS.map((name) => (
                <div key={name} className={name === "Reader" ? "is-current" : ""} aria-current={name === "Reader" ? "page" : undefined}>
                  {name}
                </div>
              ))}
            </div>
            <span className="app-settings-more">More settings</span>
          </aside>
          <div className="app-settings-main">
            <AutoMoveFields prefs={prefs} onAutoMove={onAutoMove} onMoveTo={onMoveTo} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function OutcomeDialog({ open, title, coins = null, onClose }) {
  const panelRef = useRef(null);
  const titleId = useId();
  useFocusTrap(open, panelRef, ".accumulator-close");
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      onClose();
    }
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, onClose]);
  if (!open) return null;
  const blue = coins?.blue || 0;
  const terms = coins?.terms || 0;
  return createPortal(
    <div className="accumulator-scrim" onClick={onClose}>
      <div
        ref={panelRef}
        className="accumulator-popover"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="accumulator-popover-header outcome-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            <p>Refresh to reset the prototype.</p>
          </div>
          <button type="button" className="accumulator-close" aria-label="Close" onClick={onClose}>
            <X size={16} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
        </header>
        {coins ? (
          <div className="outcome-coins">
            <em>{`+ ${coins.total || 0} Coins`}</em>
            {blue > 0 ? <span>{`+ ${blue} from ${terms} known ${terms === 1 ? "term" : "terms"}`}</span> : null}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
