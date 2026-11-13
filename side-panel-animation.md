# Side panel animation

## 1. Side panel opening and closing

The column and the card move together. Nothing fades.

| | Open | Close |
|---|---|---|
| Duration | 360ms | 360ms |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` | same |
| Slot width | 0 → 452px | 452px → 0 |
| Card | `translateX(calc(100% + 16px))` → `none` | `none` → `translateX(calc(100% + 16px))` |
| Opacity | none | none |

The card is 420px wide, so the closed position is its own width plus the 16px inset, 436px off to the right. The open starts on the next frame, so the closed position paints before it moves. On close, the column stays mounted for the full 360ms, then goes away.

The lesson header’s right inset moves with it: 0 → 20px on open, 20px → 0 on close, same 360ms and same curve.

One exception. Closing an expanded review or Lynx and returning to the column does not use this slide. That return is 200ms, `ease-out`, opacity 0 → 1 and `translateX(12px)` → `none`. The 360ms slide is turned off for those 200ms.

Reduced motion skips all of this. The column appears and disappears in place.

## 2. Lynx and the word widget inside the column

This plays only when Lynx or a word opens on top of the vocabulary list, and when that view closes back onto the list. Opening the column, swapping one word for another, opening Lynx from a docked word or a review, and the text popup do not use it.

Same motion both ways. No fade. The list stays underneath the whole time.

| | Open | Close |
|---|---|---|
| Duration | 200ms | 120ms |
| Easing | `ease-out` | `ease-out` |
| Direction | forward | reverse |
| From | `translateY(2%) scale(0.98)` | `none` |
| To | `none` | `translateY(2%) scale(0.98)` |
| Opacity | none | none |
| Fill | default | `forwards`, held until it unmounts |

On close, the list is painted for two frames at full size before the 120ms reverse starts. The closing view ignores clicks during that 120ms. When the 200ms open finishes, the list underneath is removed. When the 120ms close finishes, Lynx or the word is removed and the list is what remains.

The word’s X always uses the close. Lynx’s X uses it only when no word is selected. If a word is selected, Lynx’s X swaps to that word with no cover motion.

Reduced motion skips it and switches views immediately.
