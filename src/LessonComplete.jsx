import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const EASE = "cubic-bezier(.2,.8,.2,1)";
const SPRING = "cubic-bezier(.34,1.56,.64,1)";
const DRAW = "cubic-bezier(.65,0,.35,1)";
const BURST = "cubic-bezier(.1,.7,.3,1)";
const SPARK = "cubic-bezier(.15,.7,.3,1)";
const ICON_COLORS = ["#FFDD47", "#F5B323", "#7ED082", "#FFE98A", "#CC8602", "#C1E1C0"];
const COIN_COLORS = ["#FFDD47", "#F5B323", "#FFE98A", "#CC8602"];
const RISE = [
  { opacity: 0, transform: "translateY(10px)" },
  { opacity: 1, transform: "none" },
];
const POP = [
  { transform: "scale(1)" },
  { transform: "scale(1.1)", offset: 0.4 },
  { transform: "scale(1)" },
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function countTo(from, to, dur, onFrame) {
  const start = performance.now();
  let frame = 0;
  let stopped = false;
  const step = (now) => {
    if (stopped) return;
    const k = Math.min(1, (now - start) / dur);
    const eased = 1 - (1 - k) ** 3;
    onFrame(Math.round(from + (to - from) * eased));
    if (k < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
  };
}

export default function LessonComplete({ open, base = 0, bonus = 0, terms = 0, onRestart }) {
  const reduced = useRef(prefersReducedMotion()).current;
  const [totalShown, setTotalShown] = useState(reduced ? base + bonus : 0);
  const [bonusShown, setBonusShown] = useState(reduced ? bonus : 0);
  const [settled, setSettled] = useState(reduced);
  const rootRef = useRef(null);
  const fxRef = useRef(null);
  const iconRef = useRef(null);
  const circleRef = useRef(null);
  const checkRef = useRef(null);
  const titleRef = useRef(null);
  const totalRef = useRef(null);
  const totalPopRef = useRef(null);
  const totalMeasureRef = useRef(null);
  const breakRef = useRef(null);
  const bonusRef = useRef(null);
  const bonusMeasureRef = useRef(null);
  const restartRef = useRef(null);
  const skipRef = useRef(() => {});
  const settledRef = useRef(reduced);
  const total = base + bonus;
  const termLabel = `${terms} ${terms === 1 ? "term" : "terms"} moved to Known`;

  useEffect(() => {
    settledRef.current = settled;
  }, [settled]);

  useLayoutEffect(() => {
    if (!open) return;
    if (totalPopRef.current && totalMeasureRef.current) {
      totalPopRef.current.style.minWidth = `${totalMeasureRef.current.offsetWidth}px`;
    }
    if (bonusRef.current && bonusMeasureRef.current) {
      bonusRef.current.style.minWidth = `${bonusMeasureRef.current.offsetWidth}px`;
    }
  }, [open, total, bonus]);

  useEffect(() => {
    if (!open) return undefined;
    if (reduced) {
      restartRef.current?.focus();
      return undefined;
    }

    const timers = [];
    const anims = [];
    const stops = [];
    let skipped = false;

    function later(ms, fn) {
      timers.push(window.setTimeout(fn, ms));
    }

    function play(el, frames, options) {
      if (!el) return null;
      const anim = el.animate(frames, { fill: "both", ...options });
      anims.push(anim);
      return anim;
    }

    function burst(target, { count, min, spread, colors, rings, stretch = 1 }) {
      const fx = fxRef.current;
      if (!fx || !target) return;
      const point = target.getBoundingClientRect();
      const layer = fx.getBoundingClientRect();
      const x = point.left + point.width / 2 - layer.left;
      const y = point.top + point.height / 2 - layer.top;

      if (rings) {
        const halo = document.createElement("span");
        halo.className = "lesson-complete-halo";
        halo.style.left = `${x}px`;
        halo.style.top = `${y}px`;
        fx.appendChild(halo);
        const haloAnim = halo.animate([
          { transform: "translate(-50%, -50%) scale(.35)", opacity: 1 },
          { transform: "translate(-50%, -50%) scale(1.9)", opacity: 0 },
        ], { duration: 1000, easing: BURST, fill: "both" });
        haloAnim.onfinish = () => halo.remove();
        anims.push(haloAnim);

        const ring = document.createElement("span");
        ring.className = "lesson-complete-ring";
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        fx.appendChild(ring);
        const ringAnim = ring.animate([
          { transform: "translate(-50%, -50%) scale(1.1)", opacity: 0.9 },
          { transform: "translate(-50%, -50%) scale(2.4)", opacity: 0 },
        ], { duration: 750, easing: BURST, fill: "both" });
        ringAnim.onfinish = () => ring.remove();
        anims.push(ringAnim);
      }

      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
        const distance = min + Math.random() * spread;
        const dx = Math.cos(angle) * distance * stretch;
        const dy = Math.sin(angle) * distance;
        const size = 3 + Math.random() * 4;
        const spark = document.createElement("span");
        spark.className = "lesson-complete-spark";
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        spark.style.background = colors[index % colors.length];
        fx.appendChild(spark);
        const sparkAnim = spark.animate([
          { transform: "translate(-50%, -50%) scale(.4)", opacity: 0 },
          { transform: `translate(calc(-50% + ${dx * 0.55}px), calc(-50% + ${dy * 0.55}px)) scale(1.15)`, opacity: 1, offset: 0.25 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 10}px)) scale(0)`, opacity: 0 },
        ], { duration: 820 + Math.random() * 260, easing: SPARK, fill: "both" });
        sparkAnim.onfinish = () => spark.remove();
        anims.push(sparkAnim);
      }
    }

    function finishCount(from, to, dur, onFrame) {
      stops.push(countTo(from, to, dur, onFrame));
    }

    play(rootRef.current, [
      { backgroundColor: "rgba(16,18,20,0)", backdropFilter: "blur(0px)" },
      { backgroundColor: "rgba(16,18,20,0.8)", backdropFilter: "blur(5px)" },
    ], { duration: 600, easing: "ease" });

    play(iconRef.current, [
      { opacity: 0, transform: "scale(.6)" },
      { opacity: 1, transform: "scale(1.08)", offset: 0.65 },
      { opacity: 1, transform: "scale(1)" },
    ], { delay: 120, duration: 700, easing: EASE });

    play(circleRef.current, [
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0 },
    ], { delay: 180, duration: 560, easing: DRAW });

    play(titleRef.current, RISE, { delay: 520, duration: 500, easing: EASE });
    play(checkRef.current, [
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0 },
    ], { delay: 680, duration: 300, easing: DRAW });
    play(totalRef.current, RISE, { delay: 800, duration: 450, easing: EASE });

    later(900, () => burst(iconRef.current, {
      count: 14, min: 48, spread: 42, colors: ICON_COLORS, rings: true,
    }));
    later(980, () => finishCount(0, base, 1150, setTotalShown));

    if (bonus > 0) {
      play(breakRef.current, RISE, { delay: 2350, duration: 420, easing: EASE });
      later(2500, () => finishCount(0, bonus, 600, setBonusShown));
      later(3350, () => finishCount(base, total, 650, setTotalShown));
      later(4000, () => {
        burst(totalPopRef.current, {
          count: 10, min: 30, spread: 30, colors: COIN_COLORS, rings: false, stretch: 1.8,
        });
        play(totalPopRef.current, POP, { duration: 380, easing: SPRING });
      });
      play(restartRef.current, RISE, { delay: 4500, duration: 450, easing: EASE })
        ?.addEventListener("finish", () => {
          if (!skipped) {
            setSettled(true);
            restartRef.current?.focus();
          }
        });
    } else {
      later(2130, () => play(totalPopRef.current, POP, { duration: 380, easing: SPRING }));
      play(restartRef.current, RISE, { delay: 2780, duration: 450, easing: EASE })
        ?.addEventListener("finish", () => {
          if (!skipped) {
            setSettled(true);
            restartRef.current?.focus();
          }
        });
    }

    function skip() {
      if (skipped || settledRef.current) return;
      skipped = true;
      timers.forEach((id) => window.clearTimeout(id));
      stops.forEach((stop) => stop());
      anims.forEach((anim) => {
        try { anim.finish(); } catch { /* A finished animation can reject. */ }
      });
      fxRef.current?.replaceChildren();
      setTotalShown(total);
      setBonusShown(bonus);
      setSettled(true);
      restartRef.current?.focus();
    }

    skipRef.current = skip;

    function onKeyDown(event) {
      if (event.key !== "Escape") return;
      if (skipped || settledRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      skip();
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      timers.forEach((id) => window.clearTimeout(id));
      stops.forEach((stop) => stop());
      anims.forEach((anim) => anim.cancel());
      fxRef.current?.replaceChildren();
      skipRef.current = () => {};
    };
  }, [open, reduced, base, bonus, total]);

  if (!open) return null;

  return createPortal(
    <div
      ref={rootRef}
      className={`lesson-complete${settled ? " is-settled" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby="lesson-complete-title"
      onClick={() => {
        if (!settledRef.current) skipRef.current();
      }}
    >
      <div className="lesson-complete-fx" ref={fxRef} />
      <div className="lesson-complete-column">
        <svg ref={iconRef} className="lesson-complete-check" viewBox="0 0 24 24" aria-hidden="true">
          <circle ref={circleRef} cx="12" cy="12" r="10" pathLength="1" transform="rotate(-90 12 12)" />
          <path ref={checkRef} d="m8.5 12 2.5 2.5 4.5-5" pathLength="1" />
        </svg>
        <h2 id="lesson-complete-title" ref={titleRef}>Lesson Complete</h2>
        <div className="lesson-complete-total-rise" ref={totalRef}>
          <p className="lesson-complete-total" ref={totalPopRef}>{`+ ${totalShown} coins`}</p>
        </div>
        <span className="lesson-complete-total is-measure" ref={totalMeasureRef} aria-hidden="true">{`+ ${total} coins`}</span>
        {bonus > 0 ? (
          <p className="lesson-complete-break" ref={breakRef}>
            <span ref={bonusRef}>{`+ ${bonusShown}`}</span>
            {` from ${termLabel}`}
            <span className="is-measure" ref={bonusMeasureRef} aria-hidden="true">{`+ ${bonus}`}</span>
          </p>
        ) : null}
        <button
          ref={restartRef}
          type="button"
          className="lesson-complete-restart"
          onClick={(event) => {
            event.stopPropagation();
            if (!settledRef.current) {
              skipRef.current();
              return;
            }
            onRestart();
          }}
        >
          Restart lesson
        </button>
      </div>
    </div>,
    document.body,
  );
}
