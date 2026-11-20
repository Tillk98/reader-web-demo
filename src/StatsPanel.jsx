import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, ChevronRight, ChevronUp, FlaskConical, Minus, Plus, Wrench, X } from "lucide-react";
import coin from "../assets/stats/coin.svg";
import flagPhoto from "../assets/stats/flag.png";
import flagMark from "../assets/stats/flag-mark.svg";
import closeIcon from "../assets/stats/close.svg";
import flame from "../assets/stats/flame.svg";
import flameBonus from "../assets/stats/flame-3x.svg";
import flameEmpty from "../assets/stats/flame-empty.svg";
import chevronMenu from "../assets/stats/chevron-menu.svg";
import pen from "../assets/stats/pen.svg";
import chevronRight16 from "../assets/stats/chevron-right-16.svg";
import chevronRight20 from "../assets/stats/chevron-right-20.svg";
import statLingqs from "../assets/stats/stat-lingqs.svg";
import statKnownRing from "../assets/stats/stat-known-ring.svg";
import statKnownBubble from "../assets/stats/stat-known-bubble.svg";
import statKnownMark from "../assets/stats/stat-known-mark.svg";
import statTime from "../assets/stats/stat-time.svg";
import statSpeed from "../assets/stats/stat-speed.svg";
import statListenRing from "../assets/stats/stat-listen-ring.svg";
import statListenMark from "../assets/stats/stat-listen-mark.svg";
import statWords from "../assets/stats/stat-words.svg";
import pen18 from "../assets/stats/pen-18.svg";

const WEEK = [
  { label: "Thu", kind: "on" },
  { label: "Fri", kind: "on" },
  { label: "Sat", kind: "bonus" },
  { label: "Sun", kind: "on" },
  { label: "Mon", kind: "on" },
  { label: "Tues", kind: "on" },
  { label: "Wed", kind: "on" },
];

const GOALS = {
  unstarted: { score: 0, multiple: 0, bonus: 0, bar: 0 },
  progress: { score: 20, multiple: 0, bonus: 0, bar: 10 },
  close: { score: 160, multiple: 0, bonus: 0, bar: 80 },
  met: { score: 200, multiple: 0, bonus: 0, bar: 100 },
  x2: { score: 400, multiple: 2, bonus: 100, bar: 100 },
  x3: { score: 600, multiple: 3, bonus: 200, bar: 100 },
};

const STATS = [
  { id: "reading", value: "350", rest: "/476 Words of Reading", fill: "61.0577%", color: "#ff9432", edit: "words", title: "Words of Reading" },
  { id: "listening", value: "1", rest: "/3.5 Hours of Listening", fill: "23.3173%", color: "#dd2525", edit: "time", title: "Hours of Listening" },
  { id: "lingqs", value: "90", rest: "/91 LingQs Created", fill: "89.4231%", color: "#42a564" },
  { id: "known", value: "42", rest: "/42 Known Words", fill: "100%", color: "#42a564" },
  { id: "learned", value: "4", rest: "/14 LingQs Learned", fill: "9.6154%", color: "#dd2525" },
  { id: "writing", value: "180", rest: "/500 Words of Writing", fill: "36%", color: "#ff9432", edit: "words", title: "Words of Writing" },
  { id: "speaking", value: "2", rest: "/8 Hours of Speaking", fill: "25%", color: "#e7a902", edit: "time", title: "Hours of Speaking" },
];

const PERIODS = [
  { id: "lesson", menu: "Current Lesson", title: "Current Lesson" },
  { id: "today", menu: "Today", title: "Today Activity" },
  { id: "7", menu: "7 Day", title: "7 Day Activity" },
  { id: "30", menu: "30 Day", title: "30 Day Activity" },
  { id: "month", menu: "This Month", title: "This Month Activity" },
  { id: "3", menu: "Last 3 Months", title: "Last 3 Months Activity" },
  { id: "6", menu: "Last 6 Months", title: "Last 6 Months Activity" },
  { id: "all", menu: "All Time", title: "All Time Activity" },
];

function usePhoneSheet() {
  const query = "(max-width: 767px)";
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setPhone(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);
  return phone;
}

function StatsSheetHandle({ onClose }) {
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

function Flame({ kind }) {
  if (kind === "bonus") {
    return (
      <span className="stats-flame">
        <span className="stats-flame-bonus">
          <img src={flameBonus} alt="" width={16.8} height={22.4} />
          <span>3X</span>
        </span>
      </span>
    );
  }
  return (
    <span className={`stats-flame${kind === "today" ? " is-ring" : ""}`}>
      <img src={kind === "off" || kind === "today" ? flameEmpty : flame} alt="" width={25.6} height={25.6} />
    </span>
  );
}

function weekDays(streak, goalMet) {
  return WEEK.map((day, index) => {
    const today = day.label === "Wed";
    if (streak === "none" || streak === "broken") return { ...day, kind: "off", today: false, dimmed: false };
    if (streak === "fresh" && index < 3) return { ...day, kind: "off", today: false, dimmed: true };
    if (today && !goalMet) return { ...day, kind: "today", today: true, dimmed: false };
    return { ...day, today, dimmed: false };
  });
}

function GoalNote({ goalId, urgent }) {
  if (goalId === "met" || goalId === "x2" || goalId === "x3") {
    return <p className="stats-goal-note">You met your daily goal!</p>;
  }
  const shown = urgent ? "2 hours and 10 minutes" : (goalId === "close" ? "5 hours and 20 minutes" : "12 hours and 4 minutes");
  const clock = <strong className={urgent ? "is-urgent" : undefined}>{shown}</strong>;
  if (goalId === "close") {
    return <p className="stats-goal-note">You have almost met your daily goal! You have {clock} to reach it.</p>;
  }
  return <p className="stats-goal-note">You have {clock} to reach your goal.</p>;
}

function DemoSelect({ label, value, options, open, onToggle, onChange }) {
  const current = options.find((option) => option.id === value) ?? options[0];
  return (
    <div className={`stats-demo-select${open ? " is-open" : ""}`}>
      <span>{label}</span>
      <div className="stats-demo-field">
        <button type="button" aria-expanded={open} aria-haspopup="listbox" onClick={onToggle}>
          {current.label}
          <img src={chevronMenu} alt="" width={20} height={20} />
        </button>
        {open ? (
          <div className="stats-demo-options" role="listbox" aria-label={label}>
            {options.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected={option.id === value}
                key={option.id}
                onClick={() => onChange(option.id)}
              >
                <span>{option.label}</span>
                {option.id === value ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DemoMenu({ anchorRef, children }) {
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    function place() {
      const button = anchorRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const width = Math.min(380, window.innerWidth - 24);
      let left = rect.right - width;
      if (left < 12) left = 12;
      if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
      setPos({ top: rect.bottom + 8, left, width });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef]);

  if (!pos) return null;

  return createPortal(
    <div className="stats-demo-menu" role="menu" aria-label="Demo states" style={{ top: pos.top, left: pos.left, width: pos.width }}>
      {children}
    </div>,
    document.body,
  );
}

function DemoToggle({ label, on, onClick }) {
  return (
    <button type="button" className="stats-demo-toggle" role="switch" aria-checked={on} onClick={onClick}>
      <span>{label}</span>
      <span className={`menu-toggle${on ? " is-on" : ""}`} aria-hidden="true"><span /></span>
    </button>
  );
}

const GOAL_FILTERS = [
  { id: "unstarted", label: "Not started" },
  { id: "progress", label: "In progress" },
  { id: "close", label: "Almost there" },
  { id: "met", label: "Goal met" },
  { id: "x2", label: "2× goal" },
  { id: "x3", label: "3× goal" },
];

const AFFORD_FILTERS = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

const STREAK_FILTERS = [
  { id: "week", label: "7 days" },
  { id: "none", label: "No streak" },
  { id: "fresh", label: "New account" },
  { id: "broken", label: "Broken" },
];

const DEMO_DEFAULTS = {
  goal: "x3",
  urgent: false,
  streak: "week",
  canAfford: true,
  showExtra: true,
};

function goalIsMet(goal) {
  return goal === "met" || goal === "x2" || goal === "x3";
}

function RepairDialog({ afford, onClose, onRepair }) {
  return createPortal(
    <div className="stats-repair-layer" onClick={onClose}>
      <div className="stats-repair-dialog" role="dialog" aria-modal="true" aria-labelledby="repair-streak-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="stats-edit-close" aria-label="Close" onClick={onClose}>
          <X size={16} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
        <h2 id="repair-streak-title">You lost your 7 day streak.</h2>
        <img src={flameEmpty} alt="" width={64} height={64} />
        {afford ? (
          <>
            <p className="stats-repair-ask">Want to repair it?</p>
            <p>For just <strong>100</strong> coins you can!</p>
            <div className="stats-repair-actions">
              <button type="button" className="stats-repair-later" onClick={onClose}>Not now</button>
              <button type="button" className="stats-repair-do" onClick={onRepair}>Repair it</button>
            </div>
          </>
        ) : (
          <p className="stats-repair-alert">You don’t have enough coins to repair your streak.</p>
        )}
      </div>
    </div>,
    document.body,
  );
}

function StepField({ label, value, onChange, allowNegative = false }) {
  return (
    <label className="stats-edit-field">
      {label ? <span className="stats-edit-label">{label}</span> : null}
      <input
        type="number"
        inputMode="numeric"
        step="1"
        min={allowNegative ? undefined : "0"}
        value={value}
        aria-label={label || "Amount"}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function StatEditPopover({ stat, anchorRef, onClose }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [pos, setPos] = useState(null);
  const [words, setWords] = useState("0");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const time = stat.edit === "time";

  useLayoutEffect(() => {
    function place() {
      const button = anchorRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const width = time ? 292 : 268;
      const height = time ? 176 : 168;
      let left = rect.left;
      let top = rect.bottom + 8;
      if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
      if (left < 12) left = 12;
      if (top + height > window.innerHeight - 12) top = Math.max(12, rect.top - 8 - height);
      setPos({ top, left, width });
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchorRef, time]);

  useEffect(() => {
    function onPointerDown(event) {
      if (event.target.closest?.(".stats-edit-popover, .stats-icon-button.is-edit")) return;
      onCloseRef.current();
    }
    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      onCloseRef.current();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  const focusedRef = useRef(false);

  useEffect(() => {
    if (!pos || focusedRef.current) return;
    focusedRef.current = true;
    panelRef.current?.querySelector("input")?.focus();
  }, [pos]);

  if (!pos) return null;

  return createPortal(
    <form
      ref={panelRef}
      className="stats-edit-popover"
      role="dialog"
      aria-label={stat.title}
      style={{ top: pos.top, left: pos.left, width: pos.width }}
      onSubmit={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2>{stat.title}</h2>
        <button type="button" className="stats-edit-close" aria-label="Close" onClick={onClose}>
          <X size={16} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
      </header>
      {time ? (
        <div className="stats-edit-time">
          <StepField label="Hours" value={hours} onChange={setHours} />
          <span className="stats-edit-colon" aria-hidden="true">:</span>
          <StepField label="Minutes" value={minutes} onChange={setMinutes} />
        </div>
      ) : (
        <>
          <StepField value={words} onChange={setWords} allowNegative />
          <p>Use negative values to subtract</p>
        </>
      )}
      {time ? (
        <div className="stats-edit-actions">
          <button type="submit" aria-label="Add">
            <Plus size={20} strokeWidth={2} absoluteStrokeWidth />
          </button>
          <button type="button" aria-label="Subtract" onClick={onClose}>
            <Minus size={20} strokeWidth={2} absoluteStrokeWidth />
          </button>
        </div>
      ) : (
        <button type="submit" className="stats-edit-update">Update</button>
      )}
    </form>,
    document.body,
  );
}

function StatRow({ stat, open, onToggle, onClose }) {
  const editRef = useRef(null);
  return (
    <div className="stats-row">
      <div className="stats-row-top">
        <div className="stats-row-value">
          <p>
            <strong>{stat.value}</strong>
            <span>{stat.rest}</span>
          </p>
          {stat.edit ? (
            <button
              ref={editRef}
              type="button"
              className="stats-icon-button is-edit"
              aria-label={`Edit ${stat.title}`}
              aria-expanded={open}
              onClick={onToggle}
            >
              <img src={pen} alt="" width={16} height={16} />
            </button>
          ) : null}
        </div>
        <div className="stats-row-side">
          <button type="button" className="stats-icon-button is-row" aria-label={stat.rest}>
            <img src={chevronRight16} alt="" width={16} height={16} />
          </button>
        </div>
      </div>
      <div className="stats-meter" aria-hidden="true">
        <span style={{ width: stat.fill, background: stat.color }} />
      </div>
      {open && stat.edit ? <StatEditPopover stat={stat} anchorRef={editRef} onClose={onClose} /> : null}
    </div>
  );
}

function BlueTermsCard({ terms, onOpen }) {
  const shown = terms.slice(0, 4);
  const more = terms.length - shown.length;
  if (!terms.length) return null;
  return (
    <button type="button" className="accumulator-card" onClick={onOpen}>
      <span className="accumulator-card-main">
        <span className="accumulator-card-copy">
          <span className="accumulator-card-heading">
            <span className="accumulator-count-line">
              <span>
                <span className="accumulator-count">{terms.length}</span>
                {` blue ${terms.length === 1 ? "term" : "terms"} passed`}
              </span>
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

function LessonTile({ label, value, icon, footer }) {
  return (
    <div className={`stats-tile${footer ? " is-split" : ""}`}>
      <div className="stats-tile-main">
        <div className="stats-tile-copy">
          <p>{label}</p>
          <strong>{value}</strong>
        </div>
        {icon}
      </div>
      {footer ? (
        <>
          <div className="stats-tile-rule" aria-hidden="true" />
          <div className="stats-tile-foot">
            <span>{footer}</span>
            <button type="button" className="stats-tile-edit" aria-label={`Edit ${label}`}>
              <img src={pen18} alt="" width={18} height={18} />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function LessonStats() {
  return (
    <div className="stats-lesson-stats">
      <div className="stats-lesson-row">
        <LessonTile label="LingQs Created" value="70" icon={<img src={statLingqs} alt="" width={32} height={32} />} />
        <LessonTile
          label="Known Words"
          value="1000"
          icon={(
            <span className="stats-glyph">
              <img src={statKnownRing} alt="" width={32} height={32} />
              <img className="is-bubble" src={statKnownBubble} alt="" width={20} height={19} />
              <img className="is-mark" src={statKnownMark} alt="" width={6} height={7} />
            </span>
          )}
        />
      </div>
      <div className="stats-lesson-row">
        <LessonTile label="Study Time" value="30m 48s" icon={<img src={statTime} alt="" width={32} height={32} />} />
        <LessonTile label="Reading Speed" value="33.8wmp" icon={<img src={statSpeed} alt="" width={32} height={32} />} />
      </div>
      <div className="stats-lesson-row">
        <LessonTile
          label="Listened"
          value="05m 04s"
          footer="1.0x"
          icon={(
            <span className="stats-glyph">
              <img src={statListenRing} alt="" width={32} height={32} />
              <img className="is-listen" src={statListenMark} alt="" width={15} height={14} />
            </span>
          )}
        />
        <LessonTile label="Read" value="200w" footer="1.0x" icon={<img src={statWords} alt="" width={32} height={32} />} />
      </div>
    </div>
  );
}

export default function StatsPanel({ onClose, terms = [], onOpenTerms }) {
  const [period, setPeriod] = useState("lesson");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const demoButtonRef = useRef(null);
  const [repairOpen, setRepairOpen] = useState(false);
  const [demo, setDemo] = useState(DEMO_DEFAULTS);
  const [filterMenu, setFilterMenu] = useState(null);
  const goalId = demo.goal;
  const streak = demo.streak;
  const current = PERIODS.find((item) => item.id === period) ?? PERIODS[0];
  const goal = GOALS[goalId];
  const goalMet = goal.score >= 200;
  const days = weekDays(streak, goalMet);
  const streakTitle = streak === "week" ? "7 Day Streak" : streak === "fresh" ? "4 Day Streak" : null;
  const activityStats = STATS.filter((stat) => demo.showExtra || (stat.id !== "writing" && stat.id !== "speaking"));
  const phone = usePhoneSheet();

  useEffect(() => {
    if (!menuOpen) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".stats-period")) return;
      setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!demoOpen) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".stats-demo, .stats-demo-menu")) return;
      setFilterMenu(null);
      setDemoOpen(false);
    }
    function onKeyDown(event) {
      if (event.key !== "Escape" || document.querySelector(".stats-edit-popover")) return;
      event.stopImmediatePropagation();
      if (filterMenu) {
        setFilterMenu(null);
        return;
      }
      setDemoOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [demoOpen, filterMenu]);

  useEffect(() => {
    if (!editId) return;
    const visible = period === "lesson" ? [] : (activityOpen ? activityStats : activityStats.slice(0, 3));
    if (!visible.some((stat) => stat.id === editId)) setEditId(null);
  }, [editId, period, activityOpen, demo.showExtra]);

  const panel = (
    <div
      className="stats-panel"
      role="dialog"
      aria-modal={phone ? true : undefined}
      aria-label="Stats"
      onClick={phone ? (event) => event.stopPropagation() : undefined}
    >
      {phone ? <StatsSheetHandle onClose={onClose} /> : null}
      <div className="stats-panel-header">
        <div className="stats-known">
          <span className="stats-flag">
            <img src={flagPhoto} alt="" width={32} height={24} />
            <img src={flagMark} alt="" width={32} height={24} />
          </span>
          <button type="button" className="stats-pill">
            40 Known Words
            <img src={chevronMenu} alt="" width={20} height={20} />
          </button>
        </div>
        <div className="stats-header-side">
          <div className="stats-demo">
            <button
              ref={demoButtonRef}
              type="button"
              className={`stats-icon-button is-demo${demoOpen ? " is-open" : ""}`}
              aria-label="Demo states"
              aria-expanded={demoOpen}
              aria-haspopup="menu"
              onClick={() => {
                setFilterMenu(null);
                setDemoOpen((open) => !open);
              }}
            >
              <FlaskConical size={20} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            {demoOpen ? (
              <DemoMenu anchorRef={demoButtonRef}>
                <DemoSelect
                  label="Daily goal"
                  value={demo.goal}
                  options={GOAL_FILTERS}
                  open={filterMenu === "goal"}
                  onToggle={() => setFilterMenu((open) => (open === "goal" ? null : "goal"))}
                  onChange={(goal) => {
                    setDemo((current) => ({ ...current, goal, urgent: goalIsMet(goal) ? false : current.urgent }));
                    setFilterMenu(null);
                  }}
                />
                <DemoToggle
                  label="Under 3 hours"
                  on={demo.urgent}
                  onClick={() => setDemo((current) => ({
                    ...current,
                    urgent: !current.urgent,
                    goal: !current.urgent && goalIsMet(current.goal) ? "progress" : current.goal,
                  }))}
                />
                <DemoSelect
                  label="Streak"
                  value={demo.streak}
                  options={STREAK_FILTERS}
                  open={filterMenu === "streak"}
                  onToggle={() => setFilterMenu((open) => (open === "streak" ? null : "streak"))}
                  onChange={(streakId) => {
                    setDemo((current) => ({ ...current, streak: streakId, canAfford: streakId === "broken" ? true : current.canAfford }));
                    setFilterMenu(null);
                  }}
                />
                {demo.streak === "broken" ? (
                  <DemoSelect
                    label="Can’t afford repair?"
                    value={demo.canAfford ? "no" : "yes"}
                    options={AFFORD_FILTERS}
                    open={filterMenu === "afford"}
                    onToggle={() => setFilterMenu((open) => (open === "afford" ? null : "afford"))}
                    onChange={(answer) => {
                      setDemo((current) => ({ ...current, canAfford: answer === "no" }));
                      setFilterMenu(null);
                    }}
                  />
                ) : null}
                <DemoToggle label="Writing and speaking" on={demo.showExtra} onClick={() => setDemo((current) => ({ ...current, showExtra: !current.showExtra }))} />
              </DemoMenu>
            ) : null}
          </div>
          <span className="stats-total">
            <span>470</span>
            <img src={coin} alt="" width={24} height={24} />
          </span>
          {phone ? null : (
            <button type="button" className="stats-icon-button is-close" aria-label="Close stats" onClick={onClose}>
              <img src={closeIcon} alt="" width={20} height={20} />
            </button>
          )}
        </div>
      </div>

      <div className="stats-panel-body">
        <BlueTermsCard terms={terms} onOpen={onOpenTerms} />

        <section className="stats-progress">
          <div className="stats-progress-block">
            {goal.multiple >= 2 ? (
              <div className="stats-coin-award">
                <span className="stats-multiplier" aria-hidden="true"><span>{goal.multiple}x</span></span>
                <p>{`+ ${goal.bonus} Coins`}</p>
              </div>
            ) : null}
            <div className="stats-progress-main">
              <div className="stats-progress-heading">
                <p>Today’s Progress</p>
                <span className="stats-coins">
                  <span>{`${goal.score}/200 Coins`}</span>
                  <img src={coin} alt="" width={24} height={24} />
                </span>
              </div>
              <div className="stats-goal-track" aria-hidden="true">
                <span style={{ width: `${goal.bar}%` }} />
              </div>
            </div>
            <GoalNote goalId={goalId} urgent={demo.urgent} />
          </div>
          <div className="stats-streak-rule" aria-hidden="true" />
          <div className="stats-streak">
            {streak === "broken" ? (
              <button type="button" className="stats-pill stats-show stats-repair" onClick={() => setRepairOpen(true)}>
                <Wrench size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
                Repair Streak
              </button>
            ) : null}
            {streakTitle ? <p>{streakTitle}</p> : null}
            <div className="stats-days">
              {days.map((day) => (
                <div className={`stats-day${day.today ? " is-today" : ""}${day.dimmed ? " is-dimmed" : ""}`} key={day.label}>
                  <Flame kind={day.kind} />
                  <span>{day.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="stats-activity-header">
            <div className="stats-period">
              <button
                type="button"
                className={`stats-pill${menuOpen ? " is-open" : ""}`}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {current.title}
                <ChevronDown size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
              </button>
              {menuOpen ? (
                <div className="stats-period-menu" role="menu">
                  {PERIODS.map((item) => (
                    <button
                      type="button"
                      role="menuitemradio"
                      aria-checked={item.id === period}
                      className={item.id === period ? "is-current" : undefined}
                      key={item.id}
                      onClick={() => {
                        setPeriod(item.id);
                        setMenuOpen(false);
                      }}
                    >
                      <span>{item.menu}</span>
                      {item.id === period ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {period === "lesson" ? null : (
              <button
                type="button"
                className={`stats-pill stats-show${activityOpen ? " is-open" : ""}`}
                onClick={() => setActivityOpen((open) => !open)}
              >
                {activityOpen ? "See Less" : "See More"}
                <ChevronUp size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
              </button>
            )}
          </div>
          {period === "lesson" ? <LessonStats /> : (
            <div className="stats-rows">
              {(activityOpen ? activityStats : activityStats.slice(0, 3)).map((stat) => (
                <StatRow
                  stat={stat}
                  key={stat.id}
                  open={editId === stat.id}
                  onToggle={() => setEditId((current) => (current === stat.id ? null : stat.id))}
                  onClose={() => setEditId(null)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <button type="button" className="stats-all">
        View All Statistics
        <img src={chevronRight20} alt="" width={20} height={20} />
      </button>
      {repairOpen ? (
        <RepairDialog
          afford={demo.canAfford}
          onClose={() => setRepairOpen(false)}
          onRepair={() => {
            setDemo((current) => ({ ...current, streak: "week", canAfford: true }));
            setRepairOpen(false);
          }}
        />
      ) : null}
    </div>
  );

  if (!phone) return panel;
  return createPortal(
    <div className="stats-sheet" onClick={onClose}>{panel}</div>,
    document.body,
  );
}
