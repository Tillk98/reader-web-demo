import { useEffect, useRef, useState } from "react";
import {
  BookA,
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
  onStatus,
  onChooseMeaning,
  onClose,
  docked = false,
  compact = false,
  onTogglePanel,
}) {
  const cardRef = useRef(null);
  const [page, setPage] = useState("default");
  const [dictionaryFrom, setDictionaryFrom] = useState("default");

  useEffect(() => {
    setPage("default");
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
  const shownMeanings = isNew ? suggestions.slice(0, 3) : meanings;

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
                <div className={`widget-large-meanings${savedMeanings.length ? "" : " is-plain"}`}>
                  {savedMeanings.map((meaning, index) => (
                    <div key={`${meaning}-${index}`} className="widget-large-meaning">
                      <p>{meaning}</p>
                    </div>
                  ))}
                  <button type="button" className="widget-large-meaning widget-large-add-meaning">
                    <span className="widget-suggested-add" aria-hidden="true">
                      <Plus size={16} strokeWidth={1.33} absoluteStrokeWidth />
                    </span>
                    <span>Add Meaning</span>
                  </button>
                </div>
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
                <div className="widget-large-meanings">
                  {suggestedMeanings.map((meaning, index) => (
                    <div key={`${meaning}-${index}`} className="widget-large-meaning">
                      <p>{meaning}</p>
                      <button
                        type="button"
                        className="widget-suggested-add"
                        aria-label={`Save ${meaning}`}
                        onClick={() => onChooseMeaning(meaning)}
                      >
                        <Plus size={16} strokeWidth={1.33} absoluteStrokeWidth />
                      </button>
                    </div>
                  ))}
                </div>
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
                <div className="widget-large-meanings">
                  {shownMeanings.map((meaning, index) => (
                    <div key={`${meaning}-${index}`} className="widget-large-meaning">
                      <p>{meaning}</p>
                      {isNew ? (
                        <button
                          type="button"
                          className="widget-suggested-add"
                          aria-label={`Save ${meaning}`}
                          onClick={() => onChooseMeaning(meaning)}
                        >
                          <Plus size={16} strokeWidth={1.33} absoluteStrokeWidth />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
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
                state={item === status ? "focus" : "default"}
                onClick={() => onStatus(item)}
              />
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
