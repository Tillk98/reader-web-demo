import { Children, useEffect, useRef, useState } from "react";
import {
  BookA,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Flag,
  History,
  Info,
  NotebookPen,
  PanelRight,
  Plus,
  Tags,
  TextSearch,
  Volume2,
  X,
} from "lucide-react";
import flagIcon from "../assets/language_flag_icon.png";
import localeFlag from "../assets/flag-en.svg";
import lynxIcon from "../assets/lynx-icon-blue.png";
import sentenceIcon from "../assets/sentencemode_icon_light.png";
import StatusButton, { WORD_BAR_STATUSES } from "./StatusButton.jsx";

const TAGS = ["Noun", "Proper Noun"];
const DICTIONARIES = ["Google Translate", "Linguee", "DeepL", "WörterBuch"];
const MORE_DICTIONARIES = ["dict.cc", "Leo", "PONS", "Reverso"];

function SectionHeading({ icon, label, onOpen, onBack }) {
  return (
    <div className={`widget-large-heading${onBack ? " is-back" : ""}`}>
      {onBack ? (
        <button type="button" className="widget-large-heading-chevron" aria-label="Back" onClick={onBack}>
          <ChevronLeft size={16} strokeWidth={1.33} absoluteStrokeWidth />
        </button>
      ) : null}
      <div className="widget-large-heading-label">
        {icon}
        <span>{label}</span>
      </div>
      {onOpen ? (
        <button type="button" className="widget-large-heading-chevron" aria-label={`More ${label.toLowerCase()}`} onClick={onOpen}>
          <ChevronRight size={16} strokeWidth={1.33} absoluteStrokeWidth />
        </button>
      ) : null}
    </div>
  );
}

function TagRow() {
  return (
    <div className="widget-large-tags">
      <button type="button" className="widget-large-add-tag" aria-label="Add tag">
        <Tags size={16} strokeWidth={1.5} absoluteStrokeWidth />
      </button>
      <div className="widget-large-tag-scroll">
        {TAGS.map((tag) => (
          <span key={tag} className="widget-tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}

function DictionaryRow({ onOpen }) {
  return (
    <div className="widget-dictionaries widget-large-dictionaries">
      <button type="button" className="widget-dictionary-open" aria-label="Dictionaries" onClick={onOpen}>
        <BookA size={16} strokeWidth={1.5} absoluteStrokeWidth />
      </button>
      <div className="widget-medium-scroll">
        {DICTIONARIES.map((name) => (
          <div key={name} className="widget-dictionary">
            <img className="widget-dictionary-flag" src={flagIcon} alt="" width={24} height={18} />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DictionaryList({ names, addable = false }) {
  return (
    <div className="widget-large-meanings">
      {names.map((name) => (
        <div key={name} className="widget-large-dictionary-row">
          <img className="widget-dictionary-flag" src={flagIcon} alt="" width={24} height={18} />
          <p>{name}</p>
          {addable ? (
            <button type="button" className="widget-suggested-add" aria-label={`Add ${name}`}>
              <Plus size={16} strokeWidth={1.33} absoluteStrokeWidth />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function resizeField(field) {
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight}px`;
}

function MeaningRow({ meaning, onSave, onRemove, autoFocus = false }) {
  const fieldRef = useRef(null);
  const [phase, setPhase] = useState(autoFocus ? "edit" : "idle");
  const [draft, setDraft] = useState(meaning);
  const [focused, setFocused] = useState(autoFocus);
  const [revealed, setRevealed] = useState(false);
  const onRemoveRef = useRef(onRemove);
  onRemoveRef.current = onRemove;

  useEffect(() => {
    if (phase === "idle") setDraft(meaning);
  }, [meaning, phase]);

  useEffect(() => {
    if (phase !== "edit") return undefined;
    const field = fieldRef.current;
    if (!field) return undefined;
    resizeField(field);
    field.focus();
    return undefined;
  }, [phase]);

  useEffect(() => {
    if (phase !== "saved" && phase !== "removed") {
      setRevealed(false);
      return undefined;
    }
    let frame = 0;
    const first = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => setRevealed(true));
    });
    const done = window.setTimeout(() => {
      if (phase === "removed") onRemoveRef.current();
      else setPhase("idle");
    }, 1000);
    return () => {
      window.cancelAnimationFrame(first);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(done);
    };
  }, [phase]);

  function beginEdit() {
    setDraft(meaning);
    setFocused(true);
    setPhase("edit");
  }

  function save() {
    const next = draft.trim();
    if (!next || next === meaning) {
      if (!meaning) onRemove();
      else setPhase("idle");
      return;
    }
    onSave(next);
    setPhase("saved");
  }

  const editing = phase === "edit";
  const active = editing && focused;
  const confirming = phase === "saved" || phase === "removed";
  const showBadge = active || phase === "idle" || confirming;
  const className = [
    "widget-large-meaning",
    phase === "saved" ? "is-saved" : "",
    phase === "removed" ? "is-removed" : "",
    active ? "is-active" : "",
    editing && !active ? "is-edit" : "",
    revealed ? "is-revealed" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={className}>
      {editing ? (
        <textarea
          ref={fieldRef}
          className="widget-large-meaning-field"
          value={draft}
          rows={1}
          aria-label="Edit meaning"
          onChange={(event) => {
            setDraft(event.target.value);
            resizeField(event.target);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              save();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              if (!meaning) onRemove();
              else setPhase("idle");
            }
          }}
        />
      ) : (
        <p onClick={phase === "idle" ? beginEdit : undefined}>{draft || meaning}</p>
      )}
      {showBadge ? (
        <button
          type="button"
          className={[
            "widget-large-meaning-badge",
            phase === "idle" ? "is-remove" : "",
            confirming ? "is-status" : "",
            phase === "saved" ? "is-saved" : "",
            phase === "removed" ? "is-removed" : "",
            revealed ? "is-revealed" : "",
          ].filter(Boolean).join(" ")}
          aria-label={phase === "idle" ? "Remove meaning" : active ? "Save meaning" : undefined}
          tabIndex={confirming ? -1 : 0}
          onMouseDown={active ? (event) => event.preventDefault() : undefined}
          onClick={phase === "idle" ? () => setPhase("removed") : active ? save : undefined}
        >
          {active || phase === "saved" ? (
            <Check size={16} strokeWidth={1.33} absoluteStrokeWidth />
          ) : (
            <X size={16} strokeWidth={1.33} absoluteStrokeWidth />
          )}
          <span className="widget-large-meaning-badge-label">
            <span>{phase === "saved" ? "Saved" : phase === "removed" ? "Removed" : ""}</span>
          </span>
        </button>
      ) : null}
      {phase === "idle" || (editing && !active) || phase === "removed" ? (
        <img className="widget-large-locale" src={localeFlag} alt="" width={22} height={16} />
      ) : null}
    </div>
  );
}

function MeaningList({ meanings, onChange, allowAdd = false }) {
  const idRef = useRef(0);
  const [rows, setRows] = useState(() => meanings.map((text) => ({ id: idRef.current++, text })));
  const signature = meanings.join("\u0000");
  const applied = useRef(signature);
  const meaningsRef = useRef(meanings);
  meaningsRef.current = meanings;

  useEffect(() => {
    if (applied.current === signature) return;
    applied.current = signature;
    setRows(meaningsRef.current.map((text) => ({ id: idRef.current++, text })));
  }, [signature]);

  function commit(next) {
    const persisted = next.filter((row) => row.text.trim());
    applied.current = persisted.map((row) => row.text).join("\u0000");
    setRows(next);
    onChange(persisted.map((row) => row.text));
  }

  const drafting = rows.some((row) => row.pending);

  return (
    <div className={`widget-large-meanings${rows.length || allowAdd ? "" : " is-plain"}`}>
      {rows.map((row) => (
        <MeaningRow
          key={row.id}
          meaning={row.text}
          autoFocus={Boolean(row.pending)}
          onSave={(text) => commit(rows.map((item) => (
            item.id === row.id ? { ...item, text, pending: false } : item
          )))}
          onRemove={() => commit(rows.filter((item) => item.id !== row.id))}
        />
      ))}
      {allowAdd && !drafting ? (
        <button
          type="button"
          className="widget-large-meaning widget-large-add-meaning"
          onClick={() => setRows((current) => [...current, { id: idRef.current++, text: "", pending: true }])}
        >
          <span className="widget-large-add-icon" aria-hidden="true">
            <Plus size={16} strokeWidth={1.33} absoluteStrokeWidth />
          </span>
          <span>Add meaning</span>
        </button>
      ) : null}
    </div>
  );
}

function SuggestedRow({ meaning, onAdd }) {
  const [added, setAdded] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const onAddRef = useRef(onAdd);
  onAddRef.current = onAdd;

  useEffect(() => {
    if (!added) return undefined;
    let frame = 0;
    const first = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => setRevealed(true));
    });
    const done = window.setTimeout(() => onAddRef.current(meaning), 1000);
    return () => {
      window.cancelAnimationFrame(first);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(done);
    };
  }, [added, meaning]);

  function add() {
    if (!added) setAdded(true);
  }

  return (
    <div
      className={`widget-large-meaning is-suggestion${added ? " is-added" : ""}${revealed ? " is-revealed" : ""}`}
      role="button"
      tabIndex={added ? -1 : 0}
      aria-label={added ? undefined : `Save ${meaning}`}
      onClick={add}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          add();
        }
      }}
    >
      <p>{meaning}</p>
      <span className={`widget-suggested-add${revealed ? " is-revealed" : ""}`}>
        <Plus size={16} strokeWidth={1.33} absoluteStrokeWidth />
        <span className="widget-large-meaning-badge-label">
          <span>{added ? "Added" : ""}</span>
        </span>
      </span>
      <img className="widget-large-locale" src={localeFlag} alt="" width={22} height={16} />
    </div>
  );
}

function SuggestedList({ meanings, saved = [], onAdd, children = null }) {
  const [done, setDone] = useState([]);
  const signature = meanings.join("\u0000");

  useEffect(() => {
    setDone([]);
  }, [signature]);

  const visible = meanings.filter((meaning) => !(done.includes(meaning) && saved.includes(meaning)));

  function finish(meaning) {
    onAdd(meaning);
    setDone((current) => (current.includes(meaning) ? current : [...current, meaning]));
  }

  if (!visible.length && !Children.count(children)) return null;

  return (
    <div className="widget-large-meanings">
      {visible.map((meaning) => (
        <SuggestedRow key={meaning} meaning={meaning} onAdd={finish} />
      ))}
      {children}
    </div>
  );
}

function SentenceCard({ sentence, translation, full = false }) {
  return (
    <div className={`widget-large-sentence${full ? " is-full" : ""}`}>
      <p className="widget-large-sentence-original">{sentence}</p>
      <p className="widget-large-sentence-translation">{translation}</p>
      <div className="widget-large-sentence-actions">
        <button type="button" className="widget-large-plain-button" aria-label="Play sentence">
          <Volume2 size={20} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
        <button type="button" className="widget-large-plain-button" aria-label="Copy sentence">
          <Copy size={20} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
      </div>
    </div>
  );
}

function TermCards({ words }) {
  const scrollRef = useRef(null);

  return (
    <div className="widget-large-terms">
      <div className="widget-large-term-scroll" ref={scrollRef}>
        {words.map((word, index) => (
          <div key={`${word.term}-${index}`} className="widget-large-term-card">
            <StatusButton status={word.status} state="focus" />
            <span className="widget-large-term-card-text">
              <span className="widget-large-term-card-term">{word.term}</span>
              <span className="widget-large-term-card-meaning">{word.meaning}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="widget-large-terms-fade" aria-hidden="true" />
      <button
        type="button"
        className="widget-large-heading-chevron widget-large-terms-next"
        aria-label="More terms"
        onClick={() => scrollRef.current?.scrollBy({ left: 180, behavior: "smooth" })}
      >
        <ChevronRight size={16} strokeWidth={1.33} absoluteStrokeWidth />
      </button>
    </div>
  );
}

export default function WidgetLarge({
  term,
  meanings = [],
  suggestions = [],
  glossary = [],
  isNew = false,
  sentence,
  sentenceTranslation,
  sentenceWords = [],
  pastEncounters = [],
  status,
  selectStatus = true,
  onStatus,
  onChooseMeaning,
  onUpdateMeanings = () => {},
  onClose,
  docked = false,
  compact = false,
  onTogglePanel,
}) {
  const cardRef = useRef(null);
  const [page, setPage] = useState("default");
  const [dictionaryFrom, setDictionaryFrom] = useState("default");
  const [addingMeaning, setAddingMeaning] = useState(false);

  useEffect(() => {
    setPage("default");
    setAddingMeaning(false);
  }, [term]);

  useEffect(() => {
    function onPointerDown(event) {
      if (docked) return;
      if (cardRef.current?.contains(event.target)) return;
      if (event.target.closest?.(".status-snackbar")) return;
      onClose();
    }

    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      if (event.target.closest?.(".widget-large-meaning-field")) return;
      if (page === "dictionaries") {
        setPage(dictionaryFrom);
        return;
      }
      if (page !== "default") {
        setPage("default");
        return;
      }
      onClose();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, docked, page, dictionaryFrom]);

  const savedMeanings = isNew ? [] : meanings;
  const suggestedMeanings = (glossary.length ? glossary : suggestions).slice(0, 5);
  const emptySuggestions = (glossary.length ? glossary : suggestions).slice(0, 2);
  const savedRef = useRef(savedMeanings);
  savedRef.current = savedMeanings;

  function addSuggestion(meaning) {
    const current = savedRef.current;
    if (current.includes(meaning)) return;
    const next = [...current, meaning];
    savedRef.current = next;
    onUpdateMeanings(next);
  }

  function openDictionaries(from) {
    setDictionaryFrom(from);
    setPage("dictionaries");
  }

  return (
    <div
      ref={cardRef}
      className={`widget-large${docked ? " is-docked" : ""}${compact ? " is-compact" : ""}`}
      role="dialog"
      aria-label={term}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {page === "dictionaries" ? (
        <header className="widget-large-header widget-large-dict-header">
          <button type="button" className="widget-large-heading-chevron" aria-label="Back" onClick={() => setPage(dictionaryFrom)}>
            <ChevronLeft size={16} strokeWidth={1.33} absoluteStrokeWidth />
          </button>
          <p className="widget-large-dict-title">Dictionaries</p>
          {docked ? (
            <button type="button" className="widget-large-icon-button" aria-label="Close side panel" onClick={onTogglePanel}>
              <PanelRight size={16} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
          ) : null}
        </header>
      ) : (
        <header className="widget-large-header">
          <div className="widget-large-term-row">
            <p className="widget-large-term">{term}</p>
            <div className="widget-large-term-actions">
              <button type="button" className="widget-large-icon-button" aria-label="Play audio">
                <Volume2 size={16} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
              {docked ? (
                <button type="button" className="widget-large-icon-button" aria-label="Close side panel" onClick={onTogglePanel}>
                  <PanelRight size={16} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
              ) : null}
            </div>
          </div>
        </header>
      )}

      <div className="widget-large-scroll">
        <div className="widget-large-body">
          {page === "meanings" ? (
            <>
              <section className="widget-large-section">
                <SectionHeading
                  icon={<TextSearch size={16} strokeWidth={1.33} absoluteStrokeWidth />}
                  label="Meanings"
                  onBack={() => setPage("default")}
                />
                <MeaningList meanings={savedMeanings} onChange={onUpdateMeanings} allowAdd />
                <TagRow />
                <DictionaryRow onOpen={() => openDictionaries("meanings")} />
              </section>
              <section className="widget-large-section">
                <div className="widget-large-heading">
                  <div className="widget-large-heading-label">
                    <span>Suggested Meanings</span>
                  </div>
                  <div className="widget-large-suggest-tools">
                    <img className="widget-large-locale" src={localeFlag} alt="" width={22} height={16} />
                    <button type="button" className="widget-large-plain-button" aria-label="Report">
                      <Flag size={20} strokeWidth={1.5} absoluteStrokeWidth />
                    </button>
                  </div>
                </div>
                <SuggestedList meanings={suggestedMeanings} saved={savedMeanings} onAdd={addSuggestion} />
              </section>
            </>
          ) : null}

          {page === "sentence" ? (
            <>
              <section className="widget-large-section">
                <SectionHeading
                  icon={<img src={sentenceIcon} alt="" width={16} height={16} />}
                  label="Sentence"
                  onBack={() => setPage("default")}
                />
                <SentenceCard sentence={sentence} translation={sentenceTranslation} full />
                {sentenceWords.length ? <TermCards words={sentenceWords} /> : null}
              </section>
              <section className="widget-large-section">
                <div className="widget-large-heading">
                  <div className="widget-large-heading-label">
                    <History size={16} strokeWidth={1.33} absoluteStrokeWidth />
                    <span>Past Encounters</span>
                  </div>
                </div>
                {isNew || pastEncounters.length === 0 ? (
                  <div className="widget-large-first">
                    <Info size={18} strokeWidth={1.5} absoluteStrokeWidth />
                    <div>
                      <p>This is your first time seeing this term!</p>
                      <p>Nice find. This current sentence will appear saved in this section the next time you encounter this term.</p>
                    </div>
                  </div>
                ) : pastEncounters.map((item) => (
                  <SentenceCard key={item.text} sentence={item.text} translation={item.translation} full />
                ))}
              </section>
            </>
          ) : null}

          {page === "dictionaries" ? (
            <>
              <section className="widget-large-section">
                <div className="widget-large-heading">
                  <div className="widget-large-heading-label">
                    <span>Preferred</span>
                  </div>
                </div>
                <DictionaryList names={DICTIONARIES} />
              </section>
              <section className="widget-large-section">
                <div className="widget-large-heading">
                  <div className="widget-large-heading-label">
                    <span>All Resources</span>
                  </div>
                  <img className="widget-large-locale" src={localeFlag} alt="" width={22} height={16} />
                </div>
                <DictionaryList names={MORE_DICTIONARIES} addable />
              </section>
            </>
          ) : null}

          {page === "default" ? (
            <>
              <section className="widget-large-section">
                <SectionHeading
                  icon={<TextSearch size={16} strokeWidth={1.33} absoluteStrokeWidth />}
                  label="Meanings"
                  onOpen={() => setPage("meanings")}
                />
                {!isNew && meanings.length > 0 ? (
                  <MeaningList meanings={meanings} onChange={onUpdateMeanings} />
                ) : (
                  <SuggestedList meanings={isNew ? suggestions.slice(0, 3) : emptySuggestions} saved={savedMeanings} onAdd={addSuggestion}>
                    {!isNew && addingMeaning ? (
                      <MeaningRow
                        meaning=""
                        autoFocus
                        onSave={(text) => {
                          onUpdateMeanings([text]);
                          onClose();
                        }}
                        onRemove={() => setAddingMeaning(false)}
                      />
                    ) : null}
                    {!isNew && !addingMeaning ? (
                      <button type="button" className="widget-large-meaning widget-large-add-meaning" onClick={() => setAddingMeaning(true)}>
                        <span className="widget-large-add-icon" aria-hidden="true">
                          <Plus size={16} strokeWidth={1.33} absoluteStrokeWidth />
                        </span>
                        <span>Add meaning</span>
                      </button>
                    ) : null}
                  </SuggestedList>
                )}
                <TagRow />
                {isNew ? <DictionaryRow onOpen={() => openDictionaries("default")} /> : null}
              </section>

              <section className="widget-large-section">
                <SectionHeading
                  icon={<img src={sentenceIcon} alt="" width={16} height={16} />}
                  label="Sentence"
                  onOpen={() => setPage("sentence")}
                />
                <SentenceCard sentence={sentence} translation={sentenceTranslation} />
              </section>

              <section className="widget-large-section">
                <div className="widget-large-heading">
                  <div className="widget-large-heading-label">
                    <NotebookPen size={16} strokeWidth={1.33} absoluteStrokeWidth />
                    <span>Notes</span>
                  </div>
                  <button type="button" className="widget-large-generate">
                    <img src={lynxIcon} alt="" width={16} height={16} />
                    <span>Generate</span>
                  </button>
                </div>
                <textarea className="widget-large-note" placeholder="Add your note here ..." aria-label="Notes" />
              </section>
            </>
          ) : null}
        </div>
        <div className="widget-large-fade" aria-hidden="true" />
      </div>

      {page === "dictionaries" ? null : (
        <footer className="widget-large-footer">
          <div className="widget-large-status-bar">
            {WORD_BAR_STATUSES.map((item) => (
              <StatusButton
                key={item}
                status={item}
                state={selectStatus && item === status ? "focus" : "default"}
                onClick={() => onStatus(item)}
              />
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
