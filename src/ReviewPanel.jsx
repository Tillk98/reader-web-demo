import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  CirclePlus,
  ChevronRight,
  EyeOff,
  ListFilter,
  PanelRight,
  RotateCcw,
  Search,
  Tags,
  Volume2,
  X,
} from "lucide-react";
import StatusButton, { WORD_BAR_STATUSES } from "./StatusButton.jsx";
import { meaningsFor } from "./meanings.js";
import { phraseCovers } from "./phrases.js";
import { sentenceFor, termSnippet } from "./sentences.js";

const SORTS = ["Importance", "Status", "Creation Date", "A-Z", "Z-A"];
const MATCHES = ["Contains", "Starts With", "Ends With", "Source Text Containing", "Meaning Containing"];
const STATUS_RANK = {
  Blue: -1,
  New: 0,
  Recognized: 1,
  Familiar: 2,
  Learned: 3,
  Known: 4,
  Ignored: 5,
};
const FILTER_STATUSES = [
  { id: "Blue", label: "Blue Words", icon: CirclePlus },
  { id: "Ignored", icon: EyeOff },
  { id: "New", numeral: "1" },
  { id: "Recognized", numeral: "2" },
  { id: "Familiar", numeral: "3" },
  { id: "Learned", numeral: "4" },
  { id: "Known", icon: Check },
];

export function defaultFilters() {
  return { terms: "All", srsDue: false, statuses: ["Blue", "New", "Recognized", "Familiar"] };
}

export function cloneFilters(filters) {
  return { terms: filters.terms, srsDue: filters.srsDue, statuses: [...filters.statuses] };
}

export function passesFilter(item, filters) {
  if (filters.terms === "Words" && item.phraseId) return false;
  if (filters.terms === "Phrases" && !item.phraseId) return false;
  if (filters.srsDue) return false;
  return filters.statuses.includes(item.status);
}

export function filtersMatch(left, right) {
  if (left.terms !== right.terms || left.srsDue !== right.srsDue) return false;
  if (left.statuses.length !== right.statuses.length) return false;
  return left.statuses.every((status) => right.statuses.includes(status));
}

export function extraFilterCount(filters) {
  const base = defaultFilters();
  let count = 0;
  if (filters.terms !== base.terms) count += 1;
  if (Boolean(filters.srsDue) !== Boolean(base.srsDue)) count += 1;
  const statusesMatch = filters.statuses.length === base.statuses.length
    && base.statuses.every((status) => filters.statuses.includes(status));
  if (!statusesMatch) count += 1;
  return count;
}

export function ScopeFilterButton({ anchorRef, compact, label, extra, expanded, onClick, countPrefix = "+" }) {
  const showCount = extra > 0 && (countPrefix === "" || !compact);
  return (
    <button
      ref={anchorRef || undefined}
      type="button"
      className={`review-scope-filter${compact && !showCount ? " is-icon" : ""}`}
      aria-label={extra > 0 ? `Filter, ${label}, ${extra} more` : `Filter, ${label}`}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <ListFilter size={16} strokeWidth={1.5} absoluteStrokeWidth />
      {compact ? null : <span>{label}</span>}
      {showCount ? <span className="review-scope-filter-count">{countPrefix}{extra}</span> : null}
    </button>
  );
}

export function filtersAreActive(filters) {
  if (!filters) return false;
  return !filtersMatch(filters, defaultFilters());
}

function termNoun(terms, capitalized) {
  const noun = terms === "Words" ? "word" : terms === "Phrases" ? "phrase" : "term";
  return capitalized ? noun.charAt(0).toUpperCase() + noun.slice(1) : noun;
}

function termCountLabel(count, terms) {
  return `${count} ${termNoun(terms, false)}${count === 1 ? "" : "s"}`;
}

function joinedMeanings(values, fallback) {
  const list = (values || []).map((item) => String(item).trim()).filter(Boolean);
  if (list.length) return list.join(" ; ");
  return fallback || "";
}

function phraseInScope(phrase, scope) {
  if (!scope) return true;
  if (!phrase.start || !phrase.end) return false;
  for (const key of scope) {
    const [paragraphIndex, tokenIndex] = key.split("-").map(Number);
    if (phraseCovers(phrase, paragraphIndex, tokenIndex)) return true;
  }
  return false;
}

export function reviewTermsFrom(lesson, savedPhrases, scope = null) {
  const items = [];
  const seen = new Set();

  savedPhrases.forEach((phrase) => {
    if (!phraseInScope(phrase, scope)) return;
    const key = phrase.text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const context = phrase.start
      ? termSnippet(lesson[phrase.start.paragraphIndex], phrase.start.tokenIndex, phrase.end?.tokenIndex ?? phrase.start.tokenIndex)
      : null;
    const spoken = phrase.start
      ? sentenceFor(lesson, phrase.start.paragraphIndex, phrase.start.tokenIndex)
      : { text: phrase.text, translation: "" };
    items.push({
      id: `phrase-${phrase.id}`,
      phraseId: phrase.id,
      term: phrase.text,
      meaning: joinedMeanings(phrase.meanings, phrase.meaning),
      context,
      sentence: spoken.text,
      translation: spoken.translation,
      status: phrase.status || "New",
    });
  });

  function pushWord(token, paragraphIndex, tokenIndex) {
    if (scope && !scope.has(`${paragraphIndex}-${tokenIndex}`)) return;
    const key = token.value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const spoken = sentenceFor(lesson, paragraphIndex, tokenIndex);
    items.push({
      id: `${paragraphIndex}-${tokenIndex}-${key}`,
      phraseId: null,
      term: token.value,
      meaning: joinedMeanings(token.meanings, token.meaning || meaningsFor(token.value).join(" ; ")),
      context: termSnippet(lesson[paragraphIndex], tokenIndex),
      sentence: spoken.text,
      translation: spoken.translation,
      status: token.kind === "new" ? "Blue" : token.status,
    });
  }

  ["lingq", "known", "ignored", "new"].forEach((kind) => {
    lesson.forEach((paragraph, paragraphIndex) => {
      paragraph.forEach((token, tokenIndex) => {
        if (token.type !== "word" || token.kind !== kind) return;
        pushWord(token, paragraphIndex, tokenIndex);
      });
    });
  });

  return items;
}

export function reviewWordsFrom(terms, filters) {
  return terms.filter((item) => passesFilter(item, filters)).map((item) => ({
    word: item.term,
    meaning: item.meaning,
    status: item.status === "Blue" ? "New" : item.status,
    sentence: item.sentence || item.term,
    translation: item.translation || "",
    tags: [],
  }));
}

function ReviewStatusMenu({ anchorId, status, onStatus, onClose }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const button = document.querySelector(`[data-review-status="${CSS.escape(anchorId)}"]`);
    const menu = menuRef.current;
    if (!button || !menu) return;
    const trigger = button.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    let left = trigger.right + 8;
    if (left + width > window.innerWidth - 8) left = Math.max(8, trigger.left - 8 - width);
    let top = trigger.top;
    if (top + height > window.innerHeight - 8) top = Math.max(8, window.innerHeight - 8 - height);
    setPos({ top, left });
  }, [anchorId, status]);

  useEffect(() => {
    const list = document.querySelector(".review-list");
    function onPointerDown(event) {
      if (menuRef.current?.contains(event.target)) return;
      if (event.target.closest?.(`[data-review-status="${CSS.escape(anchorId)}"]`)) return;
      onClose();
    }
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onClose);
    list?.addEventListener("scroll", onClose, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onClose);
      list?.removeEventListener("scroll", onClose);
    };
  }, [anchorId, onClose]);

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

function termMatches(item, needle, match) {
  if (!needle) return true;
  const term = item.term.toLowerCase();
  const meaning = item.meaning.toLowerCase();
  if (match === "Starts With") return term.startsWith(needle);
  if (match === "Ends With") return term.endsWith(needle);
  if (match === "Source Text Containing") return term.includes(needle);
  if (match === "Meaning Containing") return meaning.includes(needle);
  return term.includes(needle) || meaning.includes(needle);
}

function MatchMenu({ anchorRef, selected, onSelect, onClose }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const button = anchorRef.current;
    const menu = menuRef.current;
    if (!button || !menu) return;
    const trigger = button.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    let left = trigger.right - width;
    if (left < 8) left = 8;
    if (left + width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - 8 - width);
    let top = trigger.bottom + 4;
    if (top + height > window.innerHeight - 8) top = Math.max(8, trigger.top - 4 - height);
    setPos({ top, left });
  }, [anchorRef, selected]);

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current?.contains(event.target)) return;
      if (anchorRef.current?.contains(event.target)) return;
      onClose();
    }
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onClose);
    };
  }, [anchorRef, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className="review-menu is-fixed"
      data-placed={pos ? "true" : "false"}
      role="menu"
      aria-label="Match mode"
      style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0 }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {MATCHES.map((option) => (
        <div className="review-menu-item" key={option}>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={selected === option}
            className={selected === option ? "is-selected" : ""}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}

function PanelClose({ sheet, onClose, closeIcon = "panel" }) {
  const useX = sheet || closeIcon === "x";
  return (
    <button
      type="button"
      className="widget-large-icon-button"
      aria-label={useX ? "Close" : "Close side panel"}
      onClick={onClose}
    >
      {useX
        ? <X size={18} strokeWidth={1.5} absoluteStrokeWidth />
        : <PanelRight size={18} strokeWidth={1.5} absoluteStrokeWidth />}
    </button>
  );
}

const CONTEXTS = [
  { id: "page", label: "Page" },
  { id: "sentence", label: "Sentence" },
  { id: "lesson", label: "Lesson" },
];

export function ReviewFilter({ initial, onApply }) {
  const [opened] = useState(() => ({ ...cloneFilters(initial), context: initial.context }));
  const [draft, setDraft] = useState(opened);
  const dirty = !filtersMatch(draft, opened) || draft.context !== opened.context;
  const allStatusesSelected = FILTER_STATUSES.every((status) => draft.statuses.includes(status.id));
  const someStatusesSelected = draft.statuses.length > 0 && !allStatusesSelected;

  function reset() {
    setDraft(opened);
  }

  function toggleStatus(status) {
    setDraft((current) => ({
      ...current,
      statuses: current.statuses.includes(status)
        ? current.statuses.filter((item) => item !== status)
        : [...current.statuses, status],
    }));
  }

  function toggleAllStatuses() {
    setDraft((current) => ({
      ...current,
      statuses: FILTER_STATUSES.every((status) => current.statuses.includes(status.id))
        ? []
        : FILTER_STATUSES.map((status) => status.id),
    }));
  }

  return (
    <div className="review-filter">
      <header className="review-filter-bar">
        <div className="review-filter-title">
          <ListFilter size={20} strokeWidth={1.5} absoluteStrokeWidth />
          <p>Review</p>
        </div>
        <div className="review-filter-actions">
          <button type="button" className="review-filter-icon" aria-label="Reset filters" onClick={reset} disabled={!dirty}>
            <RotateCcw size={20} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
          <button type="button" className={`review-filter-icon${dirty ? " is-dirty" : ""}`} aria-label="Apply filters" onClick={() => onApply({ ...cloneFilters(draft), context: draft.context })} disabled={!dirty}>
            <Check size={20} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
        </div>
      </header>
      <div className="review-filter-body">
        <section className="review-filter-section">
          <h3>Context</h3>
          <div className="review-filter-segment" role="radiogroup" aria-label="Context">
            {CONTEXTS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={draft.context === option.id}
                className={draft.context === option.id ? "is-selected" : ""}
                onClick={() => setDraft((current) => ({ ...current, context: option.id }))}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="review-filter-tags">
            <span>
              <Tags size={16} strokeWidth={1.5} absoluteStrokeWidth />
              Tags
            </span>
            <span>
              None
              <ChevronRight size={16} strokeWidth={1.5} absoluteStrokeWidth />
            </span>
          </div>
        </section>
        <section className="review-filter-section">
          <h3>Terms</h3>
          <div className="review-filter-segment" role="radiogroup" aria-label="Terms">
            {["All", "Words", "Phrases"].map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={draft.terms === option}
                className={draft.terms === option ? "is-selected" : ""}
                onClick={() => setDraft((current) => ({ ...current, terms: option }))}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="review-filter-srs">
            <div>
              <strong>SRS Due</strong>
              <p>Only show terms that are due to review.</p>
            </div>
            <button
              type="button"
              className={`review-filter-switch${draft.srsDue ? " is-on" : ""}`}
              role="switch"
              aria-checked={draft.srsDue}
              aria-label="SRS Due"
              onClick={() => setDraft((current) => ({ ...current, srsDue: !current.srsDue }))}
            >
              <span />
            </button>
          </div>
        </section>
        <section className="review-filter-section">
          <div className="review-filter-heading">
            <h3>Status</h3>
            <button
              type="button"
              className={`review-filter-select-all${allStatusesSelected ? " is-checked" : someStatusesSelected ? " is-mixed" : ""}`}
              role="checkbox"
              aria-checked={allStatusesSelected ? "true" : someStatusesSelected ? "mixed" : "false"}
              onClick={toggleAllStatuses}
            >
              Select all
              <i aria-hidden="true">
                {allStatusesSelected ? <Check size={12} strokeWidth={2.5} absoluteStrokeWidth /> : null}
              </i>
            </button>
          </div>
          <div className="review-filter-chips">
            {FILTER_STATUSES.map((status) => {
              const Icon = status.icon;
              const selected = draft.statuses.includes(status.id);
              return (
                <button
                  key={status.id}
                  type="button"
                  className={`review-filter-chip${selected ? " is-selected" : ""}`}
                  aria-pressed={selected}
                  onClick={() => toggleStatus(status.id)}
                >
                  {Icon ? <Icon size={16} strokeWidth={1.5} absoluteStrokeWidth /> : <span>{status.numeral}</span>}
                  {status.label ?? status.id}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function ReviewPanel({ terms, filters, onStatus, onClose, sheet = false, compact = false, embedded = false, closeIcon = "panel", onFilter, filterAnchorRef = null, scopeLabel = "Page", filterExtra = 0, filterCompact = false, filterOpen = false }) {
  const matchButtonRef = useRef(null);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [sort, setSort] = useState("Importance");
  const [sortOpen, setSortOpen] = useState(false);
  const [match, setMatch] = useState("Contains");
  const [matchOpen, setMatchOpen] = useState(false);
  const appliedFilters = filters ?? defaultFilters();
  const listed = useMemo(
    () => terms.filter((item) => passesFilter(item, appliedFilters)),
    [terms, appliedFilters],
  );
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = listed.filter((item) => termMatches(item, needle, match));
    return filtered
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        if (sort === "A-Z") return a.item.term.localeCompare(b.item.term, "de") || a.index - b.index;
        if (sort === "Z-A") return b.item.term.localeCompare(a.item.term, "de") || a.index - b.index;
        if (sort === "Status") {
          return (STATUS_RANK[a.item.status] ?? 9) - (STATUS_RANK[b.item.status] ?? 9) || a.index - b.index;
        }
        return a.index - b.index;
      })
      .map(({ item }) => item);
  }, [query, listed, sort, match]);
  const [motion, setMotion] = useState(null);
  const [arrivedTerm, setArrivedTerm] = useState(null);
  const motionTimers = useRef([]);
  const pendingStatus = useRef(null);
  const openItem = visible.find((item) => item.id === openId) || null;

  useEffect(() => () => {
    motionTimers.current.forEach((timer) => clearTimeout(timer));
    pendingStatus.current?.();
    pendingStatus.current = null;
  }, []);

  function chooseBlueStatus(item, status) {
    if (motion || item.status === status) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onStatus?.(item, status);
      return;
    }
    const stays = passesFilter({ ...item, status }, appliedFilters)
      && termMatches(item, query.trim().toLowerCase(), match);
    setOpenId(null);
    setArrivedTerm(null);
    setMotion({ id: item.id, status, phase: "show" });
    pendingStatus.current = () => onStatus?.(item, status);
    const leaveTimer = window.setTimeout(() => {
      setMotion((current) => (current?.id === item.id ? { ...current, phase: "leave" } : current));
    }, 1280);
    const doneTimer = window.setTimeout(() => {
      const commit = pendingStatus.current;
      pendingStatus.current = null;
      setMotion(null);
      commit?.();
      if (!stays) return;
      setArrivedTerm(item.term.toLowerCase());
      motionTimers.current.push(window.setTimeout(() => setArrivedTerm(null), 360));
    }, 1560);
    motionTimers.current.push(leaveTimer, doneTimer);
  }

  useEffect(() => {
    if (!sortOpen) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".review-sort-anchor")) return;
      setSortOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setSortOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sortOpen]);

  return (
    <section className={`review-panel${compact ? " is-compact" : ""}${embedded ? " is-embedded" : ""}`} aria-label="Vocabulary">
      <header className="review-panel-header">
        {embedded ? null : (
        <div className="review-header-bar">
          <h2>Vocabulary</h2>
          <PanelClose sheet={sheet} closeIcon={closeIcon} onClose={onClose} />
        </div>
        )}
        {compact ? null : (
        <div className="review-header-tools">
        <form className="review-search" onSubmit={(event) => event.preventDefault()}>
            <input
              type="search"
              value={query}
              placeholder="Search vocabulary"
              aria-label="Search vocabulary"
              onChange={(event) => {
                const next = event.target.value;
                setQuery(next);
                if (next) setMatchOpen(false);
              }}
            />
            {query ? (
              <button type="button" className="review-search-clear" aria-label="Clear search" onClick={() => setQuery("")}>
                <X size={14} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
            ) : null}
            {query ? null : (
              <button
                ref={matchButtonRef}
                type="button"
                className="review-search-contains"
                aria-haspopup="menu"
                aria-expanded={matchOpen}
                onClick={() => {
                  setOpenId(null);
                  setSortOpen(false);
                  setMatchOpen((open) => !open);
                }}
              >
                <span className="review-search-match">
                  <span className="review-search-match-text">{match}</span>
                  <span className="review-search-match-sizer" aria-hidden="true">Contains</span>
                </span>
                <ChevronDown size={14} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
            )}
            <button type="submit" className="review-search-submit" aria-label="Search">
              <Search size={14} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
          </form>
        {matchOpen ? (
          <MatchMenu
            anchorRef={matchButtonRef}
            selected={match}
            onSelect={(option) => {
              setMatch(option);
              setMatchOpen(false);
            }}
            onClose={() => setMatchOpen(false)}
          />
        ) : null}
        <div className="review-toolbar">
          <ScopeFilterButton
            anchorRef={filterAnchorRef}
            compact={filterCompact}
            label={scopeLabel}
            extra={filterExtra}
            expanded={filterOpen}
            onClick={onFilter}
          />
          <div className="review-toolbar-trailing">
            <div className="review-sort-anchor">
              <button
                type="button"
                className="review-sort"
                aria-haspopup="menu"
                aria-expanded={sortOpen}
                onClick={() => {
                  setOpenId(null);
                  setMatchOpen(false);
                  setSortOpen((open) => !open);
                }}
              >
                <ArrowUpDown size={16} strokeWidth={1.5} absoluteStrokeWidth />
                <span>{sort}</span>
              </button>
              {sortOpen ? (
                <div className="review-menu review-sort-menu" role="menu" aria-label="Sort">
                  {SORTS.map((option) => (
                    <div className="review-menu-item" key={option}>
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={sort === option}
                        className={sort === option ? "is-selected" : ""}
                        onClick={() => {
                          setSort(option);
                          setSortOpen(false);
                        }}
                      >
                        {option}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <span className="review-toolbar-divider" aria-hidden="true" />
            <p className="review-toolbar-count">{termCountLabel(listed.length, appliedFilters.terms)}</p>
          </div>
        </div>
        </div>
        )}
      </header>
      <div className="review-list">
        {visible.map((item, index) => {
          const moving = motion?.id === item.id;
          return (
          <div
            key={item.id}
            className={`review-row-wrap${moving && motion.phase === "leave" ? " is-leaving" : ""}${arrivedTerm === item.term.toLowerCase() ? " is-arrived" : ""}`}
          >
            <div className="review-row-clip">
            <div className={`review-row${item.status === "Blue" ? " is-blue" : ""}${moving ? " is-updating" : ""}`}>
              <div className="review-row-lead">
                <span className="review-row-status" data-review-status={item.id}>
                  {item.status === "Blue" ? (
                    <StatusButton
                      status={moving && motion.status === "New" ? "New" : "Blue"}
                      state="focus"
                      onClick={moving ? () => {} : () => chooseBlueStatus(item, "New")}
                    />
                  ) : (
                    <StatusButton
                      status={item.status}
                      state="focus"
                      onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
                    />
                  )}
                </span>
                <strong>{item.term}</strong>
                <div className="review-row-audio">
                  {item.status === "Blue" ? (
                    <span
                      className={`blue-status review-row-quick${moving && (motion.status === "Ignored" || motion.status === "Known") ? " is-collapsing" : ""}`}
                      data-choice={moving && (motion.status === "Ignored" || motion.status === "Known") ? motion.status : undefined}
                      role="group"
                      aria-label={`Ignore or known ${item.term}`}
                    >
                      <StatusButton
                        status="Ignored"
                        state={moving && motion.status === "Ignored" ? "focus" : "default"}
                        onClick={moving ? () => {} : () => chooseBlueStatus(item, "Ignored")}
                      />
                      <StatusButton
                        status="Known"
                        state={moving && motion.status === "Known" ? "focus" : "default"}
                        onClick={moving ? () => {} : () => chooseBlueStatus(item, "Known")}
                      />
                    </span>
                  ) : null}
                  <button type="button" className="review-speak" aria-label={`Play ${item.term}`}>
                    <Volume2 size={16} strokeWidth={1.5} absoluteStrokeWidth />
                  </button>
                </div>
              </div>
              <p className="review-row-meaning">{item.meaning}</p>
              <div className="review-row-sentence">
                <button type="button" className="review-speak" aria-label={`Play sentence for ${item.term}`}>
                  <Volume2 size={16} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
                <span>
                  {item.context?.lead ? "... " : null}
                  {item.context?.before}
                  {item.context?.term ? <strong>{item.context.term}</strong> : null}
                  {item.context?.after}
                  {item.context?.trail ? " ..." : null}
                </span>
              </div>
              <div className="review-row-bar" role="group" aria-label={`Status for ${item.term}`}>
                {WORD_BAR_STATUSES.map((status) => (
                  <StatusButton
                    key={status}
                    status={status}
                    state={(moving ? motion.status : item.status) === status ? "focus" : "default"}
                    onClick={() => chooseBlueStatus(item, status)}
                  />
                ))}
              </div>
            </div>
            {index < visible.length - 1 ? <div className="review-divider" /> : null}
            </div>
          </div>
          );
        })}
      </div>
      {openItem ? (
        <ReviewStatusMenu
          anchorId={openItem.id}
          status={openItem.status}
          onStatus={(status) => {
            setOpenId(null);
            onStatus?.(openItem, status);
          }}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </section>
  );
}
