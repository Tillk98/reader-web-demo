import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  ArrowDownNarrowWide,
  CaseSensitive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Contrast,
  Ellipsis,
  Gauge,
  Languages,
  ListPlus,
  MousePointerClick,
  PanelRight,
  Pause,
  Play,
  Printer,
  Repeat2,
  RefreshCw,
  RotateCw,
  Settings,
  SquarePen,
  StepForward,
  Timer,
  Undo2,
  WrapText,
} from "lucide-react";
import WidgetSmall from "./WidgetSmall.jsx";
import WidgetMedium from "./WidgetMedium.jsx";
import WidgetLarge from "./WidgetLarge.jsx";
import LynxChat from "./LynxChat.jsx";
import { formatMeanings, meaningsFor } from "./meanings.js";
import { describePhrase, phraseCovers } from "./phrases.js";
import { sentenceFor } from "./sentences.js";
import StatusButton, { WORD_BAR_STATUSES } from "./StatusButton.jsx";
import logo from "../assets/LingQLogo_Light.png";
import streakIcon from "../assets/streak_icon.png";
import coinIcon from "../assets/coin_icon.png";
import flagIcon from "../assets/language_flag_icon.png";
import pageModeIcon from "../assets/pagemode_icon_light.png";
import sentenceModeIcon from "../assets/sentencemode_icon_light.png";
import videoDefault from "../assets/YouTube_VideoPlayer_Default.png";
import videoActive from "../assets/YouTube_VideoPlayer_UIActive.png";
import lynxIcon from "../assets/lynx_icon_light.png";
import replayIcon from "../assets/replay_10.svg";
import skipBackIcon from "../assets/skip_back_5.svg";
import skipForwardIcon from "../assets/skip_forward_5.svg";
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

const SCROLL_PARAGRAPHS = [
  "Und der zweite große Faktor in diesem, dieser Frage ist: Welche Sprachen hast du denn vor zu lernen?",
  "Ja, weil ich würde nicht unbedingt empfehlen, vor allem wenn du nicht viel Erfahrung hast mit dem Sprachenlernen, würde ich nicht empfehlen, jetzt von null anzufangen, zwei sehr schwere Sprachen zu lernen, ja, zum Beispiel Arabisch und Japanisch.",
  "Ja, also wenn da, das ist in meinen Augen quasi zum Scheitern verurteilt, weil eine dieser Sprachen schon mehr als genug ist und da kannst du schon und musst du schon mehr als genug Zeit aufwenden, um da wirklich ein gutes Level zu erreichen.",
  "Das heißt in so einem Fall würde ich mich lieber erstmal auf eine dieser Sprachen beschränken, und wenn du dann irgendwann ein gutes Level erreicht hast oder keine Lust mehr hast, sag ich mal, dann kannst du natürlich auch zur nächsten Sprache übergehen.",
];

const PAGE_COUNT = PARAGRAPHS.length;

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

const LESSON = buildLesson([...PARAGRAPHS, ...SCROLL_PARAGRAPHS]);

const MODES = [
  { id: "page", label: "Page Mode" },
  { id: "sentence", label: "Sentence Mode" },
  { id: "scroll", label: "Scroll Mode" },
];

function modeIcon(id) {
  if (id === "sentence") return <img src={sentenceModeIcon} alt="" width={22} height={13} />;
  if (id === "scroll") return <WrapText size={24} strokeWidth={1.5} absoluteStrokeWidth />;
  return <img src={pageModeIcon} alt="" width={22} height={17} />;
}

function ModeMenu({ mode, onChoose }) {
  return (
    <div className="mode-menu" role="menu">
      {MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitemradio"
          aria-checked={item.id === mode}
          className={`mode-menu-item${item.id === mode ? " is-current" : ""}`}
          onClick={() => onChoose(item.id)}
        >
          {modeIcon(item.id)}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

const THEMES = [
  { id: "light", label: "Light", color: "#ffffff", border: "#f1f3f4" },
  { id: "dark", label: "Dark", color: "#1e2328", border: "#49525b" },
  { id: "sepia", label: "Sepia", color: "#fffaed", border: "#f1f3f4" },
  { id: "mint", label: "Mint", color: "#c6e7ce", border: "#f1f3f4" },
  { id: "royal", label: "Royal blue", color: "#254685", border: "#f1f3f4" },
];

const FONT_STYLES = [
  ["Rubik", "400", "Rubik Original"],
  ["Rubik", "700", "Rubik Bold"],
  ["Georgia, serif", "400", "Georgia Serif"],
  ["DM Sans", "400", "Adys"],
  ["Barlow Condensed, sans-serif", "400", "Bariol Serif"],
  ["Roboto, sans-serif", "400", "Roboto"],
  ["Spectral, serif", "400", "Spectral"],
  ["Lora, serif", "400", "Lora"],
  ["Poppins, sans-serif", "400", "Poppins"],
  ["Inter, sans-serif", "400", "Inter"],
  ["Bodoni Moda, serif", "400", "Bodoni"],
  ["Open Sans, sans-serif", "400", "Open Sans"],
  ["Noto Serif, serif", "400", "Noto Serif"],
];

function MenuRow({ icon, label, onClick, children }) {
  return (
    <div className="reader-menu-row">
      <button type="button" className="reader-menu-item" onClick={onClick}>
        {icon}
        <span>{label}</span>
        {children}
      </button>
    </div>
  );
}

function ReaderOptionsMenu({ mode, showTranslation, onToggleTranslation }) {
  return (
    <div className="reader-menu" role="menu">
      <div className="reader-menu-header">
        <button type="button" className="reader-menu-nav" aria-label="Previous lesson">
          <ChevronLeft size={16} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
        <div className="reader-menu-lesson">
          <img src={thumbnail} alt="" width={32} height={32} />
          <span>
            <strong>Mehrere Sprachen auf einmal lernen?! Wie lange jeden Tag lernen?</strong>
            <em>YouTube auf Deutsch <span>(3/5)</span></em>
          </span>
        </div>
        <button type="button" className="reader-menu-nav" aria-label="Next lesson">
          <ChevronRight size={16} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
      </div>
      <div className="reader-menu-body">
        {mode === "sentence" ? <MenuRow icon={<SquarePen size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Edit Sentence" /> : null}
        <MenuRow icon={<Languages size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Show Translations" onClick={onToggleTranslation}>
          <span className={`menu-toggle${showTranslation ? " is-on" : ""}`} aria-hidden="true"><span /></span>
        </MenuRow>
        <MenuRow icon={<RotateCw size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Regenerate Lesson (AI)" />
        <MenuRow icon={<ArrowDownNarrowWide size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Simplify Lesson (AI)" />
        <div className="reader-menu-divider" />
        <MenuRow icon={<SquarePen size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Edit Lesson" />
        <MenuRow icon={<RefreshCw size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Refresh Lesson" />
        <MenuRow icon={<Printer size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Print Lesson" />
        <MenuRow icon={<ListPlus size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Add to Playlist" />
        <div className="reader-menu-divider" />
        <MenuRow icon={<Settings size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Settings" />
        <MenuRow icon={<img src={lynxIcon} alt="" width={16} height={16} />} label="Help" />
      </div>
    </div>
  );
}

function PlayerOptionsMenu({ autoAdvance, onAutoAdvance, loopAudio, onLoopAudio }) {
  return (
    <div className="reader-menu player-menu" role="menu">
      <div className="reader-menu-header">
        <div className="reader-menu-lesson">
          <img src={thumbnail} alt="" width={32} height={32} />
          <span>
            <strong>Mehrere Sprachen auf einmal lernen?! Wie lange jeden Tag lernen?</strong>
            <em>YouTube auf Deutsch <span>(3/5)</span></em>
          </span>
        </div>
      </div>
      <div className="reader-menu-body">
        <MenuRow icon={<StepForward size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Auto-Advance" onClick={onAutoAdvance}>
          <span className={`menu-toggle${autoAdvance ? " is-on" : ""}`} aria-hidden="true"><span /></span>
        </MenuRow>
        <MenuRow icon={<Gauge size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Playback Speed">
          <span className="reader-menu-meta">1.0x</span>
        </MenuRow>
        <MenuRow icon={<Timer size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Timer">
          <span className="reader-menu-meta">None</span>
        </MenuRow>
        <MenuRow icon={<Repeat2 size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Loop Audio" onClick={onLoopAudio}>
          <span className={`menu-toggle${loopAudio ? " is-on" : ""}`} aria-hidden="true"><span /></span>
        </MenuRow>
        <div className="reader-menu-divider" />
        <MenuRow icon={<CaseSensitive size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Theme" />
        <MenuRow icon={<Settings size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Settings" />
        <MenuRow icon={<img src={lynxIcon} alt="" width={16} height={16} />} label="Help">
          <span className="reader-menu-meta">Chat with Lynx <ChevronRight size={16} strokeWidth={1.5} absoluteStrokeWidth /></span>
        </MenuRow>
      </div>
    </div>
  );
}

function ThemeMenu({ theme, onTheme, font, onFont }) {
  return (
    <div className="theme-menu" role="menu">
      <section>
        <p>Background Color</p>
        <div className="theme-swatches">
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`theme-swatch${theme === item.id ? " is-selected" : ""}`}
              style={{ background: item.color, borderColor: item.border }}
              aria-label={item.label}
              aria-pressed={theme === item.id}
              onClick={() => onTheme(item.id)}
            />
          ))}
          <button type="button" className={`theme-swatch is-system${theme === "system" ? " is-selected" : ""}`} aria-label="System" aria-pressed={theme === "system"} onClick={() => onTheme("system")}>
            <Contrast size={24} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
        </div>
      </section>
      <div className="reader-menu-divider" />
      <section>
        <p>Text Size</p>
        <div className="theme-size">
          <span>A</span>
          <input type="range" min="0" max="4" defaultValue="1" aria-label="Text size" />
          <span>A</span>
        </div>
      </section>
      <div className="reader-menu-divider" />
      <section>
        <p>Font Style</p>
        <div className="theme-fonts">
          {FONT_STYLES.map(([family, weight, label]) => (
            <button
              key={label}
              type="button"
              className={font === label ? "is-selected" : undefined}
              style={{ fontFamily: family, fontWeight: weight }}
              aria-pressed={font === label}
              onClick={() => onFont(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function wordClassName(token) {
  if (token.kind === "lingq") return `word word-lingq word-lingq-${token.level}`;
  return `word word-${token.kind}`;
}

function TermStatusMenu({ anchorKey, status, onStatus, onClose }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const button = document.querySelector(`[data-term-status="${anchorKey}"]`);
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
  }, [anchorKey, status]);

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current?.contains(event.target)) return;
      if (event.target.closest?.(`[data-term-status="${anchorKey}"]`)) return;
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
  }, [anchorKey, onClose]);

  return (
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
    </div>
  );
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
  const [playing, setPlaying] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [mode, setMode] = useState("page");
  const [sentenceIndex, setSentenceIndex] = useState(1);
  const [showTranslation, setShowTranslation] = useState(true);
  const [modeMenu, setModeMenu] = useState(false);
  const [chromeMenu, setChromeMenu] = useState(null);
  const [playerMenu, setPlayerMenu] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [loopAudio, setLoopAudio] = useState(false);
  const [theme, setTheme] = useState("light");
  const [fontStyle, setFontStyle] = useState("Rubik Original");
  const [pageModePrompt, setPageModePrompt] = useState(false);
  const [sidePanel, setSidePanel] = useState(false);
  const [lynxOpen, setLynxOpen] = useState(false);
  const [showMini, setShowMini] = useState(false);
  const [termMenu, setTermMenu] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageStarts, setPageStarts] = useState(null);

  const lessonRef = useRef(lesson);
  const modeRef = useRef(mode);
  if (lessonRef.current !== lesson || modeRef.current !== mode) {
    lessonRef.current = lesson;
    modeRef.current = mode;
    if (pageStarts !== null) setPageStarts(null);
    if (pageIndex !== 0) setPageIndex(0);
  }

  useLayoutEffect(() => {
    if (mode !== "page" || pageStarts !== null || !textRef.current) return;
    const nodes = [...textRef.current.querySelectorAll("[data-page-paragraph]")];
    if (!nodes.length) return;
    const starts = [0];
    let used = 0;
    nodes.forEach((node, index) => {
      const height = node.offsetHeight + parseFloat(getComputedStyle(node).marginBottom);
      if (index > 0 && used + height > 550) {
        starts.push(index);
        used = height;
      } else {
        used += height;
      }
    });
    setPageStarts(starts);
  }, [mode, lesson, pageStarts]);

  function openPlayer() {
    setPlayerOpen(true);
    if (mode === "page") setMode("scroll");
    setModeMenu(false);
  }

  function applyMode(next) {
    if (next === "sentence") setSentenceIndex(1);
    setMode(next);
  }

  useEffect(() => {
    if (mode !== "sentence") return;
    textRef.current?.scrollTo({ top: 0 });
  }, [mode, sentenceIndex, playerOpen]);

  function chooseMode(next) {
    setModeMenu(false);
    if (next === "page" && (mode === "scroll" || mode === "sentence") && playerOpen && playing) {
      setPageModePrompt(true);
      return;
    }
    applyMode(next);
  }

  function confirmPageMode() {
    setPageModePrompt(false);
    setPlayerOpen(false);
    setPlayback(false);
    setMode("page");
  }

  useEffect(() => {
    if (!modeMenu) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".mode-menu") || event.target.closest?.(".mode-selector") || event.target.closest?.(".audio-bar-mode")) return;
      setModeMenu(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setModeMenu(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [modeMenu]);

  useEffect(() => {
    if (!chromeMenu) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".chrome-menu") || event.target.closest?.(".chrome-menu-anchor")) return;
      setChromeMenu(null);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setChromeMenu(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [chromeMenu]);

  useEffect(() => {
    if (!playerMenu) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".player-menu") || event.target.closest?.(".player-menu-anchor")) return;
      setPlayerMenu(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setPlayerMenu(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [playerMenu]);

  useEffect(() => {
    if (!pageModePrompt) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setPageModePrompt(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pageModePrompt]);

  function transition(update) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduced) {
      try {
        document.startViewTransition(() => {
          flushSync(update);
        });
        return;
      } catch {
        update();
        return;
      }
    }
    update();
  }

  function setPlayback(next) {
    transition(() => setPlaying(next));
  }

  function openLynx() {
    transition(() => setLynxOpen(true));
  }

  function closeLynx() {
    transition(() => setLynxOpen(false));
  }

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
        if (sidePanel) {
          setActive((current) => (current ? { ...current, size: "small" } : current));
          setShowMini((open) => !open);
        } else setActive(null);
        return;
      }
      openSaved(saved, paragraphIndex, tokenIndex, "small");
      if (sidePanel) setShowMini(true);
      return;
    }
    const closing = active
      && !active.phrase
      && active.paragraphIndex === paragraphIndex
      && active.tokenIndex === tokenIndex;
    if (closing) {
      if (sidePanel) {
        setActive((current) => (current ? { ...current, size: "small", mode: "meaning", statusMenu: false } : current));
        setShowMini((open) => !open);
      } else setActive(null);
      return;
    }
    createLingQ(paragraphIndex, tokenIndex);
    setActive({ paragraphIndex, tokenIndex, size: "small", mode: "meaning", statusMenu: false });
    if (sidePanel) setShowMini(true);
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
    const keepOpen = sidePanel || active.size === "large";
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
      if (sidePanel) setShowMini(false);
      else setActive(null);
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

  function changeTermStatus(paragraphIndex, tokenIndex, status, phraseId) {
    const appearance = STATUS_APPEARANCE[status];
    if (phraseId) {
      const phrase = savedPhrases.find((item) => item.id === phraseId);
      if (!phrase) return;
      if (phrase.status === status && phrase.kind === appearance.kind && (phrase.level ?? null) === (appearance.level ?? null)) {
        setTermMenu(null);
        return;
      }
      const previous = { status: phrase.status, kind: phrase.kind, level: phrase.level ?? null };
      setSavedPhrases((current) => current.map((item) => (
        item.id === phraseId ? { ...item, status, ...appearance } : item
      )));
      setActive((current) => (
        current?.phrase?.savedId === phraseId
          ? { ...current, phrase: { ...current.phrase, status, ...appearance } }
          : current
      ));
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
    } else {
      const token = lesson[paragraphIndex][tokenIndex];
      if (
        token.status === status
        && token.kind === appearance.kind
        && (token.level ?? null) === (appearance.level ?? null)
      ) {
        setTermMenu(null);
        return;
      }
      const previous = {
        status: token.status,
        kind: token.kind,
        level: token.level ?? null,
        meaning: token.meaning,
      };
      setLesson((current) => current.map((paragraph, pIndex) => {
        if (pIndex !== paragraphIndex) return paragraph;
        return paragraph.map((item, tIndex) => {
          if (tIndex !== tokenIndex || item.type !== "word") return item;
          return { ...item, status, ...appearance };
        });
      }));
      showSnackbar(status, () => restoreToken(paragraphIndex, tokenIndex, previous));
    }
    setTermMenu(null);
  }

  function openTerm(paragraphIndex, tokenIndex, phrase) {
    setTermMenu(null);
    if (phrase) openSaved(phrase, paragraphIndex, tokenIndex, "large");
    else setActive({ paragraphIndex, tokenIndex, size: "large", mode: "meaning", statusMenu: false });
    if (sidePanel) setShowMini(false);
  }

  function openLarge() {
    setActive((current) => (current ? { ...current, size: "large", statusMenu: false } : current));
  }

  function firstVisibleWord() {
    const paragraphs = mode === "sentence" ? [lesson[sentenceIndex]] : mode === "scroll" ? lesson : lesson.slice(0, PAGE_COUNT);
    for (let listIndex = 0; listIndex < paragraphs.length; listIndex += 1) {
      const paragraphIndex = mode === "sentence" ? sentenceIndex : listIndex;
      const tokenIndex = paragraphs[listIndex].findIndex((token) => token.type === "word");
      if (tokenIndex !== -1) return { paragraphIndex, tokenIndex };
    }
    return null;
  }

  function toggleSidePanel() {
    if (!sidePanel && !active) {
      const first = firstVisibleWord();
      if (!first) return;
      const saved = savedAt(first.paragraphIndex, first.tokenIndex);
      if (saved) {
        openSaved(saved, first.paragraphIndex, first.tokenIndex, "large");
      } else {
        createLingQ(first.paragraphIndex, first.tokenIndex);
        setActive({
          paragraphIndex: first.paragraphIndex,
          tokenIndex: first.tokenIndex,
          size: "large",
          mode: "meaning",
          statusMenu: false,
        });
      }
    } else if (!sidePanel) {
      setActive((current) => (current ? { ...current, size: "large", statusMenu: false } : current));
      if (active?.size === "small") setShowMini(true);
    }
    setSidePanel((open) => !open);
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

  function renderParagraph(paragraphIndex) {
    const tokens = lesson[paragraphIndex];
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
    return nodes;
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
        <div className="reader-stage">
        <div className={`reader-stage-main${playerOpen && mode !== "page" ? " has-video" : ""}`}>
        <div className="reader-chrome">
          {playerOpen && mode !== "page" ? null : (
          <div className="progress" aria-hidden="true">
            <div className="progress-track" />
            <div className="progress-fill" />
          </div>
          )}
          <div className="chrome-actions">
            <span className="chrome-menu-anchor">
              <button type="button" className="icon-button" aria-label="Text settings" aria-expanded={chromeMenu === "theme"} onClick={() => setChromeMenu((current) => (current === "theme" ? null : "theme"))}>
                <CaseSensitive size={24} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
              {chromeMenu === "theme" ? (
                <ThemeMenu theme={theme} onTheme={setTheme} font={fontStyle} onFont={setFontStyle} />
              ) : null}
            </span>
            <span className="chrome-menu-anchor">
              <button type="button" className="icon-button" aria-label="More options" aria-expanded={chromeMenu === "more"} onClick={() => setChromeMenu((current) => (current === "more" ? null : "more"))}>
                <Ellipsis size={24} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
              {chromeMenu === "more" ? (
                <ReaderOptionsMenu mode={mode} showTranslation={showTranslation} onToggleTranslation={() => setShowTranslation((open) => !open)} />
              ) : null}
            </span>
            {sidePanel ? null : (
            <button type="button" className="icon-button" aria-label="Open side panel" onClick={toggleSidePanel}>
              <PanelRight size={24} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            )}
          </div>
        </div>

        <div className={`lesson-area${mode === "page" ? "" : ` is-${mode}`}${playerOpen && mode !== "page" ? " has-video" : ""}`}>
          <div className="page-control">
            <button
              type="button"
              className="page-button"
              aria-label={mode === "sentence" ? "Previous sentence" : "Previous page"}
              onClick={() => {
                if (mode === "sentence") setSentenceIndex((index) => Math.max(0, index - 1));
                if (mode === "page") setPageIndex((index) => Math.max(0, index - 1));
              }}
            >
              <ChevronLeft size={16} strokeWidth={1.36} absoluteStrokeWidth />
            </button>
          </div>

          <div className="page-column">
          {playerOpen && mode !== "page" ? (
            <div className={`lesson-video${playing ? "" : " is-paused"}`}>
              <img src={videoDefault} alt="" />
              <img className="is-active" src={videoActive} alt="" />
            </div>
          ) : null}
          <article className="page-text" lang="de" ref={textRef}>
            {mode === "scroll" || (playerOpen && mode === "sentence") ? <div className="video-text-fade" aria-hidden="true" /> : null}
            {mode === "sentence" ? (
              <div className="sentence-view">
                <div className="sentence-block">
                  <p className="sentence-original">{renderParagraph(sentenceIndex)}</p>
                  <div className="sentence-actions">
                    <div className="sentence-play">
                      <button type="button" aria-label="Play sentence">
                        <Play size={18} strokeWidth={1.5} absoluteStrokeWidth />
                      </button>
                      <span className="sentence-play-divider" aria-hidden="true" />
                      <button type="button" aria-label="Playback speed">1x</button>
                    </div>
                    <button
                      type="button"
                      className={`sentence-translate${showTranslation ? " is-on" : ""}`}
                      aria-pressed={showTranslation}
                      aria-label={showTranslation ? "Hide translation" : "Show translation"}
                      onClick={() => setShowTranslation((open) => !open)}
                    >
                      <Languages size={18} strokeWidth={1.5} absoluteStrokeWidth />
                    </button>
                    <button type="button" className="sentence-refresh" aria-label="Refresh sentence">
                      <RefreshCw size={18} strokeWidth={1.5} absoluteStrokeWidth />
                    </button>
                  </div>
                  {showTranslation ? <p className="sentence-translation">{sentenceFor(lesson, sentenceIndex, 0).translation}</p> : null}
                </div>
                <div className="sentence-terms">
                  {lesson[sentenceIndex].flatMap((token, tokenIndex) => {
                    if (token.type !== "word") return [];
                    const phrase = savedPhrases.find((item) => phraseCovers(item, sentenceIndex, tokenIndex));
                    if (phrase) {
                      if (phrase.start.tokenIndex !== tokenIndex) return [];
                      if (phrase.kind !== "lingq" || phrase.level < 1 || phrase.level > 3) return [];
                      const menuKey = `phrase-${phrase.id}`;
                      return [(
                        <div
                          className="term-card"
                          key={menuKey}
                          role="button"
                          tabIndex={0}
                          onClick={() => openTerm(sentenceIndex, tokenIndex, phrase)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openTerm(sentenceIndex, tokenIndex, phrase);
                            }
                          }}
                        >
                          <span data-term-status={menuKey} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                            <StatusButton
                              status={phrase.status}
                              state="focus"
                              onClick={() => setTermMenu((current) => (current?.key === menuKey ? null : {
                                key: menuKey,
                                paragraphIndex: sentenceIndex,
                                tokenIndex,
                                phraseId: phrase.id,
                              }))}
                            />
                          </span>
                          <span className="term-card-text">
                            <span className="term-card-term">{phrase.text}</span>
                            <span className="term-card-meaning">{phrase.meaning}</span>
                          </span>
                        </div>
                      )];
                    }
                    if (token.kind !== "lingq" || token.level < 1 || token.level > 3) return [];
                    const menuKey = `word-${sentenceIndex}-${tokenIndex}`;
                    return [(
                      <div
                        className="term-card"
                        key={tokenIndex}
                        role="button"
                        tabIndex={0}
                        onClick={() => openTerm(sentenceIndex, tokenIndex, null)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openTerm(sentenceIndex, tokenIndex, null);
                          }
                        }}
                      >
                        <span data-term-status={menuKey} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                          <StatusButton
                            status={token.status}
                            state="focus"
                            onClick={() => setTermMenu((current) => (current?.key === menuKey ? null : {
                              key: menuKey,
                              paragraphIndex: sentenceIndex,
                              tokenIndex,
                              phraseId: null,
                            }))}
                          />
                        </span>
                        <span className="term-card-text">
                          <span className="term-card-term">{token.value}</span>
                          <span className="term-card-meaning">{token.meaning || meaningsFor(token.value)[0]}</span>
                        </span>
                      </div>
                    )];
                  })}
                </div>
                {termMenu ? (
                  <TermStatusMenu
                    anchorKey={termMenu.key}
                    status={termMenu.phraseId
                      ? (savedPhrases.find((item) => item.id === termMenu.phraseId)?.status || "New")
                      : (lesson[termMenu.paragraphIndex][termMenu.tokenIndex].status)}
                    onStatus={(status) => changeTermStatus(termMenu.paragraphIndex, termMenu.tokenIndex, status, termMenu.phraseId)}
                    onClose={() => setTermMenu(null)}
                  />
                ) : null}
              </div>
            ) : null}
            {mode === "sentence" ? null : (() => {
              const pageSource = lesson.slice(0, PAGE_COUNT);
              const measuring = mode === "page" && pageStarts === null;
              const start = measuring ? 0 : (pageStarts?.[pageIndex] ?? 0);
              const end = measuring ? pageSource.length : (pageStarts?.[pageIndex + 1] ?? pageSource.length);
              const paragraphs = mode === "scroll" ? lesson : pageSource.slice(start, end);
              return paragraphs.map((tokens, listIndex) => {
              const paragraphIndex = mode === "page" ? start + listIndex : listIndex;
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
              return (
                <p key={paragraphIndex} data-page-paragraph={mode === "page" ? paragraphIndex : undefined}>
                  {nodes}
                </p>
              );
            });
            })()}
            {activeToken && active.size !== "medium" && active.size !== "large" && (!sidePanel || showMini) ? (
              <WidgetSmall
                anchorId={`${active.paragraphIndex}-${active.tokenIndex}`}
                boundaryRef={textRef}
                status={activeStatus}
                meaning={activeMeaning}
                mode={active.mode}
                hideChevron={sidePanel}
                onMode={(mode) => setActive((current) => (current ? { ...current, mode } : current))}
                onStatus={handleStatusChange}
                onClose={() => {
                  if (sidePanel) setShowMini(false);
                  else setActive(null);
                }}
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
          {mode === "scroll" ? <div className="scroll-text-fade" aria-hidden="true" /> : null}
          {phrasePick ? (
            <div className="phrase-tooltip" role="status">
              <MousePointerClick size={18} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
              <p>Select another word to create a phrase.</p>
            </div>
          ) : null}
          {activeToken && active.size === "large" && !sidePanel ? (
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
              docked={false}
              onTogglePanel={toggleSidePanel}
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
            <button
              type="button"
              className="page-button"
              aria-label={mode === "sentence" ? "Next sentence" : "Next page"}
              onClick={() => {
                if (mode === "sentence") setSentenceIndex((index) => Math.min(lesson.length - 1, index + 1));
                if (mode === "page") setPageIndex((index) => Math.min((pageStarts?.length ?? 1) - 1, index + 1));
              }}
            >
              <ChevronRight size={16} strokeWidth={1.36} absoluteStrokeWidth />
            </button>
          </div>
        </div>
        </div>
        {(sidePanel && activeToken) || lynxOpen ? (
          <aside className={`side-panel${lynxOpen && !playerOpen ? " is-anchored" : ""}${lynxOpen && sidePanel && activeToken ? " is-split" : ""}`}>
            {sidePanel && activeToken ? (
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
              docked
              compact={lynxOpen}
              onTogglePanel={toggleSidePanel}
            />
            ) : null}
            {lynxOpen ? <LynxChat onClose={closeLynx} /> : null}
          </aside>
        ) : null}
        </div>
      </main>

      <footer className={`reader-footer${playerOpen ? " is-player-open" : ""}`}>
        {playerOpen ? (
          <div className="audio-bar" role="group" aria-label="Lesson audio">
            <div className="audio-bar-progress" aria-hidden="true"><span /></div>
            <div className="audio-bar-row">
              <div className="audio-bar-controls">
                <button type="button" className="audio-bar-pause" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlayback(!playing)}>
                  {playing ? <Pause size={20} strokeWidth={1.5} absoluteStrokeWidth /> : <Play size={20} strokeWidth={1.5} absoluteStrokeWidth />}
                </button>
                <button type="button" className="audio-bar-control" aria-label="Back 5 seconds">
                  <img src={skipBackIcon} alt="" width={18} height={18} />
                </button>
                <button type="button" className="audio-bar-control" aria-label="Forward 5 seconds">
                  <img src={skipForwardIcon} alt="" width={18} height={18} />
                </button>
                <button type="button" className="audio-bar-control" aria-label="Repeat">
                  <Repeat2 size={18} strokeWidth={1.33} absoluteStrokeWidth />
                </button>
                <button type="button" className="audio-bar-speed" aria-label="Playback speed">1x</button>
                <span className="audio-bar-divider" aria-hidden="true" />
                <span className="audio-bar-time">03:30 / 20:45</span>
              </div>
              <div className="audio-bar-tools">
                <span className="player-menu-anchor">
                  <button type="button" className="audio-bar-control" aria-label="More audio options" aria-expanded={playerMenu} onClick={() => setPlayerMenu((open) => !open)}>
                    <Ellipsis size={18} strokeWidth={1.35} absoluteStrokeWidth />
                  </button>
                  {playerMenu ? (
                    <PlayerOptionsMenu
                      autoAdvance={autoAdvance}
                      onAutoAdvance={() => setAutoAdvance((on) => !on)}
                      loopAudio={loopAudio}
                      onLoopAudio={() => setLoopAudio((on) => !on)}
                    />
                  ) : null}
                </span>
                <span className="audio-bar-divider" aria-hidden="true" />
                <span className="mode-anchor">
                  <button type="button" className="audio-bar-mode" aria-label="Reading mode" aria-expanded={modeMenu} onClick={() => setModeMenu((open) => !open)}>
                    {modeIcon(mode)}
                    <ChevronsUpDown size={18} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
                  </button>
                  {modeMenu ? <ModeMenu mode={mode} onChoose={chooseMode} /> : null}
                </span>
                <button type="button" className="audio-bar-lynx" aria-label="Ask Lynx AI" onClick={openLynx}>
                  <img src={lynxIcon} alt="" width={22} height={22} />
                </button>
                <button type="button" className="audio-bar-control" aria-label="Collapse player" onClick={() => setPlayerOpen(false)}>
                  <ChevronDown size={18} strokeWidth={1.35} absoluteStrokeWidth />
                </button>
              </div>
            </div>
          </div>
        ) : playing ? (
          <div className="audio-player" role="group" aria-label="Lesson audio">
            <div className="audio-player-main">
              <div className="audio-player-lesson">
                <div className="audio-player-thumb">
                  <img src={thumbnail} alt="" width={45} height={45} />
                  <button type="button" className="audio-player-pause" aria-label="Pause" onClick={() => setPlayback(false)}>
                    <Pause size={16} strokeWidth={1.5} absoluteStrokeWidth />
                  </button>
                </div>
                <div className="audio-player-text">
                  <p>Mehrere Sprachen auf einmal lernen?! Wie lange jeden Tag lernen?</p>
                  <div className="audio-player-course">
                    <span>YouTube auf Deutsch</span>
                    <span>(3/5)</span>
                  </div>
                </div>
              </div>
              <button type="button" className="audio-player-icon" aria-label="Replay 10 seconds">
                <img src={replayIcon} alt="" width={19} height={23} />
              </button>
              <span className="player-menu-anchor">
                <button type="button" className="audio-player-icon" aria-label="More audio options" aria-expanded={playerMenu} onClick={() => setPlayerMenu((open) => !open)}>
                  <Ellipsis size={18} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
                {playerMenu ? (
                  <PlayerOptionsMenu
                    autoAdvance={autoAdvance}
                    onAutoAdvance={() => setAutoAdvance((on) => !on)}
                    loopAudio={loopAudio}
                    onLoopAudio={() => setLoopAudio((on) => !on)}
                  />
                ) : null}
              </span>
              <span className="audio-player-divider" aria-hidden="true" />
              <button type="button" className="audio-player-icon" aria-label="Expand player" onClick={openPlayer}>
                <ChevronRight size={18} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
            </div>
            <div className="audio-player-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        ) : (
          <button type="button" className="play-button" aria-label="Play" onClick={() => setPlayback(true)}>
            <Play size={24} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
        )}

        {playerOpen ? null : (
        <>
        <div className="floating-nav">
          <span className="mode-anchor">
            <button type="button" className="mode-selector" aria-expanded={modeMenu} onClick={() => setModeMenu((open) => !open)}>
              {modeIcon(mode)}
              <span>{MODES.find((item) => item.id === mode)?.label}</span>
              <ChevronsUpDown size={18} strokeWidth={1.33} absoluteStrokeWidth aria-hidden="true" />
            </button>
            {modeMenu ? <ModeMenu mode={mode} onChoose={chooseMode} /> : null}
          </span>
          <span className="nav-divider" aria-hidden="true" />
          <button type="button" className="vocab-button" aria-label="Vocabulary">
            <img src={reviewIcon} alt="" width={20} height={20} />
          </button>
        </div>

        {lynxOpen ? null : (
        <form className="lynx-control" onClick={openLynx} onSubmit={(event) => { event.preventDefault(); openLynx(); }}>
          <input type="text" placeholder="Ask Lynx AI ..." aria-label="Ask Lynx AI" readOnly />
          <button type="submit" className="lynx-button" aria-label="Ask Lynx AI">
            <img src={lynxIcon} alt="" width={22} height={22} />
          </button>
        </form>
        )}
        </>
        )}
      </footer>

      {pageModePrompt ? (
        <div className="mode-dialog-backdrop" onClick={() => setPageModePrompt(false)}>
          <div
            className="mode-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="page-mode-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mode-dialog-copy">
              <p id="page-mode-dialog-title">Video will be stopped.</p>
              <p>Switching to page mode will stop the video playing.</p>
            </div>
            <div className="mode-dialog-actions">
              <button type="button" className="mode-dialog-cancel" onClick={() => setPageModePrompt(false)}>Cancel</button>
              <button type="button" className="mode-dialog-confirm" onClick={confirmPageMode}>Continue to Page Mode</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
