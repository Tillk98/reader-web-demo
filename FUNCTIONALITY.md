# Reader functionality

In-memory demo. Nothing persists. Refresh re-rolls word statuses and clears phrases.

## Lesson text

- Words match letters and numbers. Punctuation stays outside the word frame.
- On load, ~75% of words are **Known**. The rest split evenly between **LingQs** (levels 1–4) and **New** (blue). Assignment is random per load, then stable.
- Multiple glosses render joined with ` ; `. A saved meaning replaces the glossary for that word.
- Phrase highlights use a stroke that does not change text layout.

## Status

| Status | Highlight |
| --- | --- |
| Ignored | Ignored |
| New | LingQ 1 |
| Recognized | LingQ 2 |
| Familiar | LingQ 3 |
| Learned | LingQ 4 |
| Known | Known |

A blue word’s label is already “New”, but it is not a LingQ until something below creates one.

Applying the status the word or phrase already has is a no-op: no write, no snackbar.

## Opening a word

- **Click** opens the small widget. Click the same word again to close it.
- **Click a blue word** creates a LingQ 1 and turns the highlight green, then opens the small widget.
- **Long-press (~480ms)** opens the medium widget. Movement over 8px cancels the press. The click that follows a long-press is ignored, so a long-press on a blue word does **not** create a LingQ.
- Scrolling the word out of view closes the small and medium widgets.
- Click outside or Escape closes the open widget. The snackbar is not an outside click.

## Small widget

Anchored 8px above the word, inside the text column. Flips below if it would leave the column, and clamps horizontally.

- Meaning wraps (max width ~300px). No ellipsis. Status chip and chevron stay vertically centered. Short meanings stay at least 50px tall.
- Status chip morphs into a horizontal status bar (50px tall). Back chevron returns to the meaning.
- Choosing a status applies it and closes the widget. Choosing the current status only closes it.
- Forward chevron opens the large widget.

## Medium widget

Long-press card, also kept inside the text column.

**LingQ** (saved word or saved phrase): meaning with an inert play button, status chip, chevron, tags, horizontally scrollable actions.

**New** (still-blue word, or an unsaved valid phrase): header “Suggested Meanings”, up to 2 glosses with a plus, tags, dictionary row (Google Translate, Linguee, DeepL, WörterBuch). No status chip.

- Tags and dictionary buttons are visual only.
- Actions row scrolls by swipe or click-and-drag. A drag does not fire the button.
- **Ignore** and **Known** update status and close the widget.
- Status chip opens a vertical labeled menu, clamped to the text column. Any choice collapses the menu and leaves the widget open.
- Forward chevron opens the large widget.
- **Select Phrase** starts phrase selection.

## Large widget

Centered in the lesson column, 400×600 (shrinks if the column is shorter). Not anchored to the word.

- Shows the term, meanings, the full sentence, and its English translation. Original sentence clamps to 2 lines. Translation does not. German transliteration is hidden.
- **New** variant (blue word, or unsaved valid phrase): up to 3 suggested meanings with a plus, plus the dictionary row.
- Saving a meaning creates a LingQ 1 and **keeps the widget open**, switching it to the saved form.
- Footer status bar updates the word or saved phrase and leaves the widget open.
- Click outside or Escape closes it.
- Play, copy, generate, section chevrons, tags, dictionaries, and the panel button are visual only.

## Select phrase

1. **Select Phrase** closes the medium widget, doubles the start word’s stroke, and shows “Select another word to create a phrase.” at the bottom center of the lesson text.
2. The next word click selects the inclusive span. Clicking the start word again does nothing.
3. A phrase is valid when it is 2–9 words, in one paragraph, with no `.` `!` `?` strictly between the ends. Trailing punctuation after the last word is part of the phrase text.
4. **Valid:** span highlights as a new word, and the medium widget opens in the new-word state with two suggested meanings. Saving one creates a LingQ 1 phrase, highlights the span as that LingQ, and closes the widget (unless the large widget is open, in which case it stays open in the saved form).
5. **Invalid** (over 9 words, a sentence break, or a cross-paragraph span): grey highlight and an error card where the medium widget would be. The card shows the phrase text, **Cancel**, and **Google Translate** (`sl=de`, `tl=en`).
6. Click away, **Ignore**, or **Known** on an unsaved phrase cancels it. Nothing is saved and no snackbar appears.
7. Click a saved phrase to open the small widget. Long-press opens the medium widget. Status changes apply to the phrase.

Known phrase meanings come from a small glossary. Anything else falls back to word-by-word glosses.

## Status snackbar

Shown at the bottom center of the lesson text (same slot as the phrase hint) after every real status change:

- Clicking a blue word into a LingQ
- Saving a suggested meaning (word or phrase)
- Ignore, Known, or any status-bar choice that actually changes status

It shows that status’s chip and name. One snackbar at a time; a newer change replaces it.

- Fades up, holds, then fades and drifts down. Gone after **2.5s** (fade-out starts at 2.1s).
- Click undoes **only the latest** change. Undo does not show another snackbar.
- Dismissing an unsaved phrase does not show one.

## Still inert

Reader chrome (nav, header, paging, coins, streak), audio, copy, generate, notes, tag editing, dictionary links inside the widgets, and section chevrons.
