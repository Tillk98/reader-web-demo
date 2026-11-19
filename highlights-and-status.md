# Text highlights and status buttons

Colors and button styling in this prototype, taken from `src/reader.css` and `src/StatusButton.jsx`.

Tokens used below:

| Token | Value |
| --- | --- |
| `--fg-default` | `#0a0a0a` |
| `--fg-muted` | `#49525b` |
| `--fg-secondary` | `#2e75cd` |
| `--fg-primary` | `#42a564` |
| `--new-fill` | `#c0e0ff` |
| `--lingq-fill` | `#ffe787` |
| `--lingq-2-fill` | `#fff1bf` |
| `--lingq-3-fill` | `#fff7d8` |
| `--bg-elevated` | `#f8f9fa` |
| `--surface` | `#fbfcfd` |
| `--surface-default` | `#f1f3f4` |
| `--border` | `#f1f3f4` |

## Lesson text

A word is inline, with a 6px radius, 1px of vertical padding, and a 1px transparent border. Nothing fills on hover. LingQ levels 1–3 set the letters to `#000`. Every other word keeps `--fg-default`.

| Status | Fill | Letters | Border while the word is open |
| --- | --- | --- | --- |
| Blue (unsaved) | `#c0e0ff` | `#0a0a0a` | `#2e75cd` |
| LingQ 1, New | `#ffe787` | `#000` | `#dea201` |
| LingQ 2, Recognized | `#fff1bf` | `#000` | `#dea201` |
| LingQ 3, Familiar | `#fff7d8` | `#000` | `#dea201` |
| LingQ 4, Learned | none | `#0a0a0a` | `#dea201` |
| Known | none | `#0a0a0a` | `#49525b` |
| Ignored | none | `#0a0a0a` | `#49525b` |

The first word of a phrase also draws a 1px outer stroke in that same border color. Known and Ignored set both the border and the stroke. A LingQ sets only the stroke, so the open border stays `#dea201`. A blue word sets only the stroke, in `#2e75cd`.

A saved phrase paints the whole span and clears the fill and border on the words inside it.

| Phrase | Fill | Stroke |
| --- | --- | --- |
| Unsaved | `#c0e0ff` | `#2e75cd` |
| Invalid | `#f1f3f4` | `#49525b` |
| LingQ 1 | `#ffe787` | `rgb(114 61 17 / 50%)` |
| LingQ 2 | `#fff1bf` | `rgb(114 61 17 / 50%)` |
| LingQ 3 | `#fff7d8` | `rgb(204 134 2 / 50%)` |
| Known or Ignored | none | `#49525b` on hover |

The theater caption drops these fills. Every word is white with no border. A blue word is `#2e75cd` on `rgba(41, 70, 112, 0.25)`. LingQ 1–3 are `#ffca01` on `rgba(255, 202, 1, 0.25)`. Those two use 5px by 4px of padding, a 6px radius, and a negative margin so the highlight sits in the line. Learned, Known, and Ignored stay plain white.

The block that is playing, while the player is open, is a separate highlight: `#f1f3f4`, 16px corners, 8px of padding. It is not a status color.

## Status buttons

A status button is a 32×32 pill. Radius is 999. Padding is 6px. The border is 1px and starts transparent, and the fill starts transparent. The mark is 14px medium, line height 18, in `#0a0a0a`, except Ignore, which is `#49525b` at rest. Icons are 16px Lucide with a 1.33 stroke: EyeOff for Ignore, Plus for the blue word, Check for Known. Levels use a numeral: 1 New, 2 Recognized, 3 Familiar, 4 Learned.

Resting buttons have no fill. Focus and hover share the colors below. Hover is what changes when the row says so.

| Status | Focus and hover fill | Border | Text | Hover only |
| --- | --- | --- | --- | --- |
| Ignore | `#fbfcfd` | `#f1f3f4` | `#49525b` | border `#d1d6d9`, fill `#f1f3f4` |
| Blue | `#c0e0ff` | `#2e75cd` | `#2e75cd` | same as focus |
| New (1) | `#ffe787` | `rgb(114 61 17 / 50%)` | `#1e2328` | same as focus |
| Recognized (2) | `#fff1bf` | `rgb(114 61 17 / 50%)` | `#1e2328` | same as focus |
| Familiar (3) | `#fff7d8` | `rgb(204 134 2 / 50%)` | `#1e2328` | same as focus |
| Learned (4) | `#f8f9fa` | `#6d7680` | `#1e2328` | fill `#f1f3f4`, text `rgb(15 17 20 / 70%)` |
| Known | `#f4fcef` | `#42a564` | `#42a564` | fill `#ddf0d7` |

Keyboard focus uses a separate outline: `rgb(255 221 71 / 50%)` on New, Recognized, and Familiar, `rgb(109 118 128 / 50%)` on Learned, and `rgb(66 165 100 / 50%)` on Known.

The status menu uses the same button with its name beside the mark. It sizes to the label, with 6px between the mark and the name and 8px by 12px of padding. The chosen row uses 8px by 16px. The menu itself is white, radius 12, padding 8, with 4px between rows and a `0 8px 12px rgba(0, 0, 0, 0.1)` shadow.

An unsaved phrase groups the blue plus, Ignore, and Known in an elevated pill: `#f8f9fa`, radius 999, 2px of padding, 2px between buttons.

The full bar lays those 32px buttons out with space between them. On the long-press card the bar has 12px by 16px of padding and a `#f1f3f4` top border. On the large card the bar has 8px by 12px of padding, inside a footer that has 8px by 16px. Review uses the same bar, up to 450px wide, with 8px by 12px of padding and a 6px radius.
