import { useEffect, useRef } from "react";
import {
  BookA,
  ChevronRight,
  Copy,
  NotebookPen,
  PanelRight,
  Plus,
  Tags,
  TextSearch,
  Volume2,
} from "lucide-react";
import flagIcon from "../assets/language_flag_icon.png";
import lynxIcon from "../assets/lynx_icon_light.png";
import sentenceIcon from "../assets/sentencemode_icon_light.png";
import StatusButton, { WORD_BAR_STATUSES } from "./StatusButton.jsx";

const TAGS = ["Noun", "Proper Noun"];
const DICTIONARIES = ["Google Translate", "Linguee", "DeepL", "WörterBuch"];

function SectionHeading({ icon, label }) {
  return (
    <div className="widget-large-heading">
      <div className="widget-large-heading-label">
        {icon}
        <span>{label}</span>
      </div>
      <button type="button" className="widget-large-heading-chevron" aria-label={`More ${label.toLowerCase()}`}>
        <ChevronRight size={18} strokeWidth={1.5} absoluteStrokeWidth />
      </button>
    </div>
  );
}

export default function WidgetLarge({
  term,
  meanings = [],
  suggestions = [],
  isNew = false,
  sentence,
  sentenceTranslation,
  status,
  onStatus,
  onChooseMeaning,
  onClose,
  docked = false,
  compact = false,
  onTogglePanel,
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    function onPointerDown(event) {
      if (docked) return;
      if (cardRef.current?.contains(event.target)) return;
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
  }, [onClose, docked]);

  const shownMeanings = isNew ? suggestions.slice(0, 3) : meanings;

  return (
    <div
      ref={cardRef}
      className={`widget-large${docked ? " is-docked" : ""}${compact ? " is-compact" : ""}`}
      role="dialog"
      aria-label={term}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <header className="widget-large-header">
        <div className="widget-large-term-row">
          <p className="widget-large-term">{term}</p>
          <div className="widget-large-term-actions">
            <button type="button" className="widget-large-icon-button" aria-label="Play audio">
              <Volume2 size={18} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            {docked ? (
              <button type="button" className="widget-large-icon-button" aria-label="Close side panel" aria-pressed="true" onClick={onTogglePanel}>
                <PanelRight size={18} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
            ) : null}
          </div>
        </div>
        <div className="widget-large-tags">
          <button type="button" className="widget-large-add-tag" aria-label="Add tag">
            <Tags size={18} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
          <div className="widget-large-tag-scroll">
            {TAGS.map((tag) => (
              <span key={tag} className="widget-tag">{tag}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="widget-large-scroll">
        <div className="widget-large-body">
          <section className="widget-large-section">
            <SectionHeading
              icon={<TextSearch size={18} strokeWidth={1.5} absoluteStrokeWidth />}
              label="Meanings"
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
            {isNew ? (
              <div className="widget-dictionaries widget-large-dictionaries">
                <button type="button" className="widget-dictionary-open" aria-label="Dictionaries">
                  <BookA size={18} strokeWidth={1.5} absoluteStrokeWidth />
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
            ) : null}
          </section>

          <section className="widget-large-section">
            <SectionHeading
              icon={<img src={sentenceIcon} alt="" width={18} height={18} />}
              label="Sentence"
            />
            <div className="widget-large-sentence">
              <p className="widget-large-sentence-original">{sentence}</p>
              <p className="widget-large-sentence-translation">{sentenceTranslation}</p>
              <div className="widget-large-sentence-actions">
                <button type="button" className="widget-large-plain-button" aria-label="Play sentence">
                  <Volume2 size={18} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
                <button type="button" className="widget-large-plain-button" aria-label="Copy sentence">
                  <Copy size={18} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
              </div>
            </div>
          </section>

          <section className="widget-large-section">
            <div className="widget-large-heading">
              <div className="widget-large-heading-label">
                <NotebookPen size={18} strokeWidth={1.5} absoluteStrokeWidth />
                <span>Notes</span>
              </div>
              <button type="button" className="widget-large-generate">
                <img src={lynxIcon} alt="" width={16} height={16} />
                <span>Generate</span>
              </button>
            </div>
            <textarea className="widget-large-note" placeholder="Add your note here ..." aria-label="Notes" />
          </section>
        </div>
        <div className="widget-large-fade" aria-hidden="true" />
      </div>

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
    </div>
  );
}
