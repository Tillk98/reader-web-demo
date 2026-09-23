import { useEffect, useRef, useState } from "react";
import {
  CaseSensitive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Ellipsis,
  MousePointerClick,
  PanelRight,
  Play,
  Undo2,
} from "lucide-react";
import WidgetSmall from "./WidgetSmall.jsx";
import WidgetMedium from "./WidgetMedium.jsx";
import WidgetLarge from "./WidgetLarge.jsx";
import { formatMeanings, meaningsFor } from "./meanings.js";
import { describePhrase, phraseCovers } from "./phrases.js";
import { sentenceFor } from "./sentences.js";
import StatusButton from "./StatusButton.jsx";
import logo from "../assets/LingQLogo_Light.png";
import streakIcon from "../assets/streak_icon.png";
import coinIcon from "../assets/coin_icon.png";
import flagIcon from "../assets/language_flag_icon.png";
import pageModeIcon from "../assets/pagemode_icon_light.png";
import lynxIcon from "../assets/lynx_icon_light.png";
import reviewIcon from "../assets/review_icon_light.png";
import thumbnail from "../assets/lesson-thumbnail.jpg";

const PARAGRAPHS = [
  "Also der erste, würde ich sagen, ist erst mal die Zeit.",
  "Ja, natürlich, wenn du vorhast, wirklich eine Sprache gut zu lernen, musst du natürlich eine ganze Menge Zeit aufwenden, und je nachdem, wie voll dein Wochenplan ist, ist vielleicht gar nicht die Zeit da, um jetzt mehrere Sprachen gleichzeitig zu lernen.",
  "Also das muss man natürlich beachten.",
  "Wenn du jetzt sowieso maximal jeden Tag 15 Minuten zur Verfügung hast, dann wirst du wahrscheinlich nicht weit kommen mit mehreren Sprachen, ja.",
  "Also, und wir gehen davon aus, für den Fall, dass du gute Levels erreichen möchtest, ja.",
  "Es ist auch möglich, dass du zehn Sprachen gleichzeitig lernst und dann in keiner Sprache wirklich gute Fortschritte machst.",
  "Aber wenn es dir irgendwie Spaß macht und du willst in allen Sprachen nur ein paar Sätze lernen, dann kannst du das natürlich machen, aber meine Tipps sind jetzt dahingehend, dass du auch",
];

const WORD = /[\p{L}\p{N}]+/gu;

function tokenize(paragraph) {
  const tokens = [];
  let lastIndex = 0;

  for (const match of paragraph.matchAll(WORD)) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: paragraph.slice(lastIndex, match.index) });
    }
    tokens.push({ type: "word", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < paragraph.length) {
    tokens.push({ type: "text", value: paragraph.slice(lastIndex) });
  }

  return tokens;
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildLesson(paragraphs) {
  const tokenized = paragraphs.map(tokenize);
  const words = tokenized.flatMap((tokens) => tokens.filter((token) => token.type === "word"));
  const knownCount = Math.round(words.length * 0.75);
  const remaining = words.length - knownCount;
  const lingqCount = Math.floor(remaining / 2);
  const order = shuffle(words);

  order.forEach((token, index) => {
    if (index < knownCount) {
      token.kind = "known";
      return;
    }
    if (index < knownCount + lingqCount) {
      token.kind = "lingq";
      return;
    }
    token.kind = "new";
  });

  shuffle(order.filter((token) => token.kind === "lingq")).forEach((token, index) => {
    token.level = (index % 4) + 1;
  });

  const levelStatus = [null, "New", "Recognized", "Familiar", "Learned"];
  words.forEach((token) => {
    if (token.kind === "known") token.status = "Known";
    else if (token.kind === "lingq") token.status = levelStatus[token.level];
    else token.status = "New";
  });

  return tokenized;
}

const STATUS_APPEARANCE = {
  Ignored: { kind: "ignored", level: null },
  New: { kind: "lingq", level: 1 },
  Recognized: { kind: "lingq", level: 2 },
  Familiar: { kind: "lingq", level: 3 },
  Learned: { kind: "lingq", level: 4 },
  Known: { kind: "known", level: null },
};

const LESSON = buildLesson(PARAGRAPHS);

function wordClassName(token) {
  if (token.kind === "lingq") return `word word-lingq word-lingq-${token.level}`;
  return `word word-${token.kind}`;
}

export default function Reader() {
  const textRef = useRef(null);
  const pressRef = useRef({ suppressClick: false });
  const phraseIdRef = useRef(1);
  const [lesson, setLesson] = useState(LESSON);
  const [active, setActive] = useState(null);
  const [phrasePick, setPhrasePick] = useState(null);
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [snackbar, setSnackbar] = useState(null);

  function showSnackbar(status, undo) {
    setSnackbar({ id: Date.now(), status, undo });
  }

  function undoSnackbar() {
    if (!snackbar) return;
    snackbar.undo();
    setSnackbar(null);
  }

  function restoreToken(paragraphIndex, tokenIndex, previous) {
    setLesson((current) => current.map((paragraph, pIndex) => {
      if (pIndex !== paragraphIndex) return paragraph;
      return paragraph.map((token, tIndex) => (
        tIndex === tokenIndex ? { ...token, ...previous } : token
      ));
    }));
  }

  useEffect(() => {
    if (!snackbar) return undefined;
    const id = snackbar.id;
    const fadeTimer = window.setTimeout(() => {
      setSnackbar((current) => (current?.id === id ? { ...current, leaving: true } : current));
    }, 2100);
    const hideTimer = window.setTimeout(() => {
      setSnackbar((current) => (current?.id === id ? null : current));
    }, 2500);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [snackbar?.id]);

  function savedAt(paragraphIndex, tokenIndex) {
    return savedPhrases.find((phrase) => phraseCovers(phrase, paragraphIndex, tokenIndex)) || null;
  }

  function openSaved(saved, paragraphIndex, tokenIndex, size) {
    setActive({
      paragraphIndex,
      tokenIndex,
      size,
      mode: "meaning",
      statusMenu: false,
      phrase: { ...saved, savedId: saved.id, invalid: false, suggestions: [] },
    });
  }

  function createLingQ(paragraphIndex, tokenIndex) {
    const token = lesson[paragraphIndex]?.[tokenIndex];
    if (!token || token.kind !== "new") return;
    const previous = {
      kind: token.kind,
      level: token.level ?? null,
      status: token.status,
      meaning: token.meaning,
    };
    setLesson((current) => current.map((paragraph, pIndex) => {
      if (pIndex !== paragraphIndex) return paragraph;
      return paragraph.map((item, tIndex) => {
        if (tIndex !== tokenIndex || item.kind !== "new") return item;
        return { ...item, kind: "lingq", level: 1, status: "New" };
      });
    }));
    showSnackbar("New", () => restoreToken(paragraphIndex, tokenIndex, previous));
  }

  function handleWordClick(event, paragraphIndex, tokenIndex) {
    event.stopPropagation();
    if (pressRef.current.suppressClick) {
      pressRef.current.suppressClick = false;
      return;
    }
    if (phrasePick) {
      if (phrasePick.paragraphIndex === paragraphIndex && phrasePick.tokenIndex === tokenIndex) return;
      const phrase = describePhrase(lesson, phrasePick, { paragraphIndex, tokenIndex });
      setPhrasePick(null);
      setActive({
        paragraphIndex,
        tokenIndex,
        size: "medium",
        mode: "meaning",
        statusMenu: false,
        phrase: { ...phrase, savedId: null },
      });
      return;
    }
    const saved = savedAt(paragraphIndex, tokenIndex);
    if (saved) {
      if (active?.phrase?.savedId === saved.id) {
        setActive(null);
        return;
      }
      openSaved(saved, paragraphIndex, tokenIndex, "small");
      return;
    }
    const closing = active
      && !active.phrase
      && active.paragraphIndex === paragraphIndex
      && active.tokenIndex === tokenIndex;
    if (!closing) createLingQ(paragraphIndex, tokenIndex);
    setActive(closing
      ? null
      : { paragraphIndex, tokenIndex, size: "small", mode: "meaning", statusMenu: false });
  }

  function handlePointerDown(event, paragraphIndex, tokenIndex) {
    if (phrasePick) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const saved = savedAt(paragraphIndex, tokenIndex);
    const timer = window.setTimeout(() => {
      pressRef.current.suppressClick = true;
      if (saved) {
        openSaved(saved, paragraphIndex, tokenIndex, "medium");
        return;
      }
      setActive({
        paragraphIndex,
        tokenIndex,
        size: "medium",
        mode: "meaning",
        statusMenu: false,
      });
    }, 480);

    function endPress(event) {
      if (event.type === "pointermove") {
        const moved = Math.hypot(event.clientX - startX, event.clientY - startY);
        if (moved <= 8) return;
      }
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", endPress);
      window.removeEventListener("pointerup", endPress);
      window.removeEventListener("pointercancel", endPress);
      if (event.type === "pointerup" && pressRef.current.suppressClick) {
        window.setTimeout(() => {
          pressRef.current.suppressClick = false;
        }, 0);
      }
    }

    window.addEventListener("pointermove", endPress);
    window.addEventListener("pointerup", endPress);
    window.addEventListener("pointercancel", endPress);
  }

  function chooseMeaning(meaning) {
    if (!active) return;
    const keepOpen = active.size === "large";
    if (active.phrase && !active.phrase.savedId && !active.phrase.invalid) {
      const id = phraseIdRef.current;
      phraseIdRef.current += 1;
      const saved = {
        id,
        start: active.phrase.start,
        end: active.phrase.end,
        text: active.phrase.text,
        meaning,
        status: "New",
        kind: "lingq",
        level: 1,
      };
      setSavedPhrases((current) => [...current, saved]);
      setActive(keepOpen ? {
        ...active,
        phrase: { ...saved, savedId: id, invalid: false, suggestions: [] },
      } : null);
      showSnackbar("New", () => {
        setSavedPhrases((current) => current.filter((phrase) => phrase.id !== id));
        setActive((current) => (current?.phrase?.savedId === id ? null : current));
      });
      return;
    }
    const token = lesson[active.paragraphIndex][active.tokenIndex];
    const previous = {
      kind: token.kind,
      level: token.level ?? null,
      status: token.status,
      meaning: token.meaning,
    };
    const { paragraphIndex, tokenIndex } = active;
    setLesson((current) => current.map((paragraph, pIndex) => {
      if (pIndex !== paragraphIndex) return paragraph;
      return paragraph.map((item, tIndex) => {
        if (tIndex !== tokenIndex || item.type !== "word") return item;
        return { ...item, kind: "lingq", level: 1, status: "New", meaning };
      });
    }));
    showSnackbar("New", () => restoreToken(paragraphIndex, tokenIndex, previous));
    if (!keepOpen) setActive(null);
  }

  function handleStatusChange(status) {
    if (!active) return;
    if (active.phrase && !active.phrase.savedId) {
      setActive(null);
      return;
    }
    const appearance = STATUS_APPEARANCE[status];
    if (active.phrase?.savedId) {
      const phraseId = active.phrase.savedId;
      const phrase = savedPhrases.find((item) => item.id === phraseId);
      if (!phrase) return;
      if (phrase.status === status && phrase.kind === appearance.kind && (phrase.level ?? null) === (appearance.level ?? null)) {
        return;
      }
      const previous = { status: phrase.status, kind: phrase.kind, level: phrase.level ?? null };
      setSavedPhrases((current) => current.map((item) => (
        item.id === phraseId ? { ...item, status, ...appearance } : item
      )));
      setActive((current) => (current ? {
        ...current,
        phrase: { ...current.phrase, status, ...appearance },
      } : current));
      showSnackbar(status, () => {
        setSavedPhrases((current) => current.map((item) => (
          item.id === phraseId ? { ...item, ...previous } : item
        )));
        setActive((current) => (
          current?.phrase?.savedId === phraseId
            ? { ...current, phrase: { ...current.phrase, ...previous } }
            : current
        ));
      });
      return;
    }
    const token = lesson[active.paragraphIndex][active.tokenIndex];
    if (
      token.status === status
      && token.kind === appearance.kind
      && (token.level ?? null) === (appearance.level ?? null)
    ) {
      return;
    }
    const previous = {
      status: token.status,
      kind: token.kind,
      level: token.level ?? null,
      meaning: token.meaning,
    };
    const { paragraphIndex, tokenIndex } = active;
    setLesson((current) => current.map((paragraph, pIndex) => {
      if (pIndex !== paragraphIndex) return paragraph;
      return paragraph.map((item, tIndex) => {
        if (tIndex !== tokenIndex || item.type !== "word") return item;
        return { ...item, status, ...appearance };
      });
    }));
    showSnackbar(status, () => restoreToken(paragraphIndex, tokenIndex, previous));
  }

  function openLarge() {
    setActive((current) => (current ? { ...current, size: "large", statusMenu: false } : current));
  }

  function startPhraseSelect() {
    if (!active) return;
    setPhrasePick({ paragraphIndex: active.paragraphIndex, tokenIndex: active.tokenIndex });
    setActive(null);
  }

  function openTranslate(text) {
    const url = `https://translate.google.com/?sl=de&tl=en&text=${encodeURIComponent(text)}&op=translate`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    if (!phrasePick) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".word")) return;
      if (event.target.closest?.(".phrase-tooltip")) return;
      if (event.target.closest?.(".status-snackbar")) return;
      setPhrasePick(null);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setPhrasePick(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [phrasePick]);

  const activeToken = active ? lesson[active.paragraphIndex][active.tokenIndex] : null;
  const savedOpen = active?.phrase?.savedId
    ? savedPhrases.find((phrase) => phrase.id === active.phrase.savedId)
    : null;
  const activeMeaning = savedOpen?.meaning
    || activeToken?.meaning
    || (activeToken ? formatMeanings(activeToken.value) : "");
  const activeStatus = savedOpen?.status || activeToken?.status || "New";
  const pendingPhrase = active?.phrase && !active.phrase.savedId ? active.phrase : null;
  const activeIsNew = pendingPhrase ? !pendingPhrase.invalid : activeToken?.kind === "new";
  const activeSuggestions = pendingPhrase
    ? pendingPhrase.suggestions
    : (activeToken ? meaningsFor(activeToken.value).slice(0, 2) : []);
  const largeTerm = (savedOpen || pendingPhrase)?.text || activeToken?.value || "";
  const largeMeanings = savedOpen?.meaning
    ? [savedOpen.meaning]
    : activeToken?.meaning
      ? [activeToken.meaning]
      : (activeToken ? meaningsFor(activeToken.value) : []);
  const largeSuggestions = pendingPhrase
    ? pendingPhrase.suggestions
    : (activeToken ? meaningsFor(activeToken.value).slice(0, 3) : []);
  const sentencePoint = active?.phrase?.start || (
    active ? { paragraphIndex: active.paragraphIndex, tokenIndex: active.tokenIndex } : null
  );
  const sentence = sentencePoint
    ? sentenceFor(lesson, sentencePoint.paragraphIndex, sentencePoint.tokenIndex)
    : { text: "", translation: "" };

  function markAt(paragraphIndex, tokenIndex) {
    const saved = savedPhrases.find((phrase) => phraseCovers(phrase, paragraphIndex, tokenIndex));
    const pending = active?.phrase && phraseCovers(active.phrase, paragraphIndex, tokenIndex)
      ? active.phrase
      : null;
    if (pending && !pending.savedId) {
      return { key: "pending", kind: pending.invalid ? "invalid" : "new", level: null };
    }
    const source = pending?.savedId
      ? savedPhrases.find((phrase) => phrase.id === pending.savedId) || saved
      : saved;
    if (!source) return null;
    return { key: `saved-${source.id}`, kind: source.kind, level: source.level };
  }

  function renderToken(token, paragraphIndex, tokenIndex) {
    if (token.type !== "word") return <span key={tokenIndex}>{token.value}</span>;
    const picking = phrasePick?.paragraphIndex === paragraphIndex && phrasePick?.tokenIndex === tokenIndex;
    const open = active?.paragraphIndex === paragraphIndex && active?.tokenIndex === tokenIndex;
    return (
      <span
        key={tokenIndex}
        className={`${wordClassName(token)}${open ? " is-open" : ""}${picking ? " is-phrase-anchor" : ""}`}
        data-word-id={`${paragraphIndex}-${tokenIndex}`}
        role="button"
        tabIndex={0}
        onPointerDown={(event) => handlePointerDown(event, paragraphIndex, tokenIndex)}
        onContextMenu={(event) => event.preventDefault()}
        onClick={(event) => handleWordClick(event, paragraphIndex, tokenIndex)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleWordClick(event, paragraphIndex, tokenIndex);
          }
        }}
      >
        {token.value}
      </span>
    );
  }

  return (
    <div className="reader">
      <header className="reader-header">
        <div className="logo-slot">
          <button type="button" className="logo-button" aria-label="LingQ">
            <img src={logo} alt="" width={27} height={27} />
          </button>
        </div>

        <div className="header-main">
          <div className="lesson-heading">
            <img
              className="lesson-thumb"
              src={thumbnail}
              alt=""
              width={40}
              height={40}
            />
            <div className="lesson-titles">
              <h1>Mehrere Sprachen auf einmal lernen?! Wie lange jeden Tag lernen?</h1>
              <p>YouTube auf Deutsch</p>
            </div>
          </div>

          <div className="status-pills">
            <button type="button" className="status-pill">
              <span className="pill-stat">
                <img src={streakIcon} alt="" width={13} height={18} />
                <span>3 Day</span>
              </span>
              <span className="pill-stat">
                <img src={coinIcon} alt="" width={16} height={16} />
                <span>10/50</span>
              </span>
              <ChevronDown size={14} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
            </button>

            <button type="button" className="status-pill">
              <span className="pill-stat">
                <img className="language-flag" src={flagIcon} alt="" width={21} height={16} />
                <span>3050</span>
              </span>
              <ChevronDown size={14} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="reader-content">
        <div className="reader-chrome">
          <div className="progress" aria-hidden="true">
            <div className="progress-track" />
            <div className="progress-fill" />
          </div>
          <div className="chrome-actions">
            <button type="button" className="icon-button" aria-label="Text settings">
              <CaseSensitive size={24} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            <button type="button" className="icon-button" aria-label="More options">
              <Ellipsis size={24} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            <button type="button" className="icon-button" aria-label="Open side panel">
              <PanelRight size={24} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
          </div>
        </div>

        <div className="lesson-area">
          <div className="page-control">
            <button type="button" className="page-button" aria-label="Previous page">
              <ChevronLeft size={16} strokeWidth={1.36} absoluteStrokeWidth />
            </button>
          </div>

          <div className="page-column">
          <article className="page-text" lang="de" ref={textRef}>
            {lesson.map((tokens, paragraphIndex) => {
              const nodes = [];
              let tokenIndex = 0;
              while (tokenIndex < tokens.length) {
                const mark = markAt(paragraphIndex, tokenIndex);
                if (!mark) {
                  nodes.push(renderToken(tokens[tokenIndex], paragraphIndex, tokenIndex));
                  tokenIndex += 1;
                  continue;
                }
                const chunk = [];
                const { key, kind, level } = mark;
                const start = tokenIndex;
                while (tokenIndex < tokens.length) {
                  const next = markAt(paragraphIndex, tokenIndex);
                  if (!next || next.key !== key) break;
                  chunk.push(renderToken(tokens[tokenIndex], paragraphIndex, tokenIndex));
                  tokenIndex += 1;
                }
                nodes.push(
                  <span
                    key={`${key}-${start}`}
                    className="phrase-range"
                    data-kind={kind}
                    data-level={level || undefined}
                  >
                    {chunk}
                  </span>,
                );
              }
              return <p key={paragraphIndex}>{nodes}</p>;
            })}
            {activeToken && active.size !== "medium" && active.size !== "large" ? (
              <WidgetSmall
                anchorId={`${active.paragraphIndex}-${active.tokenIndex}`}
                boundaryRef={textRef}
                status={activeStatus}
                meaning={activeMeaning}
                mode={active.mode}
                onMode={(mode) => setActive((current) => (current ? { ...current, mode } : current))}
                onStatus={handleStatusChange}
                onClose={() => setActive(null)}
                onOpenLarge={openLarge}
              />
            ) : null}
            {activeToken && active.size === "medium" ? (
              <WidgetMedium
                anchorId={`${active.paragraphIndex}-${active.tokenIndex}`}
                boundaryRef={textRef}
                status={activeStatus}
                meaning={activeMeaning}
                suggestions={activeSuggestions}
                isNew={activeIsNew}
                phraseError={pendingPhrase?.invalid ? pendingPhrase.text : null}
                statusMenu={active.statusMenu}
                onToggleStatusMenu={() => setActive((current) => (
                  current ? { ...current, statusMenu: !current.statusMenu } : current
                ))}
                onStatus={handleStatusChange}
                onChooseMeaning={chooseMeaning}
                onSelectPhrase={startPhraseSelect}
                onTranslate={openTranslate}
                onClose={() => setActive(null)}
                onOpenLarge={openLarge}
              />
            ) : null}
          </article>
          {phrasePick ? (
            <div className="phrase-tooltip" role="status">
              <MousePointerClick size={18} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
              <p>Select another word to create a phrase.</p>
            </div>
          ) : null}
          {activeToken && active.size === "large" ? (
            <WidgetLarge
              term={largeTerm}
              meanings={largeMeanings}
              suggestions={largeSuggestions}
              isNew={activeIsNew}
              sentence={sentence.text}
              sentenceTranslation={sentence.translation}
              status={activeStatus}
              onStatus={handleStatusChange}
              onChooseMeaning={chooseMeaning}
              onClose={() => setActive(null)}
            />
          ) : null}
          {snackbar ? (
            <button type="button" className={`status-snackbar${snackbar.leaving ? " is-leaving" : ""}`} onClick={undoSnackbar}>
              <StatusButton status={snackbar.status} state="focus" />
              <span className="status-snackbar-label">{snackbar.status}</span>
              <span className="status-snackbar-undo">
                <Undo2 size={16} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
              </span>
            </button>
          ) : null}
          </div>

          <div className="page-control">
            <button type="button" className="page-button" aria-label="Next page">
              <ChevronRight size={16} strokeWidth={1.36} absoluteStrokeWidth />
            </button>
          </div>
        </div>
      </main>

      <footer className="reader-footer">
        <button type="button" className="play-button" aria-label="Play">
          <Play size={24} strokeWidth={1.5} absoluteStrokeWidth />
        </button>

        <div className="floating-nav">
          <button type="button" className="mode-selector">
            <img src={pageModeIcon} alt="" width={22} height={22} />
            <span>Page Mode</span>
            <ChevronsUpDown size={18} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
          </button>
          <span className="nav-divider" aria-hidden="true" />
          <button type="button" className="vocab-button" aria-label="Vocabulary">
            <img src={reviewIcon} alt="" width={20} height={20} />
          </button>
        </div>

        <form className="lynx-control" onSubmit={(event) => event.preventDefault()}>
          <input type="text" placeholder="Ask Lynx AI ..." aria-label="Ask Lynx AI" />
          <button type="submit" className="lynx-button" aria-label="Ask Lynx AI">
            <img src={lynxIcon} alt="" width={22} height={22} />
          </button>
        </form>
      </footer>
    </div>
  );
}
