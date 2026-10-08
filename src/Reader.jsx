import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync, createPortal } from "react-dom";
import {
  ArrowDownNarrowWide,
  ArrowUpRight,
  BellOff,
  BookOpenText,
  CaseSensitive,
  ChartColumn,
  ChevronDown,
  Columns2,
  FileText,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ChevronsUpDown,
  Contrast,
  Download,
  EllipsisVertical,
  FlaskConical,
  Gauge,
  Languages,
  List,
  ListPlus,
  LogOut,
  Maximize,
  Minimize,
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
  X,
  Youtube,
} from "lucide-react";
import WidgetSmall from "./WidgetSmall.jsx";
import WidgetMedium from "./WidgetMedium.jsx";
import WidgetLarge from "./WidgetLarge.jsx";
import LynxChat from "./LynxChat.jsx";
import ReviewPanel, { reviewTermsFrom } from "./ReviewPanel.jsx";
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
import lingqIcon from "../assets/LingQ-Icon.png";
import thumbnail from "../assets/lesson-thumbnail.jpg";

const PARAGRAPHS = [
  "Also der erste, würde ich sagen, ist erst mal die Zeit.",
  "Ja, natürlich, wenn du vorhast, wirklich eine Sprache gut zu lernen, musst du natürlich eine ganze Menge Zeit aufwenden, und je nachdem, wie voll dein Wochenplan ist, ist vielleicht gar nicht die Zeit da, um jetzt mehrere Sprachen gleichzeitig zu lernen.",
  "Also das muss man natürlich beachten.",
  "Wenn du jetzt sowieso maximal jeden Tag 15 Minuten zur Verfügung hast, dann wirst du wahrscheinlich nicht weit kommen mit mehreren Sprachen, ja.",
  "Also, und wir gehen davon aus, für den Fall, dass du gute Levels erreichen möchtest, ja.",
  "Es ist auch möglich, dass du zehn Sprachen gleichzeitig lernst und dann in keiner Sprache wirklich gute Fortschritte machst.",
  "Aber wenn es dir irgendwie Spaß macht und du willst in allen Sprachen nur ein paar Sätze lernen, dann kannst du das natürlich machen, aber meine Tipps sind jetzt dahingehend, dass du auch wirklich Erfolge feierst, ja, sag ich mal so.",
  "Und der zweite große Faktor in diesem, dieser Frage ist: Welche Sprachen hast du denn vor zu lernen?",
  "Ja, weil ich würde nicht unbedingt empfehlen, vor allem wenn du nicht viel Erfahrung hast mit dem Sprachenlernen, würde ich nicht empfehlen, jetzt von null anzufangen, zwei sehr schwere Sprachen zu lernen, ja, zum Beispiel Arabisch und Japanisch.",
  "Ja, also wenn da, das ist in meinen Augen quasi zum Scheitern verurteilt, weil eine dieser Sprachen schon mehr als genug ist und da kannst du schon und musst du schon mehr als genug Zeit aufwenden, um da wirklich ein gutes Level zu erreichen.",
  "D.h. in so einem Fall würde ich mich lieber erstmal auf eine dieser Sprachen beschränken, und wenn du dann irgendwann ein gutes Level erreicht hast oder keine Lust mehr hast, sag ich mal, dann kannst du natürlich auch zur nächsten Sprache übergehen.",
  "Ein ähnlicher Fall, den, oder eine ähnliche Konstellation, die ich auch nicht unbedingt empfehlen würde, ist jetzt, wenn du von null anfängst, zwei sehr ähnliche Sprachen zu lernen, ja, sag ich mal Spanisch und Portugiesisch oder so.",
  "Ja, also kann man machen, ja, aber wenn du jetzt wirklich von null anfängst, dann wird es einfach sehr verwirrend sein, weil die Sprachen einfach so ähnlich sind und du kannst du gar nicht zuordnen, oh, ist das jetzt, ist es jetzt Spanisch oder ist das Portugiesisch oder ist das jetzt Italienisch oder Spanisch.",
  "Das würde ich nicht empfehlen.",
  "Ich würde dir, das kannst du aber ohne Probleme machen, sobald du in einer dieser Sprachen ein gutes Level erreicht hast, ja, eine gute Basis, mittleres Niveau vielleicht erreicht hast, dann kannst du auch anfangen, eine andere romanische Sprache zu lernen und die andere dennoch weiter voranzutreiben.",
  "Ja, das ist möglich, aber dieses beides von null anfangen kann ein bisschen verwirrend sein.",
  "Möglich ist es, ja, aber wie gesagt, würde ich es nicht unbedingt empfehlen.",
];

const SCROLL_PARAGRAPHS = [];

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

function modeIcon(id, size = 24) {
  if (id === "sentence") return <img src={sentenceModeIcon} alt="" width={size} height={size} />;
  if (id === "scroll") return <WrapText size={size} strokeWidth={1.5} absoluteStrokeWidth />;
  return <img src={pageModeIcon} alt="" width={size} height={size} />;
}

const REVIEW_CARDS = {
  page: "Page Vocabulary Review",
  sentence: "Sentence Vocabulary Review",
  due: "Due Vocabulary Review",
  lesson: "Lesson Vocabulary Review",
};

const REVIEW_ACTIONS = [
  { id: "page", label: "Review Page", icon: FileText },
  { id: "due", label: "Review Due", icon: Timer },
  { id: "lesson", label: "Review Lesson", icon: BookOpenText },
  { id: "list", label: "Vocabulary List", icon: List },
];

function ReviewActionsMenu({ onChoose }) {
  return (
    <div className="review-menu vocab-menu" role="menu">
      {REVIEW_ACTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <div className="review-menu-item" key={item.id}>
            <button type="button" role="menuitem" onClick={() => onChoose(item.id)}>
              <Icon size={16} strokeWidth={1.5} absoluteStrokeWidth />
              {item.label}
            </button>
          </div>
        );
      })}
      <div className="vocab-menu-divider" />
      <div className="review-menu-item">
        <button type="button" role="menuitem" onClick={() => onChoose("manage")}>
          <img src={lingqIcon} alt="" width={16} height={16} />
          <span>Manage Vocabulary</span>
          <ArrowUpRight size={14} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
      </div>
    </div>
  );
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

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const onChange = () => setMobile(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return mobile;
}

function MenuRow({ icon, label, onClick, children, destructive }) {
  return (
    <div className="reader-menu-row">
      <button type="button" className={`reader-menu-item${destructive ? " is-destructive" : ""}`} onClick={onClick}>
        {icon}
        <span>{label}</span>
        {children}
      </button>
    </div>
  );
}

const LESSON_TYPES = [
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio Only" },
  { id: "both", label: "Audio & Video" },
];

function DemoSettings({ lessonType, onLessonType, onClose }) {
  return (
    <div className="demo-settings-layer" onClick={onClose}>
      <div
        className="demo-settings"
        role="dialog"
        aria-labelledby="demo-settings-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="demo-settings-heading">
          <p id="demo-settings-title">Demo settings</p>
          <button type="button" className="demo-settings-close" aria-label="Close demo settings" onClick={onClose}>
            <X size={16} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
        </div>
        <p className="demo-settings-note">Placeholder for previewing lesson formats. Not part of the reader.</p>
        <div className="demo-type">
          <p id="demo-type-label">Lesson type</p>
          <div role="radiogroup" aria-labelledby="demo-type-label">
            {LESSON_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={lessonType === item.id}
                className={lessonType === item.id ? "is-selected" : ""}
                onClick={() => onLessonType(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DownloadMenu() {
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);
  function onBlur(event) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    setOpen(false);
  }
  return (
    <div
      className={`reader-menu-row reader-menu-submenu-anchor${open ? " is-open" : ""}`}
      onMouseEnter={() => { if (!mobile) setOpen(true); }}
      onMouseLeave={() => { if (!mobile) setOpen(false); }}
      onFocus={() => { if (!mobile) setOpen(true); }}
      onBlur={onBlur}
    >
      <button
        type="button"
        className="reader-menu-item"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => { if (mobile) setOpen((value) => !value); }}
      >
        <Download size={16} strokeWidth={1.5} absoluteStrokeWidth />
        <span>Download</span>
        <ChevronRight className="reader-menu-chevron" size={16} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
      </button>
      <div className="reader-submenu" role="menu">
        <div className="reader-menu-row">
          <button type="button" className="reader-menu-item" role="menuitem">
            <Download size={16} strokeWidth={1.5} absoluteStrokeWidth />
            <span>Download Audio</span>
          </button>
        </div>
        <div className="reader-menu-row">
          <button type="button" className="reader-menu-item" role="menuitem">
            <Download size={16} strokeWidth={1.5} absoluteStrokeWidth />
            <span>Download SRT File</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ReaderOptionsMenu({ mode, showTranslation, onToggleTranslation, onOpenDemo, onClose }) {
  const mobile = useIsMobile();
  const menu = (
    <div className={`reader-menu${mobile ? " is-sheet" : ""}`} role="menu">
      {mobile ? <PlayerDragHandle label="Close menu" onDragDown={onClose} /> : null}
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
        <MenuRow icon={<BellOff size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Unsubscribe" destructive />
        <MenuRow icon={<RefreshCw size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Refresh Lesson" />
        <MenuRow icon={<Printer size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Print Lesson" />
        <DownloadMenu />
        <MenuRow icon={<ListPlus size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Add to Playlist" />
        <div className="reader-menu-divider" />
        <MenuRow icon={<Settings size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Settings" />
        <MenuRow icon={<ChartColumn size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Statistics" />
        <MenuRow icon={<img src={lynxIcon} alt="" width={16} height={16} />} label="Help" />
        <div className="reader-menu-divider" />
        <MenuRow icon={<FlaskConical size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Demo settings" onClick={onOpenDemo} />
      </div>
    </div>
  );
  if (mobile) return createPortal(menu, document.body);
  return menu;
}

function PlayerOptionsMenu({ autoAdvance, onAutoAdvance, loopAudio, onLoopAudio, sideBySide, onSideBySide, theater, onTheater, showLayout, onClose }) {
  const mobile = useIsMobile();
  const menu = (
    <div className={`reader-menu player-menu${mobile ? " is-sheet" : ""}`} role="menu">
      {mobile ? <PlayerDragHandle label="Close menu" onDragDown={onClose} /> : null}
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
        {showLayout ? (
          <div className="player-menu-layout">
            <MenuRow icon={<Columns2 size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Split view" onClick={onSideBySide}>
              <span className={`menu-toggle${sideBySide ? " is-on" : ""}`} aria-hidden="true"><span /></span>
            </MenuRow>
          </div>
        ) : null}
        {showLayout ? (
          <MenuRow icon={theater ? <Minimize size={16} strokeWidth={1.5} absoluteStrokeWidth /> : <Maximize size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Theater mode" onClick={onTheater}>
            <span className={`menu-toggle${theater ? " is-on" : ""}`} aria-hidden="true"><span /></span>
          </MenuRow>
        ) : null}
        <div className="reader-menu-divider" />
        <MenuRow icon={<CaseSensitive size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Theme" />
        <MenuRow icon={<Settings size={16} strokeWidth={1.5} absoluteStrokeWidth />} label="Settings" />
        <MenuRow icon={<img src={lynxIcon} alt="" width={16} height={16} />} label="Help">
          <span className="reader-menu-meta">Chat with Lynx <ChevronRight size={16} strokeWidth={1.5} absoluteStrokeWidth /></span>
        </MenuRow>
      </div>
    </div>
  );
  if (mobile) return createPortal(menu, document.body);
  return menu;
}

function ThemeMenu({ theme, onTheme, font, onFont, onClose }) {
  const mobile = useIsMobile();
  const menu = (
    <div className={`theme-menu${mobile ? " is-sheet" : ""}`} role="menu">
      {mobile ? <PlayerDragHandle label="Close menu" onDragDown={onClose} /> : null}
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
          <input
            type="range"
            min="0"
            max="4"
            defaultValue="1"
            aria-label="Text size"
            onInput={(event) => {
              const input = event.currentTarget;
              const span = Number(input.max) - Number(input.min);
              input.style.setProperty("--size", `${((input.valueAsNumber - Number(input.min)) / span) * 100}%`);
            }}
          />
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
  if (mobile) return createPortal(menu, document.body);
  return menu;
}

function wordClassName(token) {
  if (token.kind === "lingq") return `word word-lingq word-lingq-${token.level}`;
  return `word word-${token.kind}`;
}

function PlayerDragHandle({ onDragUp, onDragDown, label }) {
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
    const delta = event.clientY - current.y;
    if (delta <= -40 && onDragUp) {
      current.handled = true;
      onDragUp();
    } else if (delta >= 40 && onDragDown) {
      current.handled = true;
      onDragDown();
    }
  }

  function onClick() {
    if (drag.current?.handled) {
      drag.current = null;
      return;
    }
    onDragDown?.();
  }

  return (
    <button
      type="button"
      className="player-drag-handle"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onClick={onClick}
    />
  );
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

const AUDIO_DURATION = 20 * 60 + 45;

function formatAudioTime(seconds) {
  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remain = rounded % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
}

function AudioTimeline({ time, duration, scrubbing, onScrub, onScrubbing }) {
  const trackRef = useRef(null);
  const scrubbingRef = useRef(false);

  function seek(clientX) {
    const rect = trackRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onScrub(ratio * duration);
  }

  function beginScrub(event) {
    scrubbingRef.current = true;
    onScrubbing(true);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Pointer capture needs a real pointer. */
    }
    seek(event.clientX);
  }

  function moveScrub(event) {
    if (!scrubbingRef.current) return;
    seek(event.clientX);
  }

  function endScrub() {
    if (!scrubbingRef.current) return;
    scrubbingRef.current = false;
    onScrubbing(false);
  }

  function onKeyDown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    onScrubbing(true);
    const delta = event.key === "ArrowRight" ? 5 : -5;
    onScrub(Math.min(duration, Math.max(0, time + delta)));
  }

  return (
    <div className={`audio-bar-timeline${scrubbing ? " is-scrubbing" : ""}`}>
      <div className="audio-bar-float-times">
        <span>{formatAudioTime(time)}</span>
        <span>{formatAudioTime(duration)}</span>
      </div>
      <div
        className="audio-bar-progress"
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Audio progress"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Math.round(time)}
        aria-valuetext={`${formatAudioTime(time)} of ${formatAudioTime(duration)}`}
        onPointerDown={beginScrub}
        onPointerMove={moveScrub}
        onPointerUp={endScrub}
        onPointerCancel={endScrub}
        onKeyDown={onKeyDown}
        onKeyUp={() => onScrubbing(false)}
        onBlur={() => onScrubbing(false)}
      >
        <span style={{ width: `${(time / duration) * 100}%` }} />
      </div>
    </div>
  );
}

export default function Reader() {
  const textRef = useRef(null);
  const theaterMotion = useRef(0);
  const splitMotion = useRef(0);
  const termsRef = useRef(null);
  const footerRef = useRef(null);
  const pressRef = useRef({ suppressClick: false });
  const phraseIdRef = useRef(1);
  const [lesson, setLesson] = useState(LESSON);
  const [active, setActive] = useState(null);
  const [phrasePick, setPhrasePick] = useState(null);
  const [savedPhrases, setSavedPhrases] = useState([]);
  const [snackbar, setSnackbar] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [playerShown, setPlayerShown] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [sideBySide, setSideBySide] = useState(false);
  const [theater, setTheater] = useState(false);
  const [theaterLine, setTheaterLine] = useState(null);
  const [theaterView, setTheaterView] = useState(null);
  const [lessonType, setLessonType] = useState("video");
  const [media, setMedia] = useState("video");
  const [playMenu, setPlayMenu] = useState(false);
  const lessonHasVideo = lessonType !== "audio";
  const [demoSettings, setDemoSettings] = useState(false);
  const [mode, setMode] = useState("page");
  const [sentenceIndex, setSentenceIndex] = useState(1);
  const [showTranslation, setShowTranslation] = useState(true);
  const [modeMenu, setModeMenu] = useState(false);
  const [chromeMenu, setChromeMenu] = useState(null);
  const [playerMenu, setPlayerMenu] = useState(false);
  const [audioTime, setAudioTime] = useState(3 * 60 + 30);
  const [scrubbing, setScrubbing] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [loopAudio, setLoopAudio] = useState(false);
  const [theme, setTheme] = useState("light");
  const [fontStyle, setFontStyle] = useState("Rubik Original");
  const [pageModePrompt, setPageModePrompt] = useState(false);
  const [finishPrompt, setFinishPrompt] = useState(false);
  const [finishDismiss, setFinishDismiss] = useState(false);
  const [hideFinishPrompt, setHideFinishPrompt] = useState(false);
  const [sidePanel, setSidePanel] = useState(false);
  const [lynxOpen, setLynxOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewMenu, setReviewMenu] = useState(false);
  const [reviewCard, setReviewCard] = useState(null);
  const [showMini, setShowMini] = useState(false);
  const [termMenu, setTermMenu] = useState(null);
  const [termPulse, setTermPulse] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageStarts, setPageStarts] = useState(null);
  const [atScrollEnd, setAtScrollEnd] = useState(false);
  const mobile = useIsMobile();

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
    const limit = textRef.current.clientHeight;
    if (!limit) return;
    const lines = nodes.flatMap((node) => {
      const lineHeight = parseFloat(getComputedStyle(node).lineHeight) || node.offsetHeight;
      const count = Math.max(1, Math.round(node.offsetHeight / lineHeight));
      const top = node.offsetTop;
      return Array.from({ length: count }, (_, index) => ({
        top: top + index * lineHeight,
        bottom: top + (index + 1) * lineHeight,
      }));
    });
    const starts = [0];
    let pageTop = 0;
    lines.forEach((line) => {
      if (line.bottom - pageTop <= limit + 0.5) return;
      if (line.top <= pageTop + 0.5) return;
      starts.push(line.top);
      pageTop = line.top;
    });
    setPageStarts(starts);
    setPageIndex((index) => Math.min(index, Math.max(0, starts.length - 1)));
  }, [mode, lesson, pageStarts]);

  useEffect(() => {
    if (mode !== "page") return undefined;
    const node = textRef.current;
    if (!node) return undefined;
    let last = node.clientHeight;
    const observer = new ResizeObserver(() => {
      const next = node.clientHeight;
      if (!next || Math.abs(next - last) < 1) return;
      last = next;
      setPageStarts(null);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    const node = textRef.current;
    if (mode !== "scroll" || !node) {
      setAtScrollEnd(false);
      return undefined;
    }
    function update() {
      const remaining = node.scrollHeight - node.scrollTop - node.clientHeight;
      setAtScrollEnd(remaining <= 8);
    }
    update();
    node.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => {
      node.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [mode, lesson, playerOpen, playerShown]);

  function openPlayer() {
    setPlayerShown(true);
    setPlayerOpen(true);
    if (lessonHasVideo && media === "video" && mode === "page") setMode("scroll");
    setModeMenu(false);
  }

  function applyMode(next) {
    if (next === "sentence") setSentenceIndex(1);
    const openingVideo = lessonHasVideo && media === "video" && next !== "page" && mode === "page";
    transition(() => {
      setMode(next);
      if (!openingVideo) return;
      setPlayerShown(true);
      setPlayerOpen(false);
      setPlaying(false);
    });
  }

  useEffect(() => {
    if (mode !== "sentence") return;
    textRef.current?.scrollTo({ top: 0 });
  }, [mode, sentenceIndex, playerOpen, playerShown]);

  useLayoutEffect(() => {
    if (!termPulse || mode !== "sentence") return undefined;
    const scroller = termsRef.current;
    const tile = scroller?.querySelector(`[data-term-key="${termPulse.key}"]`);
    if (!scroller || !tile) return undefined;
    const pad = parseFloat(getComputedStyle(scroller).paddingLeft) || 0;
    const left = tile.getBoundingClientRect().left - scroller.getBoundingClientRect().left + scroller.scrollLeft - pad;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
    tile.classList.remove("is-pulsing");
    void tile.offsetWidth;
    tile.classList.add("is-pulsing");
    const stop = () => tile.classList.remove("is-pulsing");
    tile.addEventListener("animationend", stop);
    return () => {
      tile.removeEventListener("animationend", stop);
      tile.classList.remove("is-pulsing");
    };
  }, [termPulse, mode]);

  function chooseMode(next) {
    setModeMenu(false);
    if (lessonHasVideo && media === "video" && next === "page" && mode !== "page" && playerShown) {
      setPageModePrompt(true);
      return;
    }
    applyMode(next);
  }

  function confirmPageMode() {
    setPageModePrompt(false);
    transition(() => {
      setPlayerOpen(false);
      setPlayerShown(false);
      setPlaying(false);
      setTheater(false);
      setMode("page");
    });
  }

  function dismissPlayer() {
    transition(() => {
      setPlayerMenu(false);
      setModeMenu(false);
      setPlayMenu(false);
      setPlayerOpen(false);
      setPlayerShown(false);
      setPlaying(false);
      setTheater(false);
      if (lessonType === "video") setMedia("video");
    });
  }

  function collapsePlayer() {
    if (!theater) {
      setPlayerOpen(false);
      return;
    }
    runTheater(() => {
      setPlayerOpen(false);
      setTheater(false);
    });
  }

  function measureContext(size) {
    const sample = textRef.current;
    const family = sample ? getComputedStyle(sample).fontFamily : "DM Sans, sans-serif";
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.font = `400 ${size}px ${family}`;
    return ctx;
  }

  function fitTranslation(text, maxWidth) {
    const ctx = measureContext(16);
    if (!ctx) return text;
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      const trial = line ? `${line} ${word}` : word;
      if (ctx.measureText(trial).width > maxWidth && line) {
        lines.push(line);
        if (lines.length >= 2) return lines.join(" ");
        line = word;
      } else {
        line = trial;
      }
    }
    if (line && lines.length < 2) lines.push(line);
    return lines.join(" ");
  }

  function sliceTranslation(tokens, start, end, translation) {
    const english = translation.split(/\s+/).filter(Boolean);
    if (!english.length) return "";
    const wordAt = [];
    tokens.forEach((token, index) => {
      if (token.type === "word") wordAt.push(index);
    });
    if (!wordAt.length) return "";
    const first = wordAt.findIndex((index) => index >= start);
    const fromWord = first === -1 ? wordAt.length : first;
    let toWord = fromWord;
    while (toWord < wordAt.length && wordAt[toWord] < end) toWord += 1;
    if (toWord <= fromWord) return "";
    const from = Math.round((fromWord / wordAt.length) * english.length);
    const to = Math.max(from + 1, Math.round((toWord / wordAt.length) * english.length));
    return english.slice(from, Math.min(english.length, to)).join(" ");
  }

  function theaterTranslation(line, end, maxWidth) {
    const tokens = lesson[line.paragraphIndex] || [];
    const aligned = sliceTranslation(tokens, line.start, end, sentenceFor(lesson, line.paragraphIndex, line.start).translation);
    return fitTranslation(aligned, maxWidth);
  }

  function captureTheaterLine() {
    const root = textRef.current;
    const scope = mode === "sentence" ? root?.querySelector(".sentence-original") : root;
    const words = scope ? [...scope.querySelectorAll("[data-word-id]")] : [];
    const bounds = scope?.getBoundingClientRect();
    let chosen = [];
    if (words.length && bounds) {
      const visible = words.filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.bottom > bounds.top + 1 && rect.top < bounds.bottom - 1;
      });
      const pool = visible.length ? visible : words;
      const top = Math.min(...pool.map((el) => el.getBoundingClientRect().top));
      chosen = pool.filter((el) => Math.abs(el.getBoundingClientRect().top - top) < 8);
    }
    let paragraphIndex = 0;
    let start = 0;
    let end = 0;
    if (chosen.length) {
      const first = chosen[0].dataset.wordId.split("-").map(Number);
      const last = chosen[chosen.length - 1].dataset.wordId.split("-").map(Number);
      paragraphIndex = first[0];
      start = first[1];
      end = last[1] + 1;
      const tokens = lesson[paragraphIndex];
      if (tokens?.[end]?.type === "text") end += 1;
    } else {
      const tokens = lesson[0] || [];
      let chars = 0;
      for (const token of tokens) {
        chars += token.value.length;
        end += 1;
        if (chars > 72) break;
      }
    }
    return { paragraphIndex, start, end };
  }

  function toggleTheater() {
    if (theater) {
      runTheater(() => setTheater(false));
      return;
    }
    const line = captureTheaterLine();
    runTheater(() => {
      setTheaterLine(line);
      setPlayerMenu(false);
      setMedia("video");
      setPlayerShown(true);
      setPlayerOpen(true);
      setTheater(true);
    });
  }

  useLayoutEffect(() => {
    if (!theater || !theaterLine) return undefined;
    const node = textRef.current;
    if (!node) return undefined;
    function fit() {
      const caption = node.querySelector(".theater-caption");
      const measure = node.querySelector(".theater-measure");
      const pieces = measure ? [...measure.querySelectorAll("[data-token-index]")] : [];
      const maxWidth = caption?.clientWidth || 0;
      if (!maxWidth || !pieces.length) return;
      const origin = pieces[0].getBoundingClientRect().left;
      let end = theaterLine.start;
      for (const el of pieces) {
        if (el.getBoundingClientRect().right - origin <= maxWidth + 0.5) end = Number(el.dataset.tokenIndex) + 1;
        else break;
      }
      const tokens = lesson[theaterLine.paragraphIndex] || [];
      while (end > theaterLine.start + 1 && tokens[end - 1]?.type === "text" && !/\S/.test(tokens[end - 1].value)) end -= 1;
      const next = { end, translation: theaterTranslation(theaterLine, end, maxWidth) };
      setTheaterView((current) => (
        current && current.end === next.end && current.translation === next.translation ? current : next
      ));
    }
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    return () => observer.disconnect();
  }, [theater, theaterLine, lesson]);

  function openFinishPrompt() {
    if (hideFinishPrompt) return;
    setFinishDismiss(false);
    setFinishPrompt(true);
  }

  function confirmFinish() {
    if (finishDismiss) setHideFinishPrompt(true);
    setFinishPrompt(false);
  }

  useEffect(() => {
    if (!reviewMenu) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".vocab-menu") || event.target.closest?.(".vocab-split-menu")) return;
      setReviewMenu(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setReviewMenu(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [reviewMenu]);

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
    if (!demoSettings) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".demo-settings")) return;
      setDemoSettings(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setDemoSettings(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [demoSettings]);

  useEffect(() => {
    if (!chromeMenu) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".chrome-menu") || event.target.closest?.(".chrome-menu-anchor") || event.target.closest?.(".reader-menu") || event.target.closest?.(".theme-menu")) return;
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
    if (!playMenu) return undefined;
    function onPointerDown(event) {
      if (event.target.closest?.(".play-split")) return;
      setPlayMenu(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setPlayMenu(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [playMenu]);

  useEffect(() => {
    if (!pageModePrompt) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setPageModePrompt(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pageModePrompt]);

  useEffect(() => {
    if (!finishPrompt) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setFinishPrompt(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [finishPrompt]);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;

    const place = () => {
      const player = footer.querySelector(":scope > .audio-player");
      const nav = footer.querySelector(":scope > .floating-nav");
      const clear = () => {
        footer.style.removeProperty("--nav-shift");
        footer.style.removeProperty("--player-max");
      };
      if (!player || !nav || getComputedStyle(nav).display === "none") {
        clear();
        return;
      }

      if (!player.dataset.naturalWidth) {
        const applied = footer.style.getPropertyValue("--player-max");
        footer.style.setProperty("--player-max", "none");
        player.dataset.naturalWidth = String(player.getBoundingClientRect().width);
        if (applied) footer.style.setProperty("--player-max", applied);
        else footer.style.removeProperty("--player-max");
      }

      const natural = Number(player.dataset.naturalWidth);
      const footerBox = footer.getBoundingClientRect();
      const playerLeft = player.getBoundingClientRect().left;
      const navWidth = nav.getBoundingClientRect().width;
      const lynx = footer.querySelector(":scope > .lynx-control");
      const rightEdge = lynx && getComputedStyle(lynx).display !== "none"
        ? lynx.getBoundingClientRect().left
        : footerBox.right - parseFloat(getComputedStyle(footer).paddingRight);
      const centeredLeft = footerBox.left + (footerBox.width - navWidth) / 2;
      const minNavLeft = playerLeft + natural + 16;
      const maxNavLeft = rightEdge - 16 - navWidth;

      let navLeft = centeredLeft;
      let playerWidth = natural;
      if (minNavLeft > centeredLeft + 0.5) {
        if (minNavLeft <= maxNavLeft) {
          navLeft = minNavLeft;
        } else {
          navLeft = Math.max(centeredLeft, maxNavLeft);
          playerWidth = Math.min(natural, navLeft - 16 - playerLeft);
        }
      }

      const shift = Math.max(0, Math.ceil(navLeft - centeredLeft - 0.5));
      const shiftValue = shift ? `${shift}px` : "";
      const maxValue = playerWidth < natural - 0.5 ? `${Math.floor(playerWidth)}px` : "";
      if ((footer.style.getPropertyValue("--nav-shift") || "") !== shiftValue) {
        if (shiftValue) footer.style.setProperty("--nav-shift", shiftValue);
        else footer.style.removeProperty("--nav-shift");
      }
      if ((footer.style.getPropertyValue("--player-max") || "") !== maxValue) {
        if (maxValue) footer.style.setProperty("--player-max", maxValue);
        else footer.style.removeProperty("--player-max");
      }
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(footer);
    const nav = footer.querySelector(":scope > .floating-nav");
    const player = footer.querySelector(":scope > .audio-player");
    const lynx = footer.querySelector(":scope > .lynx-control");
    if (nav) observer.observe(nav);
    if (player) observer.observe(player);
    if (lynx) observer.observe(lynx);
    return () => {
      observer.disconnect();
      footer.style.removeProperty("--nav-shift");
      footer.style.removeProperty("--player-max");
    };
  }, [playing, playerShown, playerOpen, mode, lynxOpen]);

  function runNamedMotion(className, counter, update) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) {
      update();
      return;
    }
    counter.current += 1;
    document.documentElement.classList.add(className);
    const finish = () => {
      counter.current -= 1;
      if (counter.current <= 0) {
        counter.current = 0;
        document.documentElement.classList.remove(className);
      }
    };
    try {
      const vt = document.startViewTransition(() => {
        flushSync(update);
      });
      vt.finished.then(finish, finish);
    } catch {
      finish();
      update();
    }
  }

  function runTheater(update) {
    runNamedMotion("theater-motion", theaterMotion, update);
  }

  function runSplit(update) {
    runNamedMotion("split-motion", splitMotion, update);
  }

  function toggleSplit() {
    runSplit(() => setSideBySide((on) => !on));
  }

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

  function startPlayback(kind) {
    const asVideo = kind !== "audio" && lessonHasVideo;
    transition(() => {
      setPlayMenu(false);
      setMedia(asVideo ? "video" : "audio");
      if (asVideo && mode === "page") setMode("scroll");
      setPlayerShown(true);
      setPlaying(true);
    });
  }

  function chooseLessonType(next) {
    if (next === lessonType) return;
    transition(() => {
      setLessonType(next);
      setPlayMenu(false);
      setPlayerMenu(false);
      setPlayerOpen(false);
      setPlayerShown(false);
      setPlaying(false);
      setTheater(false);
      setMedia(next === "audio" ? "audio" : "video");
    });
  }

  useEffect(() => {
    if (!playerShown) return undefined;
    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      if (modeMenu || reviewMenu || playerMenu || playMenu || chromeMenu || demoSettings || pageModePrompt || finishPrompt || phrasePick || active || termMenu || reviewCard || reviewOpen || lynxOpen) return;
      if (theater) {
        runTheater(() => setTheater(false));
        return;
      }
      dismissPlayer();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [playerShown, theater, modeMenu, reviewMenu, playerMenu, playMenu, chromeMenu, demoSettings, pageModePrompt, finishPrompt, phrasePick, active, termMenu, reviewCard, reviewOpen, lynxOpen]);

  function openLynx() {
    transition(() => {
      if (mobile) setReviewOpen(false);
      setLynxOpen(true);
    });
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

  function highlightSentenceTerm(paragraphIndex, tokenIndex) {
    if (mode !== "sentence" || paragraphIndex !== sentenceIndex) return;
    const phrase = savedPhrases.find((item) => phraseCovers(item, paragraphIndex, tokenIndex));
    if (phrase) {
      if (phrase.kind !== "lingq" || phrase.level < 1 || phrase.level > 3) return;
      setTermPulse({ key: `phrase-${phrase.id}`, id: Date.now() });
      return;
    }
    const token = lesson[paragraphIndex]?.[tokenIndex];
    if (!token || token.type !== "word") return;
    const inTicker = (token.kind === "lingq" && token.level >= 1 && token.level <= 3) || token.kind === "new";
    if (!inTicker) return;
    setTermPulse({ key: `word-${paragraphIndex}-${tokenIndex}`, id: Date.now() });
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
    const panelShowsList = sidePanel && reviewOpen;
    if (saved) {
      if (active?.phrase?.savedId === saved.id && !panelShowsList) {
        if (sidePanel) {
          setActive((current) => (current ? { ...current, size: "small" } : current));
          setShowMini((open) => !open);
          highlightSentenceTerm(paragraphIndex, tokenIndex);
        } else setActive(null);
        return;
      }
      openSaved(saved, paragraphIndex, tokenIndex, "small");
      highlightSentenceTerm(paragraphIndex, tokenIndex);
      if (sidePanel) {
        setReviewOpen(false);
        setShowMini(true);
      }
      return;
    }
    const closing = active
      && !active.phrase
      && active.paragraphIndex === paragraphIndex
      && active.tokenIndex === tokenIndex;
    if (closing && !panelShowsList) {
        if (sidePanel) {
          setActive((current) => (current ? { ...current, size: "small", mode: "meaning", statusMenu: false } : current));
          setShowMini((open) => !open);
          highlightSentenceTerm(paragraphIndex, tokenIndex);
        } else setActive(null);
        return;
      }
    createLingQ(paragraphIndex, tokenIndex);
    setActive({ paragraphIndex, tokenIndex, size: "small", mode: "meaning", statusMenu: false });
    highlightSentenceTerm(paragraphIndex, tokenIndex);
    if (sidePanel) {
      setReviewOpen(false);
      setShowMini(true);
    }
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
        highlightSentenceTerm(paragraphIndex, tokenIndex);
        return;
      }
      createLingQ(paragraphIndex, tokenIndex);
      setActive({
        paragraphIndex,
        tokenIndex,
        size: "medium",
        mode: "meaning",
        statusMenu: false,
      });
      highlightSentenceTerm(paragraphIndex, tokenIndex);
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

  function changeReviewStatus(item, status) {
    if (item.phraseId) {
      const phrase = savedPhrases.find((entry) => entry.id === item.phraseId);
      changeTermStatus(phrase?.start?.paragraphIndex ?? 0, phrase?.start?.tokenIndex ?? 0, status, item.phraseId);
      return;
    }
    const appearance = STATUS_APPEARANCE[status];
    const key = item.term.toLowerCase();
    const previous = [];
    lesson.forEach((paragraph, paragraphIndex) => {
      paragraph.forEach((token, tokenIndex) => {
        if (token.type !== "word" || token.value.toLowerCase() !== key) return;
        previous.push({
          paragraphIndex,
          tokenIndex,
          status: token.status,
          kind: token.kind,
          level: token.level ?? null,
          meaning: token.meaning,
        });
      });
    });
    if (!previous.length) return;
    const unchanged = previous.every((token) => (
      token.status === status
      && token.kind === appearance.kind
      && (token.level ?? null) === (appearance.level ?? null)
    ));
    if (unchanged) return;
    setLesson((current) => current.map((paragraph) => paragraph.map((token) => {
      if (token.type !== "word" || token.value.toLowerCase() !== key) return token;
      return { ...token, status, ...appearance };
    })));
    showSnackbar(status, () => {
      setLesson((current) => current.map((paragraph, paragraphIndex) => paragraph.map((token, tokenIndex) => {
        const match = previous.find((entry) => entry.paragraphIndex === paragraphIndex && entry.tokenIndex === tokenIndex);
        return match
          ? { ...token, status: match.status, kind: match.kind, level: match.level, meaning: match.meaning }
          : token;
      })));
    });
  }

  function openTerm(paragraphIndex, tokenIndex, phrase) {
    setTermMenu(null);
    if (phrase) openSaved(phrase, paragraphIndex, tokenIndex, "large");
    else setActive({ paragraphIndex, tokenIndex, size: "large", mode: "meaning", statusMenu: false });
    if (sidePanel) {
      setReviewOpen(false);
      setShowMini(false);
    }
  }

  function openLarge() {
    setActive((current) => (current ? { ...current, size: "large", statusMenu: false } : current));
  }

  function chooseReviewAction(action) {
    setReviewMenu(false);
    if (action === "list") {
      setReviewCard(null);
      setReviewOpen(true);
      if (mobile) setLynxOpen(false);
      else setSidePanel(true);
      return;
    }
    if (REVIEW_CARDS[action]) {
      setReviewCard(action);
      if (reviewOpen) collapseSidePanel();
    }
  }

  function startDefaultReview() {
    if (mode === "scroll") {
      chooseReviewAction("list");
      return;
    }
    chooseReviewAction(mode === "sentence" ? "sentence" : "page");
  }

  function toggleSidePanel() {
    if (sidePanel) {
      setSidePanel(false);
      return;
    }
    if (!mobile && active?.size === "large") {
      setReviewOpen(false);
      setSidePanel(true);
      return;
    }
    setReviewOpen(true);
    if (mobile) setLynxOpen(false);
    else setSidePanel(true);
  }

  function collapseSidePanel() {
    setReviewOpen(false);
    if (!sidePanel) return;
    setSidePanel(false);
    setShowMini(false);
    setActive(null);
  }

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1024px)");
    function closeIfNarrow() {
      if (query.matches) collapseSidePanel();
    }
    query.addEventListener("change", closeIfNarrow);
    return () => query.removeEventListener("change", closeIfNarrow);
  }, [sidePanel, reviewOpen]);

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
  const showVideo = lessonHasVideo && media === "video" && playerShown && (theater || mode !== "page");
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
    if (token.type !== "word") return <span key={tokenIndex} data-token-index={tokenIndex}>{token.value}</span>;
    const picking = phrasePick?.paragraphIndex === paragraphIndex && phrasePick?.tokenIndex === tokenIndex;
    const open = active?.paragraphIndex === paragraphIndex && active?.tokenIndex === tokenIndex;
    return (
      <span
        key={tokenIndex}
        className={`${wordClassName(token)}${open ? " is-open" : ""}${picking ? " is-phrase-anchor" : ""}`}
        data-token-index={tokenIndex}
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

  function renderSlice(paragraphIndex, start, end) {
    const tokens = lesson[paragraphIndex] || [];
    const nodes = [];
    let tokenIndex = start;
    const last = Math.min(end, tokens.length);
    while (tokenIndex < last) {
      const mark = markAt(paragraphIndex, tokenIndex);
      if (!mark) {
        nodes.push(renderToken(tokens[tokenIndex], paragraphIndex, tokenIndex));
        tokenIndex += 1;
        continue;
      }
      const chunk = [];
      const { key, kind, level } = mark;
      const chunkStart = tokenIndex;
      while (tokenIndex < last) {
        const next = markAt(paragraphIndex, tokenIndex);
        if (!next || next.key !== key) break;
        chunk.push(renderToken(tokens[tokenIndex], paragraphIndex, tokenIndex));
        tokenIndex += 1;
      }
      nodes.push(
        <span
          key={`${key}-${chunkStart}`}
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

  const showFinish = (mode === "sentence" && sentenceIndex >= lesson.length - 1)
    || (mode === "page" && pageStarts !== null && pageIndex >= pageStarts.length - 1);

  return (
    <div className={`reader${theater ? " is-theater" : ""}`}>
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

            <button type="button" className="status-pill language-pill">
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
        <div className="reader-stage-main">
        <div className="reader-chrome">
          <div className="progress" aria-hidden="true">
            <div className="progress-track" />
            <div className="progress-fill" />
          </div>
          <button type="button" className="icon-button chrome-exit" aria-label="Exit lesson">
            <LogOut className="chrome-exit-icon" size={24} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
          <div className="chrome-actions">
            <span className="chrome-menu-anchor">
              <button type="button" className="icon-button" aria-label="Text settings" aria-expanded={chromeMenu === "theme"} onClick={() => setChromeMenu((current) => (current === "theme" ? null : "theme"))}>
                <CaseSensitive size={24} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
              {chromeMenu === "theme" ? (
                <ThemeMenu theme={theme} onTheme={setTheme} font={fontStyle} onFont={setFontStyle} onClose={() => setChromeMenu(null)} />
              ) : null}
            </span>
            <span className="chrome-menu-anchor">
              <button type="button" className="icon-button" aria-label="More options" aria-expanded={chromeMenu === "more"} onClick={() => setChromeMenu((current) => (current === "more" ? null : "more"))}>
                <EllipsisVertical size={24} strokeWidth={1.5} absoluteStrokeWidth />
              </button>
              {chromeMenu === "more" ? (
                <ReaderOptionsMenu
                  mode={mode}
                  showTranslation={showTranslation}
                  onToggleTranslation={() => setShowTranslation((open) => !open)}
                  onOpenDemo={() => {
                    setChromeMenu(null);
                    setDemoSettings(true);
                  }}
                  onClose={() => setChromeMenu(null)}
                />
              ) : null}
            </span>
            {sidePanel || reviewOpen ? null : (
            <button type="button" className="icon-button panel-button" aria-label="Open side panel" onClick={toggleSidePanel}>
              <PanelRight size={24} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            )}
          </div>
        </div>

        <div className={`lesson-area${mode === "page" ? "" : ` is-${mode}`}${showVideo ? " has-video" : ""}${showVideo && sideBySide && !theater ? " is-side" : ""}`}>
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
          {showVideo ? (
            <div className={`lesson-video${playing ? "" : " is-paused"}`}>
              <img src={videoDefault} alt="" />
              <img className="is-active" src={videoActive} alt="" />
            </div>
          ) : null}
          <article className="page-text" lang="de" ref={textRef}>
            {theater && theaterLine ? (
              <div className="theater-caption">
                <p className="theater-line theater-measure" aria-hidden="true">
                  {renderSlice(theaterLine.paragraphIndex, theaterLine.start, theaterLine.end)}
                </p>
                <p className="theater-line">
                  {renderSlice(theaterLine.paragraphIndex, theaterLine.start, theaterView?.end ?? theaterLine.end)}
                  <span className="theater-scan" aria-hidden="true" />
                </p>
                {showTranslation && theaterView?.translation ? <p className="theater-translation">{theaterView.translation}</p> : null}
              </div>
            ) : null}
            {theater ? null : mode === "scroll" || (showVideo && mode === "sentence") ? <div className="video-text-fade" aria-hidden="true" /> : null}
            {theater || mode !== "sentence" ? null : (
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
                <div className="sentence-terms" ref={termsRef}>
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
                          data-term-key={menuKey}
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
                        key={menuKey}
                        data-term-key={menuKey}
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
            )}
            {theater || mode === "sentence" ? null : (() => {
              const pageSource = lesson.slice(0, PAGE_COUNT);
              const paragraphs = mode === "scroll" ? lesson : pageSource;
              const pageOffset = mode === "page" ? (pageStarts?.[pageIndex] ?? 0) : 0;
              const pageEnd = mode === "page" ? pageStarts?.[pageIndex + 1] : undefined;
              return (
              <div
                className="page-flow"
                style={mode === "page" && pageEnd != null ? { height: pageEnd - pageOffset, overflow: "hidden" } : undefined}
              >
              <div
                className="page-flow-shift"
                style={mode === "page" ? { transform: `translateY(-${pageOffset}px)` } : undefined}
              >
              {paragraphs.map((tokens, listIndex) => {
              const paragraphIndex = listIndex;
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
            })}
              </div>
              </div>
              );
            })()}
            {theater || mode !== "scroll" ? null : (
              <button type="button" className={`finish-lesson${atScrollEnd ? " is-visible" : ""}`} onClick={openFinishPrompt}>
                <CircleCheck size={16} strokeWidth={1.36} absoluteStrokeWidth />
                Finish Lesson
              </button>
            )}
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
              className={`page-button${showFinish ? " is-finish" : ""}`}
              aria-label={showFinish ? "Finish lesson" : mode === "sentence" ? "Next sentence" : "Next page"}
              onClick={() => {
                if (showFinish) {
                  openFinishPrompt();
                  return;
                }
                if (mode === "sentence") setSentenceIndex((index) => Math.min(lesson.length - 1, index + 1));
                if (mode === "page") setPageIndex((index) => Math.min((pageStarts?.length ?? 1) - 1, index + 1));
              }}
            >
              {showFinish ? (
                <CircleCheck size={16} strokeWidth={1.36} absoluteStrokeWidth />
              ) : (
                <ChevronRight size={16} strokeWidth={1.36} absoluteStrokeWidth />
              )}
            </button>
          </div>
          {reviewCard ? (
            <div className="review-card-layer">
              <div className="review-card" role="dialog" aria-modal="true" aria-labelledby="review-card-title">
                <button type="button" className="review-card-close" aria-label="Close review" onClick={() => setReviewCard(null)}>
                  <X size={16} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
                <p id="review-card-title">{REVIEW_CARDS[reviewCard]}</p>
              </div>
            </div>
          ) : null}
        </div>
        </div>
        {(sidePanel && activeToken) || (lynxOpen && !mobile) || (reviewOpen && !mobile) ? (
          <aside className={`side-panel${lynxOpen && !playerOpen ? " is-anchored" : ""}${lynxOpen && ((sidePanel && activeToken) || (reviewOpen && !mobile)) ? " is-split" : ""}`}>
            {reviewOpen && !mobile ? (
              <ReviewPanel
                terms={reviewTermsFrom(lesson, savedPhrases)}
                onStatus={changeReviewStatus}
                onClose={collapseSidePanel}
                onReview={startDefaultReview}
              />
            ) : sidePanel && activeToken ? (
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
            {lynxOpen && !mobile ? <LynxChat onClose={closeLynx} /> : null}
          </aside>
        ) : null}
        {reviewOpen && mobile ? createPortal(
          <div className="review-sheet" role="dialog" aria-label="Vocabulary">
            <PlayerDragHandle label="Close vocabulary" onDragDown={() => setReviewOpen(false)} />
            <ReviewPanel
              terms={reviewTermsFrom(lesson, savedPhrases)}
              onStatus={changeReviewStatus}
              onClose={() => setReviewOpen(false)}
              onReview={startDefaultReview}
              sheet
            />
          </div>,
          document.body,
        ) : null}
        {lynxOpen && mobile ? createPortal(
          <div className="review-sheet lynx-sheet" role="dialog" aria-label="Lynx AI">
            <PlayerDragHandle label="Close Lynx" onDragDown={closeLynx} />
            <LynxChat onClose={closeLynx} sheet />
          </div>,
          document.body,
        ) : null}
        </div>
      </main>

      <footer ref={footerRef} className={`reader-footer${playerOpen ? " is-player-open" : ""}`}>
        {playerOpen ? (
          <div className="audio-bar" role="group" aria-label="Lesson audio">
            <PlayerDragHandle label="Collapse player" onDragDown={collapsePlayer} />
            <AudioTimeline
              time={audioTime}
              duration={AUDIO_DURATION}
              scrubbing={scrubbing}
              onScrub={setAudioTime}
              onScrubbing={setScrubbing}
            />
            <div className="audio-bar-row">
              <div className="audio-bar-transport">
                <button type="button" className="audio-bar-control audio-bar-back" aria-label="Back 5 seconds">
                  <img src={skipBackIcon} alt="" width={20} height={20} />
                </button>
                <button type="button" className="audio-bar-pause" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlayback(!playing)}>
                  {playing ? <Pause size={24} strokeWidth={1.5} absoluteStrokeWidth /> : <Play size={24} strokeWidth={1.5} absoluteStrokeWidth />}
                </button>
                <button type="button" className="audio-bar-control audio-bar-forward" aria-label="Forward 5 seconds">
                  <img src={skipForwardIcon} alt="" width={20} height={20} />
                </button>
                <button type="button" className="audio-bar-control audio-bar-repeat" aria-label="Repeat">
                  <Repeat2 size={20} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
                <span className="audio-bar-time">
                  <span className="audio-bar-time-current">{formatAudioTime(audioTime)}</span>
                  <span className="audio-bar-time-sep">/</span>
                  <span className="audio-bar-time-total">{formatAudioTime(AUDIO_DURATION)}</span>
                </span>
              </div>
              <div className="audio-bar-secondary">
                <div className="audio-bar-actions">
                  {lessonHasVideo && !theater ? (
                    <button type="button" className={`audio-bar-control audio-bar-layout${sideBySide ? " is-on" : ""}`} aria-label="Split view" aria-pressed={sideBySide} onClick={toggleSplit}>
                      <Columns2 size={20} strokeWidth={1.5} absoluteStrokeWidth />
                    </button>
                  ) : null}
                  {lessonHasVideo ? (
                    <button type="button" className={`audio-bar-control audio-bar-theater${theater ? " is-on" : ""}`} aria-label={theater ? "Exit theater mode" : "Theater mode"} aria-pressed={theater} onClick={toggleTheater}>
                      {theater ? <Minimize size={20} strokeWidth={1.5} absoluteStrokeWidth /> : <Maximize size={20} strokeWidth={1.5} absoluteStrokeWidth />}
                    </button>
                  ) : null}
                  <button type="button" className="audio-bar-speed" aria-label="Playback speed">1x</button>
                  <span className="player-menu-anchor">
                    <button type="button" className="audio-bar-control" aria-label="More audio options" aria-expanded={playerMenu} onClick={() => setPlayerMenu((open) => !open)}>
                      <EllipsisVertical size={20} strokeWidth={1.5} absoluteStrokeWidth />
                    </button>
                    {playerMenu ? (
                      <PlayerOptionsMenu
                        autoAdvance={autoAdvance}
                        onAutoAdvance={() => setAutoAdvance((on) => !on)}
                        loopAudio={loopAudio}
                        onLoopAudio={() => setLoopAudio((on) => !on)}
                        onClose={() => setPlayerMenu(false)}
                      />
                    ) : null}
                  </span>
                </div>
                <span className="mode-anchor">
                  <button type="button" className="audio-bar-mode" aria-label="Reading mode" aria-expanded={modeMenu} onClick={() => { setReviewMenu(false); setModeMenu((open) => !open); }}>
                    {modeIcon(mode, 20)}
                    <ChevronsUpDown size={20} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
                  </button>
                  {modeMenu ? <ModeMenu mode={mode} onChoose={chooseMode} /> : null}
                </span>
                <button type="button" className="audio-bar-lynx" aria-label="Ask Lynx AI" onClick={openLynx}>
                  <img src={lynxIcon} alt="" width={20} height={20} />
                </button>
                <span className="audio-bar-divider audio-bar-tools-divider" aria-hidden="true" />
                <button type="button" className="audio-bar-control audio-bar-collapse" aria-label="Collapse player" onClick={collapsePlayer}>
                  <ChevronDown size={20} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
              </div>
            </div>
          </div>
        ) : playerShown ? (
          <div
            className="audio-player"
            role="group"
            aria-label="Lesson audio"
            onClick={(event) => {
              if (event.target.closest("button, .player-menu")) return;
              if (!window.matchMedia("(max-width: 767px)").matches) return;
              openPlayer();
            }}
          >
            <PlayerDragHandle label="Close player" onDragUp={openPlayer} onDragDown={dismissPlayer} />
            <div className="audio-player-main">
              <div className="audio-player-leading">
                <button type="button" className="audio-player-pause" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlayback(!playing)}>
                  {playing ? <Pause size={24} strokeWidth={1.5} absoluteStrokeWidth /> : <Play size={24} strokeWidth={1.5} absoluteStrokeWidth />}
                </button>
                <button type="button" className="audio-player-icon audio-player-back" aria-label="Replay 10 seconds">
                  <img src={replayIcon} alt="" width={20} height={20} />
                </button>
              </div>
              <div className="audio-player-tools">
                <button type="button" className="audio-player-icon audio-player-replay" aria-label="Replay 10 seconds">
                  <img src={replayIcon} alt="" width={20} height={20} />
                </button>
                <span className="mode-anchor audio-player-mode">
                  <button type="button" className="audio-bar-mode" aria-label="Reading mode" aria-expanded={modeMenu} onClick={() => { setReviewMenu(false); setModeMenu((open) => !open); }}>
                    {modeIcon(mode, 20)}
                    <ChevronsUpDown size={20} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
                  </button>
                  {modeMenu ? <ModeMenu mode={mode} onChoose={chooseMode} /> : null}
                </span>
                <button type="button" className="audio-player-icon audio-player-lynx" aria-label="Ask Lynx AI" onClick={openLynx}>
                  <img src={lynxIcon} alt="" width={20} height={20} />
                </button>
                <span className="player-menu-anchor">
                  <button type="button" className="audio-player-icon" aria-label="More audio options" aria-expanded={playerMenu} onClick={() => setPlayerMenu((open) => !open)}>
                    <EllipsisVertical size={20} strokeWidth={1.5} absoluteStrokeWidth />
                  </button>
                  {playerMenu ? (
                    <PlayerOptionsMenu
                      autoAdvance={autoAdvance}
                      onAutoAdvance={() => setAutoAdvance((on) => !on)}
                      loopAudio={loopAudio}
                      onLoopAudio={() => setLoopAudio((on) => !on)}
                      sideBySide={sideBySide}
                      onSideBySide={toggleSplit}
                      showLayout={lessonHasVideo}
                      theater={theater}
                      onTheater={toggleTheater}
                      onClose={() => setPlayerMenu(false)}
                    />
                  ) : null}
                </span>
                <span className="audio-player-divider" aria-hidden="true" />
                <button type="button" className="audio-player-icon audio-player-expand" aria-label="Expand player" onClick={openPlayer}>
                  <ChevronRight size={20} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
                <button type="button" className="audio-player-icon audio-player-close" aria-label={lessonHasVideo && media === "video" ? "Dismiss video" : "Dismiss audio"} onClick={dismissPlayer}>
                  <X size={16} strokeWidth={1.5} absoluteStrokeWidth />
                </button>
              </div>
            </div>
            <div className="audio-player-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        ) : lessonType === "both" ? (
          <span className="play-split">
            <button type="button" className="play-button" aria-label={media === "audio" ? "Play audio" : "Play video"} onClick={() => startPlayback(media === "audio" ? "audio" : "video")}>
              {media === "audio"
                ? <Play size={24} strokeWidth={1.5} absoluteStrokeWidth />
                : <Youtube size={24} strokeWidth={1.5} absoluteStrokeWidth />}
            </button>
            <span className="play-split-divider" aria-hidden="true" />
            <button
              type="button"
              className="play-split-chevron"
              aria-label="Playback options"
              aria-haspopup="menu"
              aria-expanded={playMenu}
              onClick={() => setPlayMenu((open) => !open)}
            >
              <ChevronDown size={20} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            {playMenu ? (
              <div className="play-split-menu" role="menu">
                {media === "audio" ? (
                  <button type="button" role="menuitem" onClick={() => startPlayback("video")}>
                    <Youtube size={16} strokeWidth={1.5} absoluteStrokeWidth />
                    Play video
                  </button>
                ) : (
                  <button type="button" role="menuitem" onClick={() => startPlayback("audio")}>
                    <Play size={16} strokeWidth={1.5} absoluteStrokeWidth />
                    Play audio
                  </button>
                )}
              </div>
            ) : null}
          </span>
        ) : (
          <button type="button" className="play-button" aria-label="Play" onClick={() => startPlayback(lessonHasVideo ? "video" : "audio")}>
            {lessonHasVideo
              ? <Youtube size={24} strokeWidth={1.5} absoluteStrokeWidth />
              : <Play size={24} strokeWidth={1.5} absoluteStrokeWidth />}
          </button>
        )}

        {playerOpen ? null : (
        <>
        <div className="floating-nav">
          <span className="mode-anchor">
            <button type="button" className="mode-selector" aria-expanded={modeMenu} onClick={() => { setReviewMenu(false); setModeMenu((open) => !open); }}>
              {modeIcon(mode)}
              <span>{MODES.find((item) => item.id === mode)?.label}</span>
              <ChevronsUpDown size={20} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
            </button>
            {modeMenu ? <ModeMenu mode={mode} onChoose={chooseMode} /> : null}
          </span>
          <span className="nav-divider" aria-hidden="true" />
          <span className="vocab-split">
            <button type="button" className="vocab-button" aria-label="Vocabulary" onClick={startDefaultReview}>
              <img src={reviewIcon} alt="" width={24} height={24} />
            </button>
            <span className="vocab-split-divider" aria-hidden="true" />
            <button type="button" className="vocab-split-menu" aria-label="Review actions" aria-haspopup="menu" aria-expanded={reviewMenu} onClick={() => { setModeMenu(false); setReviewMenu((open) => !open); }}>
              <ChevronDown size={20} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
            {reviewMenu ? <ReviewActionsMenu onChoose={chooseReviewAction} /> : null}
          </span>
        </div>

        {lynxOpen ? null : (
        <form className="lynx-control" onClick={openLynx} onSubmit={(event) => { event.preventDefault(); openLynx(); }}>
          <input type="text" placeholder="Ask Lynx AI ..." aria-label="Ask Lynx AI" readOnly />
          <button type="submit" className="lynx-button" aria-label="Ask Lynx AI">
            <img src={lynxIcon} alt="" width={24} height={24} />
          </button>
        </form>
        )}
        </>
        )}
      </footer>

      {finishPrompt ? (
        <div className="mode-dialog-backdrop" onClick={() => setFinishPrompt(false)}>
          <div
            className="finish-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="finish-lesson-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="finish-dialog-copy">
              <p id="finish-lesson-title">Finish this Lesson?</p>
              <p>Confirm to wrap up this lesson and view your learning stats.</p>
            </div>
            <div className="finish-dialog-actions">
              <button type="button" className="finish-dialog-cancel" onClick={() => setFinishPrompt(false)}>Cancel</button>
              <button type="button" className="finish-dialog-confirm" onClick={confirmFinish}>Finish Lesson</button>
            </div>
            <label className="finish-dialog-dismiss">
              Don’t show this again
              <input
                type="checkbox"
                checked={finishDismiss}
                onChange={(event) => setFinishDismiss(event.target.checked)}
              />
            </label>
          </div>
        </div>
      ) : null}

      {demoSettings ? (
        <DemoSettings
          lessonType={lessonType}
          onLessonType={chooseLessonType}
          onClose={() => setDemoSettings(false)}
        />
      ) : null}

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

      {reviewCard ? <div className="review-scrim" aria-hidden="true" /> : null}
    </div>
  );
}
