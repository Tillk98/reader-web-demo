import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpDown,
  BookOpen,
  Check,
  ChevronDown,
  CirclePlus,
  ChevronRight,
  EyeOff,
  Library,
  ListFilter,
  Lock,
  PanelRight,
  RotateCw,
  Search,
  Tags,
  Volume2,
  X,
} from "lucide-react";
import StatusButton, { WORD_BAR_STATUSES } from "./StatusButton.jsx";
import { meaningsFor } from "./meanings.js";
import reviewIcon from "../assets/Vocabulary_Blue.png";

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
const COURSE_NAME = "YouTube auf Deutsch";
const LESSON_NAME = "Mehrere Sprachen auf einmal lernen?! Wie lange jeden Tag lernen?";

function defaultFilters() {
  return { terms: "All", srsDue: false, statuses: ["New", "Recognized", "Familiar"] };
}

function cloneFilters(filters) {
  return { terms: filters.terms, srsDue: filters.srsDue, statuses: [...filters.statuses] };
}

function passesFilter(item, filters) {
  if (filters.terms === "Words" && item.phraseId) return false;
  if (filters.terms === "Phrases" && !item.phraseId) return false;
  if (filters.srsDue) return false;
  return filters.statuses.includes(item.status);
}

function filtersMatch(left, right) {
  if (left.terms !== right.terms || left.srsDue !== right.srsDue) return false;
  if (left.statuses.length !== right.statuses.length) return false;
  return left.statuses.every((status) => right.statuses.includes(status));
}

function filtersAreActive(filters) {
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

function reviewActionLabel(count, terms) {
  return `Review ${count} ${termNoun(terms, true)}${count === 1 ? "" : "s"}`;
}

export function reviewTermsFrom(lesson, savedPhrases) {
  const items = [];
  const seen = new Set();

  savedPhrases.forEach((phrase) => {
    const key = phrase.text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({
      id: `phrase-${phrase.id}`,
      phraseId: phrase.id,
      term: phrase.text,
      meaning: phrase.meaning,
      status: phrase.status || "New",
    });
  });

  function pushWord(token, paragraphIndex, tokenIndex) {
    const key = token.value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push({
      id: `${paragraphIndex}-${tokenIndex}-${key}`,
      phraseId: null,
      term: token.value,
      meaning: token.meaning || meaningsFor(token.value).join(" ; "),
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

function PanelClose({ sheet, onClose }) {
  return (
    <button
      type="button"
      className="widget-large-icon-button"
      aria-label={sheet ? "Close" : "Close side panel"}
      aria-pressed={sheet ? undefined : true}
      onClick={onClose}
    >
      {sheet
        ? <X size={18} strokeWidth={1.5} absoluteStrokeWidth />
        : <PanelRight size={18} strokeWidth={1.5} absoluteStrokeWidth />}
    </button>
  );
}

function FilterPage({ draft, onDraft, onBack, onReset, onApply, onClose, sheet }) {
  const [clearing, setClearing] = useState(false);
  const allStatusesSelected = FILTER_STATUSES.every((status) => draft.statuses.includes(status.id));
  const someStatusesSelected = draft.statuses.length > 0 && !allStatusesSelected;
  const clearDisabled = !clearing && filtersMatch(draft, defaultFilters());

  function clearFilters() {
    if (clearDisabled || clearing) return;
    onReset();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setClearing(true);
  }

  function toggleStatus(status) {
    onDraft((current) => ({
      ...current,
      statuses: current.statuses.includes(status)
        ? current.statuses.filter((item) => item !== status)
        : [...current.statuses, status],
    }));
  }

  function toggleAllStatuses() {
    onDraft((current) => ({
      ...current,
      statuses: FILTER_STATUSES.every((status) => current.statuses.includes(status.id))
        ? []
        : FILTER_STATUSES.map((status) => status.id),
    }));
  }

  return (
    <div className="review-filter">
      <header className="review-panel-header">
        <div className="review-header-bar">
          <h2>Filters</h2>
          <button type="button" className="review-filter-clear" onClick={clearFilters} disabled={clearDisabled}>
            <span className={clearing ? "is-spinning" : ""} onAnimationEnd={() => setClearing(false)}>
              <RotateCw size={16} strokeWidth={1.5} absoluteStrokeWidth />
            </span>
            Clear
          </button>
          <PanelClose sheet={sheet} onClose={onClose} />
        </div>
      </header>
      <div className="review-filter-body">
        <section className="review-filter-section">
          <h3>Context</h3>
          <div className="review-filter-card">
            <div className="review-filter-row">
              <span className="review-filter-name is-muted">
                <Library size={16} strokeWidth={1.5} absoluteStrokeWidth />
                Course
              </span>
              <span className="review-filter-value">
                <Lock size={14} strokeWidth={1.5} absoluteStrokeWidth />
                <span>{COURSE_NAME}</span>
                <ChevronRight size={14} strokeWidth={1.5} absoluteStrokeWidth />
              </span>
            </div>
            <div className="review-filter-divider" />
            <div className="review-filter-row">
              <span className="review-filter-name is-muted">
                <BookOpen size={16} strokeWidth={1.5} absoluteStrokeWidth />
                Lesson
              </span>
              <span className="review-filter-value">
                <Lock size={14} strokeWidth={1.5} absoluteStrokeWidth />
                <span>{LESSON_NAME}</span>
                <ChevronRight size={14} strokeWidth={1.5} absoluteStrokeWidth />
              </span>
            </div>
            <div className="review-filter-divider" />
            <div className="review-filter-row">
              <span className="review-filter-name">
                <Tags size={16} strokeWidth={1.5} absoluteStrokeWidth />
                Tags
              </span>
              <span className="review-filter-value">
                <span>None</span>
                <ChevronRight size={14} strokeWidth={1.5} absoluteStrokeWidth />
              </span>
            </div>
          </div>
        </section>
        <section className="review-filter-section is-stack">
          <div>
            <h3>Terms</h3>
            <div className="review-filter-segment" role="radiogroup" aria-label="Terms">
              {["All", "Words", "Phrases"].map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={draft.terms === option}
                  className={draft.terms === option ? "is-selected" : ""}
                  onClick={() => onDraft((current) => ({ ...current, terms: option }))}
                >
                  {option}
                </button>
              ))}
            </div>
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
              onClick={() => onDraft((current) => ({ ...current, srsDue: !current.srsDue }))}
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
          <div className="review-filter-status">
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
          </div>
        </section>
      </div>
      <footer className="review-filter-footer">
        <button type="button" className="review-filter-cancel" onClick={onBack}>Cancel</button>
        <button type="button" className="review-filter-apply" onClick={onApply}>Apply</button>
      </footer>
    </div>
  );
}

export default function ReviewPanel({ terms, onStatus, onClose, onReview, sheet = false }) {
  const matchButtonRef = useRef(null);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [sort, setSort] = useState("Importance");
  const [sortOpen, setSortOpen] = useState(false);
  const [match, setMatch] = useState("Contains");
  const [matchOpen, setMatchOpen] = useState(false);
  const [page, setPage] = useState("list");
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [draftFilters, setDraftFilters] = useState(defaultFilters);
  const filtersActive = filtersAreActive(appliedFilters);
  const listed = useMemo(
    () => terms.filter((item) => passesFilter(item, appliedFilters ?? defaultFilters())),
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
  const openItem = visible.find((item) => item.id === openId) || null;

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

  function openFilters() {
    setSortOpen(false);
    setMatchOpen(false);
    setOpenId(null);
    setDraftFilters(appliedFilters ? cloneFilters(appliedFilters) : defaultFilters());
    setPage("filters");
  }

  return (
    <section className="review-panel" aria-label={page === "filters" ? "Filters" : "Vocabulary"}>
      {page === "filters" ? (
        <FilterPage
          draft={draftFilters}
          onDraft={setDraftFilters}
          onBack={() => setPage("list")}
          onReset={() => setDraftFilters(defaultFilters())}
          onApply={() => {
            setAppliedFilters(cloneFilters(draftFilters));
            setPage("list");
          }}
          onClose={onClose}
          sheet={sheet}
        />
      ) : null}
      {page === "filters" ? null : (
      <>
      <header className="review-panel-header">
        <div className="review-header-bar">
          <h2>Vocabulary</h2>
          <PanelClose sheet={sheet} onClose={onClose} />
        </div>
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
          <div className="review-toolbar-actions">
            <button type="button" className={`review-icon-button${filtersActive ? " is-active" : ""}`} aria-label="Filter" aria-pressed={filtersActive} onClick={openFilters}>
              <ListFilter size={16} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
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
                {sort}
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
          </div>
          <p>{termCountLabel(listed.length, (appliedFilters ?? defaultFilters()).terms)}</p>
        </div>
      </header>
      <div className="review-list">
        {visible.map((item, index) => (
          <div key={item.id}>
            <div className="review-row">
              <div className="review-row-term">
                <span data-review-status={item.id}>
                  <StatusButton
                    status={item.status}
                    state="focus"
                    onClick={() => setOpenId((current) => (current === item.id ? null : item.id))}
                  />
                </span>
                <span className="review-row-copy">
                  <strong>{item.term}</strong>
                  <em>{item.meaning}</em>
                </span>
              </div>
              <button type="button" className="review-speak" aria-label={`Play ${item.term}`}>
                <Volume2 size={16} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
            </div>
            {index < visible.length - 1 ? <div className="review-divider" /> : null}
          </div>
        ))}
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
      <footer className="review-footer">
        <button type="button" className="review-start" onClick={onReview}>
          <img src={reviewIcon} alt="" width={16} height={16} />
          {reviewActionLabel(listed.length, (appliedFilters ?? defaultFilters()).terms)}
        </button>
      </footer>
      </>
      )}
    </section>
  );
}
