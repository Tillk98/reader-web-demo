import { Children, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Check, Info, Mic, RefreshCw, Square, Volume2, X } from "lucide-react";
import StatusButton, { WORD_BAR_STATUSES } from "./StatusButton.jsx";
import { ScopeFilterButton } from "./ReviewPanel.jsx";

const WORDS = [
  {
    word: "Zeit",
    meaning: "time",
    status: "New",
    sentence: "Also der erste, würde ich sagen, ist erst mal die Zeit.",
    translation: "So the first thing, I would say, is the time.",
    tags: ["Noun"],
  },
  {
    word: "Sprache",
    meaning: "language",
    status: "Recognized",
    sentence: "Ja, natürlich, wenn du vorhast, wirklich eine Sprache gut zu lernen.",
    translation: "Yes, of course, when you plan to really learn a language well.",
    tags: ["Noun"],
  },
  {
    word: "Minuten",
    meaning: "minutes",
    status: "Familiar",
    sentence: "Wenn du jetzt sowieso maximal jeden Tag 15 Minuten zur Verfügung hast.",
    translation: "If you only have a maximum of 15 minutes available each day anyway.",
    tags: ["Noun"],
  },
  {
    word: "Fortschritte",
    meaning: "progress",
    status: "New",
    sentence: "Es ist auch möglich, dass du in keiner Sprache wirklich gute Fortschritte machst.",
    translation: "It's also possible that you don't make really good progress in any language.",
    tags: ["Noun"],
  },
  {
    word: "Sprachen",
    meaning: "languages",
    status: "Recognized",
    sentence: "Welche Sprachen hast du denn vor zu lernen?",
    translation: "Which languages are you planning to learn?",
    tags: ["Noun"],
  },
];

const CARD_ACTIVITIES = ["flashcard", "reverse", "cloze", "choice", "dictation"];
const SENTENCE_ACTIVITIES = ["matching", "flashcard", "unscramble", "speaking"];

const UNSCRAMBLE_CHUNKS = ["Das", "würde", "ich", "nicht", "empfehlen."];
const UNSCRAMBLE_SHUFFLED = ["empfehlen.", "ich", "Das", "nicht", "würde"];
const CORRECT_HOLD = 1500;
const UNSCRAMBLE_SENTENCE = "Das würde ich nicht empfehlen.";
const UNSCRAMBLE_TRANSLATION = "I wouldn't recommend that.";

const MEANING_CHOICES = ["progress", "time", "language", "minutes"];

function activitiesFor(kind, words) {
  const types = kind === "sentence" ? SENTENCE_ACTIVITIES : CARD_ACTIVITIES;
  return types.slice(0, words.length).map((type, index) => ({ type, word: words[index] }));
}

function uniqueChoices(correct, others, limit = 4) {
  const list = [];
  [correct, ...others].forEach((choice) => {
    if (!choice || list.length >= limit) return;
    if (list.some((item) => item.toLocaleLowerCase() === choice.toLocaleLowerCase())) return;
    list.push(choice);
  });
  return list;
}

function ReviewInProgress({ index, total, done }) {
  const completed = done ? total : index;
  const left = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="review-session-hold">
      <p className="review-session-hold-label">
        {done ? "Review Complete" : "Review in Progress"}
        {done ? <span className="review-session-hold-result"> • You can do better! 🤨</span> : null}
      </p>
      <div className="review-session-hold-completion">
        <div className="review-session-hold-top">
          <p className="review-session-hold-percent">{percent}% Complete</p>
          <span className="review-session-hold-count">{left} / {total} Cards Left</span>
        </div>
        <div className="review-session-track" aria-hidden="true">
          <div style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function ReviewSession({ kind, title, words = [], hidden = false, compact = false, onClose, onFilter, filterAnchorRef = null, scopeLabel = "Page", filterExtra = 0, filterCompact = false, filterOpen = false }) {
  const activities = useMemo(() => activitiesFor(kind, words), [kind, words]);
  const steps = activities.map((item) => item.type);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("ask");
  const [status, setStatus] = useState(words[0]?.status || "New");
  const [selected, setSelected] = useState(null);
  const [picked, setPicked] = useState([]);
  const [pool, setPool] = useState(UNSCRAMBLE_SHUFFLED);
  const [matched, setMatched] = useState([]);
  const [armed, setArmed] = useState(null);
  const [wrongPair, setWrongPair] = useState(false);
  const [typed, setTyped] = useState("");
  const [speech, setSpeech] = useState("idle");
  const [miss, setMiss] = useState([]);
  const missTimer = useRef(0);
  const done = words.length > 0 && index >= steps.length;
  const step = steps[index];
  const word = activities[Math.min(index, Math.max(steps.length - 1, 0))]?.word;

  useEffect(() => {
    if (word) setStatus(word.status);
  }, [word]);

  useEffect(() => () => window.clearTimeout(missTimer.current), []);

  const commitRef = useRef(() => {});
  commitRef.current = () => {
    if (done) return;
    if (phase === "result") {
      if (step === "unscramble" && picked.join(" ") === UNSCRAMBLE_SENTENCE) return;
      goNext();
      return;
    }
    if (step === "flashcard" || step === "reverse") {
      if (phase === "back") goNext();
      else setPhase("back");
      return;
    }
    if ((step === "cloze" || step === "choice") && selected) grade();
    else if (step === "dictation" && typed.trim()) grade();
    else if (step === "unscramble" && pool.length === 0 && phase !== "result") submitUnscramble();
    else if (step === "speaking") {
      if (speech === "rated") goNext();
      else setSpeech(speech === "recording" ? "rated" : "recording");
    }
  };

  useEffect(() => {
    if (hidden) return undefined;
    function onKeyDown(event) {
      if (event.key !== "Enter" || event.repeat || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("input, textarea, select, [role='menu']")) return;
      const control = target.closest(".review-session-quiet, .review-session-wrong, .review-session-right, .review-session-primary, .review-session-secondary, .review-session-record, .review-session-affordance, .review-session-choice");
      if (control && !control.matches(":disabled")) return;
      event.preventDefault();
      commitRef.current();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hidden]);

  function reviewAgain() {
    setIndex(0);
    setPhase("ask");
    setSelected(null);
    setPicked([]);
    setPool(UNSCRAMBLE_SHUFFLED);
    setMatched([]);
    setArmed(null);
    setWrongPair(false);
    setTyped("");
    setSpeech("idle");
    setMiss([]);
  }

  function goNext() {
    setIndex((current) => current + 1);
    setPhase("ask");
    setSelected(null);
    setPicked([]);
    setPool(UNSCRAMBLE_SHUFFLED);
    setMatched([]);
    setArmed(null);
    setWrongPair(false);
    setTyped("");
    setSpeech("idle");
    setMiss([]);
  }

  function grade() {
    setPhase("result");
  }

  function submitUnscramble() {
    setPhase("result");
  }

  function retryUnscramble() {
    setPicked([]);
    setPool(UNSCRAMBLE_SHUFFLED);
    setPhase("ask");
  }

  function chooseTile(tile) {
    if (matched.includes(tile.id) || wrongPair) return;
    if (!armed) {
      setArmed(tile);
      return;
    }
    if (armed.id === tile.id) {
      setArmed(null);
      return;
    }
    if (armed.pair === tile.pair && armed.side !== tile.side) {
      const next = [...matched, armed.id, tile.id];
      setMatched(next);
      setArmed(null);
      return;
    }
    setMiss([armed.id, tile.id]);
    setWrongPair(true);
    window.clearTimeout(missTimer.current);
    missTimer.current = window.setTimeout(() => {
      setWrongPair(false);
      setMiss([]);
      setArmed(null);
    }, 450);
  }

  const matchWords = words.slice(0, 3);
  const matchingTiles = matchWords.flatMap((item, itemIndex) => {
    const pair = String.fromCharCode(97 + itemIndex);
    return [
      { id: `w${itemIndex}`, pair, side: "word", label: item.word },
      { id: `m${itemIndex}`, pair, side: "meaning", label: item.meaning },
    ];
  });
  const matchingDone = matched.length === matchingTiles.length;

  useEffect(() => {
    if (step !== "matching" || !matchingDone) return undefined;
    const timer = window.setTimeout(goNext, CORRECT_HOLD);
    return () => window.clearTimeout(timer);
  }, [matchingDone, step]);

  const unscrambleSolved = step === "unscramble" && phase === "result" && picked.join(" ") === UNSCRAMBLE_SENTENCE;

  useEffect(() => {
    if (!unscrambleSolved) return undefined;
    const timer = window.setTimeout(goNext, CORRECT_HOLD);
    return () => window.clearTimeout(timer);
  }, [unscrambleSolved]);

  const clozeChoices = word ? uniqueChoices(word.word, [...words.map((item) => item.word), ...WORDS.map((item) => item.word)]) : [];
  const meaningChoices = word ? uniqueChoices(word.meaning, [...words.map((item) => item.meaning), ...MEANING_CHOICES]) : [];
  const feedback = answerFeedback();

  function answerFeedback() {
    if (done || phase !== "result") return null;
    if (step === "dictation") {
      const answer = typed.trim();
      return { correct: answer.toLocaleLowerCase() === word.word.toLocaleLowerCase(), answer };
    }
    if (step === "unscramble") {
      const answer = picked.join(" ");
      if (answer === UNSCRAMBLE_SENTENCE) return { correct: true };
      return { correct: false, answer };
    }
    if (step === "cloze" || step === "choice") {
      const expected = step === "cloze" ? word.word : word.meaning;
      return { correct: selected === expected, answer: selected };
    }
    return null;
  }

  const notice = feedback
    ? <AnswerFeedback correct={feedback.correct} answer={feedback.answer} />
    : step === "speaking" && speech === "rated"
      ? <SpeakingRating score={92} />
      : step === "matching" && matchingDone
        ? <AnswerFeedback correct />
        : null;
  const filterButton = (
    <ScopeFilterButton
      anchorRef={filterAnchorRef}
      compact={filterCompact}
      label={scopeLabel}
      extra={filterExtra}
      countPrefix=""
      expanded={filterOpen}
      onClick={onFilter}
    />
  );

  return (
    <section className={`review-session${hidden ? " is-hidden" : ""}${compact ? " is-compact" : ""}`} aria-hidden={hidden || undefined}>
      <h2 id="review-card-title" className="review-session-sr">{title}</h2>
      <div className="review-session-body">
        {compact ? (
          <ReviewInProgress index={index} total={steps.length} done={done} />
        ) : !words.length ? (
          <div className="review-session-lead">
            {filterButton}
            <p className="review-session-empty">No terms match this filter.</p>
          </div>
        ) : done ? null : (
          <div className="review-session-lead">
            <div className="review-session-progress">
              {filterButton}
              <div className="review-session-track" aria-hidden="true">
                <div style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
              </div>
              <span>{index + 1}/{steps.length}</span>
            </div>
            <MessageReveal notice={notice} />
          </div>
        )}
        {compact || !words.length ? null : done ? (
          <Results onClose={onClose} onAgain={reviewAgain} />
        ) : phase === "result" && step !== "unscramble" ? (
          <ResultFace
            notice={notice}
            word={word}
            sentence={word.sentence}
            meaning={word.meaning}
            status={status}
            onStatus={setStatus}
            onNext={goNext}
          />
        ) : step === "matching" ? (
          <Matching
            notice={notice}
            tiles={matchingTiles}
            matched={matched}
            armed={armed}
            wrongPair={wrongPair}
            miss={miss}
            onChoose={chooseTile}
            onSkip={goNext}
          />
        ) : step === "flashcard" || step === "reverse" ? (
          <Flashcard
            notice={notice}
            word={word}
            reverse={step === "reverse"}
            face={phase === "back" ? "back" : "front"}
            status={status}
            onStatus={setStatus}
            onFlip={() => setPhase("back")}
            onWrong={goNext}
            onRight={goNext}
            onSkip={goNext}
          />
        ) : step === "cloze" || step === "choice" ? (
          <Choices
            notice={notice}
            mode={step}
            word={word}
            choices={step === "cloze" ? clozeChoices : meaningChoices}
            selected={selected}
            onSubmit={(choice) => {
              setSelected(choice || null);
              grade();
            }}
          />
        ) : step === "dictation" ? (
          <Dictation
            notice={notice}
            word={word}
            typed={typed}
            onType={setTyped}
            onSubmit={grade}
            onSkip={goNext}
          />
        ) : step === "unscramble" ? (
          <Unscramble
            notice={notice}
            pool={pool}
            picked={picked}
            onPick={(chunk) => {
              setPool((current) => current.filter((item) => item !== chunk));
              setPicked((current) => [...current, chunk]);
            }}
            onRemove={(chunk) => {
              setPicked((current) => current.filter((item) => item !== chunk));
              setPool((current) => [...current, chunk]);
            }}
            corrected={phase === "result"}
            onSubmit={submitUnscramble}
            onSkip={goNext}
            onRetry={retryUnscramble}
            onNext={goNext}
          />
        ) : (
          <Speaking
            notice={notice}
            word={word}
            speech={speech}
            onStart={() => setSpeech("recording")}
            onStop={() => setSpeech("rated")}
            onRetry={() => setSpeech("idle")}
            onSkip={goNext}
            onNext={goNext}
          />
        )}
      </div>
    </section>
  );
}

function Speak({ small = false }) {
  return (
    <button type="button" className={`review-session-speak${small ? " is-small" : ""}`} aria-label="Play" onClick={(event) => event.stopPropagation()}>
      <Volume2 size={small ? 16 : 20} strokeWidth={1.5} absoluteStrokeWidth />
    </button>
  );
}

function SentenceLine({ sentence, term, blank = false, lineRef }) {
  const pattern = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i");
  const parts = sentence.split(pattern);
  return (
    <p className="review-session-sentence" ref={lineRef}>
      {parts.map((part, partIndex) => {
        if (part.toLowerCase() !== term.toLowerCase()) return <span key={partIndex}>{part}</span>;
        if (blank) return <span key={partIndex} className="review-session-blank" />;
        return <strong key={partIndex}>{part}</strong>;
      })}
    </p>
  );
}

function sentenceLineWidth(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const lines = new Map();
  Array.from(range.getClientRects()).forEach((rect) => {
    if (rect.width <= 0 || rect.height <= 0) return;
    const key = Math.round(rect.top);
    const line = lines.get(key) || { left: rect.left, right: rect.right };
    line.left = Math.min(line.left, rect.left);
    line.right = Math.max(line.right, rect.right);
    lines.set(key, line);
  });
  let width = 0;
  lines.forEach((line) => {
    width = Math.max(width, line.right - line.left);
  });
  return width > 0 ? Math.ceil(width) + 1 : 0;
}

function SentenceQuote({ sentence, term }) {
  const lineRef = useRef(null);

  useLayoutEffect(() => {
    const node = lineRef.current;
    if (!node) return undefined;
    const fit = () => {
      node.style.width = "auto";
      node.style.display = "block";
      node.style.webkitLineClamp = "unset";
      node.style.overflow = "visible";
      const width = sentenceLineWidth(node);
      node.style.display = "";
      node.style.webkitLineClamp = "";
      node.style.overflow = "";
      node.style.width = width > 0 ? `${width}px` : "";
    };
    fit();
    const quote = node.parentElement;
    if (!quote || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(fit);
    observer.observe(quote);
    return () => observer.disconnect();
  }, [sentence, term]);

  return (
    <div className="review-session-quote">
      <Speak small />
      {term ? (
        <SentenceLine lineRef={lineRef} sentence={sentence} term={term} />
      ) : (
        <p ref={lineRef} className="review-session-sentence">{sentence}</p>
      )}
    </div>
  );
}

function Tags({ tags }) {
  if (!tags?.length) return null;
  return (
    <div className="review-session-tags">
      {tags.map((tag) => <span key={tag} className="review-session-tag">{tag}</span>)}
    </div>
  );
}

function MessageReveal({ notice }) {
  return (
    <div className="review-session-reveal">
      <div>{notice}</div>
    </div>
  );
}

function ActivityFrame({ children }) {
  const parts = Children.toArray(children);
  const split = parts.findIndex((part) => part.type === Actions);
  const card = split === -1 ? parts : parts.slice(0, split);
  const actions = split === -1 ? null : parts.slice(split);

  return (
    <div className="review-session-stage">
      {card}
      {actions}
    </div>
  );
}

function Actions({ children, wide = false }) {
  return <div className={`review-session-actions${wide ? " is-wide" : ""}`}>{children}</div>;
}

function Quiet({ children, onClick }) {
  return <button type="button" className="review-session-quiet" onClick={onClick}>{children}</button>;
}

function Affordance({ children, onClick, enter = false, disabled = false, green = true }) {
  if (!onClick) {
    return <p className="review-session-affordance"><span>{children}</span></p>;
  }
  return (
    <button type="button" className={`review-session-primary${green ? " is-green" : ""}`} disabled={disabled} onClick={onClick}>
      <span>{children}</span>
      {enter ? <kbd>Enter</kbd> : null}
    </button>
  );
}

function FlashcardMeasure() {
  return (
    <div className="review-session-card-face is-measure" aria-hidden="true">
      <div className="review-session-card-body">
        <div className="review-session-group">
          <div className="review-session-head">
            <div className="review-session-term">
              <span className="review-session-speak" />
              <p className="review-session-word">Word</p>
            </div>
            <p className="review-session-meaning">meaning</p>
          </div>
          <div className="review-session-quote">
            <span className="review-session-speak is-small" />
            <p className="review-session-sentence">Sentence.</p>
          </div>
          <div className="review-session-tags">
            <span className="review-session-tag">Noun</span>
          </div>
        </div>
      </div>
      <StatusBar status="New" onStatus={() => {}} />
    </div>
  );
}

function Flashcard({ notice, word, reverse, face, status, onStatus, onFlip, onWrong, onRight, onSkip }) {
  const front = face === "front";
  return (
    <ActivityFrame notice={notice}>
      <div className={`review-session-card is-flash${front ? " is-term" : ""}`} onClick={front ? onFlip : undefined}>
        <FlashcardMeasure />
        <div key={word.word} className={`review-session-flip${front ? "" : " is-flipped"}`}>
          <div className="review-session-card-front">
            <div className="review-session-term">
              <Speak />
              <p className="review-session-word">{reverse ? word.meaning : word.word}</p>
            </div>
          </div>
          <div className="review-session-card-face">
            <div className="review-session-card-body">
              <div className="review-session-group">
                <div className="review-session-head">
                  <div className="review-session-term">
                    <Speak />
                    <p className="review-session-word">{word.word}</p>
                  </div>
                  <p className="review-session-meaning">{word.meaning}</p>
                </div>
                <SentenceQuote sentence={word.sentence} term={word.word} />
                <Tags tags={word.tags} />
              </div>
            </div>
            <StatusBar status={status} onStatus={onStatus} />
          </div>
        </div>
      </div>
      <Actions>
        {face === "front" ? <Quiet onClick={onSkip}>Skip</Quiet> : null}
        {face === "front" ? (
          <Affordance enter green={false} onClick={onFlip}>Flip</Affordance>
        ) : (
          <>
            <button type="button" className="review-session-wrong" onClick={onWrong}>
              <X size={20} strokeWidth={1.5} absoluteStrokeWidth />
              <span>Oops</span>
            </button>
            <button type="button" className="review-session-right" onClick={onRight}>
              <Check size={20} strokeWidth={1.5} absoluteStrokeWidth />
              <span>Got it</span>
              <kbd>Enter</kbd>
            </button>
          </>
        )}
      </Actions>
    </ActivityFrame>
  );
}

function ChoiceList({ choices, selected, onSelect, label }) {
  return (
    <div className="review-session-choices" role="listbox" aria-label={label}>
      {choices.map((choice, choiceIndex) => (
        <button
          key={choice}
          type="button"
          role="option"
          aria-selected={selected === choice}
          className={`review-session-choice${selected === choice ? " is-on" : ""}`}
          onClick={() => onSelect(choice)}
        >
          <span>{choiceIndex + 1}</span>
          {choice}
        </button>
      ))}
    </div>
  );
}

function Choices({ notice, mode, word, choices, selected, onSubmit }) {
  const cloze = mode === "cloze";
  return (
    <ActivityFrame notice={notice}>
      <div className="review-session-card">
        <div className="review-session-card-body">
          <p className="review-session-prompt">{cloze ? "Select the term that matches the given meaning..." : "Select the meaning that matches the given term..."}</p>
          <div className="review-session-group">
            {cloze ? (
              <p className="review-session-meaning">{word.meaning}</p>
            ) : (
              <div className="review-session-term">
                <Speak />
                <p className="review-session-word">{word.word}</p>
              </div>
            )}
          </div>
          <div className="review-session-group">
            <ChoiceList choices={choices} selected={selected} onSelect={onSubmit} label={cloze ? "Words" : "Meanings"} />
          </div>
        </div>
      </div>
      <Actions>
        <Quiet onClick={() => onSubmit()}>I don't know</Quiet>
      </Actions>
    </ActivityFrame>
  );
}

function Dictation({ notice, word, typed, onType, onSubmit, onSkip }) {
  return (
    <ActivityFrame notice={notice}>
      <div className="review-session-card">
        <div className="review-session-card-body">
          <div className="review-session-dictation-label">
            <span className="review-session-prompt">Type the word you hear...</span>
            <a href="https://support.apple.com/en-euro/guide/mac-help/mchlp1406/mac" target="_blank" rel="noreferrer" aria-label="Language keyboard info">
              <Info size={16} strokeWidth={1.5} absoluteStrokeWidth />
            </a>
          </div>
          <div className="review-session-group">
            <div className="review-session-term">
              <Speak />
              <p className="review-session-word is-redacted" aria-hidden="true">{word.word}</p>
            </div>
          </div>
          <form className="review-session-group review-session-dictation" onSubmit={(event) => { event.preventDefault(); if (typed.trim()) onSubmit(); }}>
            <input value={typed} aria-label="Typed word" onChange={(event) => onType(event.target.value)} />
          </form>
        </div>
      </div>
      <Actions>
        <Quiet onClick={onSkip}>Skip</Quiet>
        <Affordance enter disabled={!typed.trim()} onClick={onSubmit}>Submit</Affordance>
      </Actions>
    </ActivityFrame>
  );
}

function Matching({ notice, tiles, matched, armed, wrongPair, miss, onChoose, onSkip }) {
  return (
    <ActivityFrame notice={notice}>
      <div className="review-session-card">
      <div className="review-session-card-body">
      <p className="review-session-prompt">Match the pairs...</p>
      <div className="review-session-group">
      <div className="review-session-match">
        {tiles.map((tile) => {
          const locked = matched.includes(tile.id);
          const on = armed?.id === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              className={`review-session-tile${locked ? " is-locked" : ""}${on ? " is-on" : ""}${wrongPair && miss.includes(tile.id) ? " is-wrong" : ""}`}
              disabled={locked}
              onClick={() => onChoose(tile)}
            >
              {tile.label}
            </button>
          );
        })}
      </div>
      </div>
      </div>
      </div>
      <Actions>
        <Quiet onClick={onSkip}>Skip</Quiet>
      </Actions>
    </ActivityFrame>
  );
}

function Unscramble({ notice, pool, picked, corrected = false, onPick, onRemove, onSubmit, onSkip, onRetry, onNext }) {
  const solved = corrected && picked.join(" ") === UNSCRAMBLE_SENTENCE;
  return (
    <ActivityFrame notice={notice}>
      <div className="review-session-card">
      <div className="review-session-card-body">
      <p className="review-session-prompt">Click the words in order...</p>
      <div className="review-session-group">
        <div className="review-session-quote">
          <p className="review-session-sentence">{UNSCRAMBLE_TRANSLATION}</p>
        </div>
      </div>
      {corrected && !solved ? (
        <div className="review-session-group">
          <CorrectedChips from={picked} />
        </div>
      ) : (
        <div className="review-session-group">
        <div className="review-session-answer" aria-label="Answer">
          {picked.map((chunk) => (
            <button key={chunk} type="button" className={`review-session-chip is-placed${solved ? " is-correct" : ""}`} onClick={() => { if (!solved) onRemove(chunk); }}>{chunk}</button>
          ))}
        </div>
        {solved ? null : (
          <div className="review-session-chips">
            {pool.map((chunk) => (
              <button key={chunk} type="button" className="review-session-chip" onClick={() => onPick(chunk)}>{chunk}</button>
            ))}
          </div>
        )}
        </div>
      )}
      </div>
      </div>
      {solved ? null : (
        <Actions>
          {corrected ? (
            <>
              <Quiet onClick={onRetry}>Try again</Quiet>
              <Affordance enter onClick={onNext}>Continue</Affordance>
            </>
          ) : (
            <>
              <Quiet onClick={onSkip}>Skip</Quiet>
              <Affordance enter disabled={pool.length > 0} onClick={onSubmit}>Submit</Affordance>
            </>
          )}
        </Actions>
      )}
    </ActivityFrame>
  );
}

function CorrectedChips({ from }) {
  const [order, setOrder] = useState(from);
  const [green, setGreen] = useState(false);
  const refs = useRef(new Map());
  const previous = useRef(null);

  useLayoutEffect(() => {
    const rects = new Map();
    order.forEach((chunk) => {
      const node = refs.current.get(chunk);
      if (node) rects.set(chunk, node.getBoundingClientRect());
    });
    if (previous.current) {
      order.forEach((chunk) => {
        const node = refs.current.get(chunk);
        const before = previous.current.get(chunk);
        const after = rects.get(chunk);
        if (!node || !before || !after) return;
        const dx = before.left - after.left;
        const dy = before.top - after.top;
        if (!dx && !dy) return;
        node.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
          { duration: 480, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
        );
      });
    }
    previous.current = rects;
  }, [order]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setOrder(UNSCRAMBLE_CHUNKS);
      setGreen(true);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setOrder(UNSCRAMBLE_CHUNKS);
      setGreen(true);
    }, 420);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="review-session-answer" aria-label="Correct order">
      {order.map((chunk) => (
        <span
          key={chunk}
          ref={(node) => {
            if (node) refs.current.set(chunk, node);
          }}
          className={`review-session-chip is-placed${green ? " is-correct" : ""}`}
        >
          {chunk}
        </span>
      ))}
    </div>
  );
}

function Speaking({ notice, word, speech, onStart, onStop, onRetry, onSkip, onNext }) {
  const sentence = word?.sentence || WORDS[0].sentence;
  const heardSentence = sentence;
  const recording = speech === "recording";
  const rated = speech === "rated";
  const [heard, setHeard] = useState("");

  useEffect(() => {
    if (speech === "idle") setHeard("");
  }, [speech]);

  useEffect(() => {
    if (!recording) return undefined;
    const words = heardSentence.split(" ");
    let count = 0;
    setHeard("");
    const timer = window.setInterval(() => {
      count += 1;
      setHeard(words.slice(0, count).join(" "));
      if (count >= words.length) window.clearInterval(timer);
    }, 280);
    return () => window.clearInterval(timer);
  }, [recording, heardSentence]);

  return (
    <ActivityFrame notice={notice}>
      <div className="review-session-card">
        <div className="review-session-card-body">
          <div className="review-session-speaking">
            <p className="review-session-prompt">Speak the sentence...</p>
            <div className="review-session-speak-body">
              <div className="review-session-speak-foot">
                <button type="button" className={`review-session-record${recording ? " is-recording" : ""}`} onClick={rated ? undefined : (recording ? onStop : onStart)}>
                  {recording ? <Square size={16} strokeWidth={1.5} absoluteStrokeWidth /> : <Mic size={16} strokeWidth={1.5} absoluteStrokeWidth />}
                  {recording ? "Stop speaking" : "Start speaking"}
                </button>
              </div>
              <div className="review-session-speak-lines">
                <SentenceQuote sentence={sentence} term={word?.word || WORDS[0].word} />
                {(recording || rated) && heard ? (
                  <p className="review-session-transcript">{heard}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Actions>
        {rated ? (
          <>
            <Quiet onClick={onRetry}>Try again</Quiet>
            <Affordance enter onClick={onNext}>Continue</Affordance>
          </>
        ) : (
          <Quiet onClick={onSkip}>Skip</Quiet>
        )}
      </Actions>
    </ActivityFrame>
  );
}

function SpeakingRating({ score }) {
  const meaning = score >= 90 ? "Well done!" : score >= 70 ? "Almost there!" : "Keep going!";
  return (
    <div className={`review-session-outcome${score >= 70 ? " is-right" : " is-wrong"}`}>
      <p className="review-session-outcome-label">{score}%</p>
      <p className="review-session-outcome-answer">{meaning}</p>
    </div>
  );
}

function AnswerFeedback({ correct, answer }) {
  return (
    <div className={`review-session-outcome${correct ? " is-right" : " is-wrong"}`}>
      <p className="review-session-outcome-label">{correct ? "Correct!" : "Incorrect"}</p>
      {answer ? <p className="review-session-outcome-answer">You answered: {answer}</p> : null}
    </div>
  );
}

function ResultFace({ notice, word, sentence, meaning, status, onStatus, onRetry, onNext }) {
  return (
    <ActivityFrame notice={notice}>
      <div className="review-session-card">
        <div className="review-session-card-body">
          <div className="review-session-group">
            <div className="review-session-head">
              {word ? (
                <div className="review-session-term">
                  <Speak />
                  <p className="review-session-word">{word.word}</p>
                </div>
              ) : null}
              <p className="review-session-meaning">{meaning}</p>
            </div>
            <SentenceQuote sentence={sentence} term={word?.word} />
            {word ? <Tags tags={word.tags} /> : null}
          </div>
        </div>
        {word ? <StatusBar status={status} onStatus={onStatus} /> : null}
      </div>
      <Actions>
        {onRetry ? <Quiet onClick={onRetry}>Try again</Quiet> : null}
        <Affordance enter onClick={onNext}>Continue</Affordance>
      </Actions>
    </ActivityFrame>
  );
}

const STUDIED = [
  { word: "Zeit", meaning: "time", right: 1, wrong: 0 },
  { word: "Sprache", meaning: "language", right: 1, wrong: 0 },
  { word: "Minuten", meaning: "minutes", right: 1, wrong: 1 },
  { word: "Fortschritte", meaning: "progress", right: 0, wrong: 1 },
  { word: "Sprachen", meaning: "languages", right: 0, wrong: 1 },
  { word: "Wort", meaning: "word", right: 1, wrong: 0 },
  { word: "Satz", meaning: "sentence", right: 1, wrong: 0 },
  { word: "lernen", meaning: "to learn", right: 0, wrong: 1 },
  { word: "verstehen", meaning: "to understand", right: 1, wrong: 0 },
  { word: "üben", meaning: "to practice", right: 0, wrong: 1 },
  { word: "Bedeutung", meaning: "meaning", right: 1, wrong: 0 },
  { word: "Beispiel", meaning: "example", right: 1, wrong: 1 },
  { word: "wiederholen", meaning: "to review", right: 0, wrong: 1 },
  { word: "richtig", meaning: "correct", right: 1, wrong: 0 },
];

function Results({ onClose, onAgain }) {
  const right = 3;
  const total = 5;
  const [count, setCount] = useState(() => (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 3 : 0
  ));
  const settled = count >= 3;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timers = [];
    const later = (delay, next) => {
      timers.push(window.setTimeout(() => setCount(next), delay));
    };
    later(600, 1);
    later(1600, 2);
    later(2700, 3);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div className={`review-session-finish${settled ? " is-settled" : ""}`}>
      <div className="review-session-summary">
        <div className="review-session-summary-space" />
        {count >= 1 ? (
          <div className="review-session-stats">
            <StatSlot open tone="message">
              <span className="review-session-result-emoji" aria-hidden="true">🤨</span>
              You can do better!
            </StatSlot>
            <StatSlot open={count >= 2}>
              {right} of {total} correct
            </StatSlot>
          </div>
        ) : null}
        <div className={`review-session-done-list${settled ? " is-in" : ""}`}>
          <div className="review-session-done-list-inner">
            <p className="review-session-done-heading">Terms Studied</p>
            <div className="review-session-studied-card">
              <ul className="review-session-studied">
                {STUDIED.map((item) => (
                  <li key={item.word}>
                    <span className="review-session-studied-term">
                      <strong>{item.word}</strong>
                      <span>{item.meaning}</span>
                    </span>
                    <span className="review-session-studied-counts">
                      <span className="is-right">{item.right}</span>
                      <span className="is-wrong">{item.wrong}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="review-session-summary-space" />
      </div>
      <Actions>
        <Quiet onClick={onClose}>Close review</Quiet>
        <Affordance onClick={onAgain}>
          <RefreshCw size={16} strokeWidth={1.5} absoluteStrokeWidth />
          Review again
        </Affordance>
      </Actions>
    </div>
  );
}

function StatSlot({ open, tone, children }) {
  return (
    <div className={`review-session-stat-slot${open ? " is-in" : ""}`}>
      <div>
        <p className={`review-session-stat${tone ? ` is-${tone}` : ""}`}>{children}</p>
      </div>
    </div>
  );
}

function StatusBar({ status, onStatus }) {
  return (
    <div className="review-session-status">
      <div className="review-session-status-bar">
        {WORD_BAR_STATUSES.map((item) => (
          <StatusButton
            key={item}
            status={item}
            state={item === status ? "focus" : "default"}
            onClick={() => onStatus(item)}
          />
        ))}
      </div>
    </div>
  );
}
