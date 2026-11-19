# Lesson Complete Animation: Web Build Spec

Rebuild the lesson-complete celebration from the mobile prototype (https://claude.ai/artifact/HQGiwGpDNuuUW2zNaydRoB) in the web Reader. Full feature context: developer spec https://claude.ai/artifact/Q9GQMyqpdDuhEQxczcQv79.

## Key decisions

- **Plays only on Finish:** after the "Update Lesson Progress" popover is resolved from Finish, or straight away on Finish when there is nothing to resolve. Never on Exit.
- **No blue-term coins:** when the user finished with blue terms left blue, or didn't accumulate any, it shows "Lesson Complete" and the coins earned, counting up in one go.
- **Blue-term coins:** when accumulated terms were moved to a status and earned coins, it shows "Lesson Complete" and the coins earned counting up first. Then the breakdown line appears and its own number counts up ("+ 0 → + 26 from 26 terms moved to Known"). When that finishes, the main coin total counts up again by the same amount (e.g. 86 → 112), so the bonus reads as being added to it.
- **Skippable:** a click anywhere or Esc jumps to the end state.
- **Reduced motion:** users with `prefers-reduced-motion: reduce` get the end state with no animation.
- **Same numbers everywhere:** the celebration total and the stats sheet use the same coin values.
- **Last element:** in both cases a "Restart lesson" button appears last. It's for the prototype only (it resets the demo); production continues to the existing post-lesson destination.

## Layers

| Layer | Spec |
|---|---|
| Scrim | Covers the Reader. Transitions to `rgba(16,18,20,.8)` with `backdrop-filter: blur(5px)` over 600ms ease. Stays dark in light and dark themes. |
| Celebration | Centered column over the scrim: `display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding-bottom:70px`. All children start at `opacity:0`. |
| FX layer | Absolute, `inset:0`, `pointer-events:none`, above the celebration. Holds the spark bursts. |

## Elements, top to bottom

| Element | Spec |
|---|---|
| Check icon | 72px SVG, `viewBox 0 0 24 24`, stroke `#4CAF50`, stroke-width 1.8, round caps and joins, 20px margin below. A circle (`cx 12, cy 12, r 10`, rotated -90° so it draws from the top) and a check path `m8.5 12 2.5 2.5 4.5-5`. Both use `pathLength="1"`, `stroke-dasharray="1"`, `stroke-dashoffset="1"` so they can be drawn in. |
| Title | "Lesson Complete", 30/36, weight 500, white. |
| Coin total | "+ N coins", 30/38, weight 500, 8px above. Gold text gradient `linear-gradient(90deg,#FFDD47,#CC8602)` clipped to text. `tabular-nums`, `display:inline-block`, centered. Lock `min-width` to the width of the final total before counting starts, so the line doesn't jitter. |
| Breakdown | Only when blue terms earned coins. "<span>+ 26</span> from 26 terms moved to Known", 15/20, `#D1D6D9`, "+ N" in `#FFDD47`, 10px above, `min-height:20px`. The "+ N" part is its own inline-block with `tabular-nums` and a `min-width` locked to its final width, since it counts up from "+ 0". The "from …" label is static. It reads "N terms moved to [status]", using that status's name. Two statuses join with &: "N terms moved to Known & M terms moved to New". |
| Restart lesson button | Prototype only. 40px above, 15px weight 500, bg `#262B30`, white, pill, padding 11×22. Resets the demo. |

## Easing

| Name | Value |
|---|---|
| EASE | `cubic-bezier(.2,.8,.2,1)` |
| SPRING | `cubic-bezier(.34,1.56,.64,1)` |
| DRAW | `cubic-bezier(.65,0,.35,1)` |
| BURST | `cubic-bezier(.1,.7,.3,1)` (halo and ring), `cubic-bezier(.15,.7,.3,1)` (sparks) |
| Count-up | ease-out cubic: `1 - (1 - k)^3` |

**Rise:** shorthand for opacity 0 → 1 and `translateY(10px)` → none, EASE.

## Timeline

t = 0 when the celebration starts. That's 650ms after the popover closes when terms were moved (so the words visibly change status first), or 250ms after Finish when there was nothing to resolve.

| Start | Duration | What |
|---|---|---|
| 0 | 600ms | Scrim darkens and blurs. |
| 120 | 700 | Icon: opacity 0 → 1, scale .6 → 1.08 (at 65%) → 1, EASE. |
| 180 | 560 | Circle draws in (dashoffset 1 → 0), DRAW. |
| 520 | 500 | Title rises. |
| 680 | 300 | Check draws in, DRAW. |
| 800 | 450 | Coin total line rises (showing "+ 0 coins"). |
| 900 | about 1000 | Burst at the icon center, with halo and ring (see Bursts). |
| 980 | 1150 | Count 0 → base total. |

**No blue-term coins (one count):**

| Start | Duration | What |
|---|---|---|
| 2130 | 380 | Coin total pops: scale 1 → 1.1 (at 40%) → 1, SPRING. |
| 2780 | 450 | Restart lesson button rises. Celebration ends. |

**Blue-term coins (three counts):**

| Start | Duration | What |
|---|---|---|
| 2350 | 420 | Breakdown line rises, showing "+ 0 from 26 terms moved to Known". |
| 2500 | 600 | Breakdown number counts + 0 → + bonus. |
| 3350 | 650 | Main coin total counts base → base + bonus. |
| 4000 | about 900 | Small burst at the coin total (no halo or ring) and the coin total pops (380ms SPRING). |
| 4500 | 450 | Restart lesson button rises. Celebration ends. |

## Bursts

Both bursts are spawned at the center of their target element, in FX-layer coordinates, and removed after they finish.

**Icon burst (rings on):**
- **Halo:** 96px circle centered on the point, `radial-gradient(circle, rgba(76,175,80,.38) 0%, rgba(76,175,80,.12) 45%, rgba(76,175,80,0) 70%)`. Scale .35 → 1.9, opacity 1 → 0, 1000ms BURST.
- **Ring:** 60px circle, 2px border `rgba(126,208,130,.7)`, no fill. Scale 1.1 → 2.4, opacity .9 → 0, 750ms BURST.
- **14 sparks**, distance 48–90px, colors cycling `#FFDD47, #F5B323, #7ED082, #FFE98A, #CC8602, #C1E1C0`.

**Coin burst (rings off):** 10 sparks, distance 30–60px, colors cycling `#FFDD47, #F5B323, #FFE98A, #CC8602`. Horizontal travel is stretched ×1.8 to follow the wide text.

**Each spark:**
- A circle 3–7px (random), placed centered on the point.
- Angle: evenly spaced around the circle (`i / count × 2π`) plus up to 0.4 rad of random jitter.
- Distance: `min + random × spread` (icon: 48 + 0–42, coin: 30 + 0–30).
- Keyframes, 820–1080ms (random), spark easing:
  - 0%: `translate(0,0) scale(.4)`, opacity 0
  - 25%: `translate(dx×.55, dy×.55) scale(1.15)`, opacity 1
  - 100%: `translate(dx, dy + 10px) scale(0)`, opacity 0 (the +10px gives a slight fall)

## Skip and reduced motion

- **Skip:** while the celebration is running, a click anywhere (scrim or celebration) or Esc does the following:
  - cancels pending timers and the count-up
  - jumps every running animation to its end
  - sets the coin total and the breakdown number to their final values
  - shows every element at full opacity (the breakdown only if there is one)
  - sets both icon strokes to dashoffset 0
  - clears any remaining sparks
- **Reduced motion:** build the same end state directly, with no animations or sparks.
- **Focus:** move focus to the Restart lesson button once it's shown. The celebration container is `aria-live="polite"`, so the title and total are announced.

## Reference: count-up

```js
function countTo(from, to, dur, onFrame, done) {
  const start = performance.now();
  const step = now => {
    const k = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    onFrame(Math.round(from + (to - from) * e));
    if (k < 1) requestAnimationFrame(step); else done && done();
  };
  requestAnimationFrame(step);
}
```

## Web notes

- Use the Web Animations API (`element.animate`, `fill: 'both'`) or equivalent CSS. Keep handles to every animation and timer so skip can finish them and leaving can cancel them.
- Use the web Reader's own font (DM Sans in the prototype). Keep the colors above, since the celebration always sits on the dark scrim.
- The prototype's coin values are placeholders (base 86, 1 coin per term moved to Known or to a LingQ status). Use the real values.
