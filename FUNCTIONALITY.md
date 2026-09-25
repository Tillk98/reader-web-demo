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
- The panel button docks this widget into the side panel. Play, copy, generate, notes, tag editing, dictionary links, and section chevrons are visual only.

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

## Reading modes

Page, sentence, and scroll. The mode control sits in the center of the bottom bar. With the expanded player open, the same menu sits in the player.

- **Page:** the lesson text is 550px tall. Overflow is hidden. Paragraphs that do not fit move to the next page. Left and right controls change page.
- **Sentence:** one sentence, with its translation when Show Translations is on. Left and right controls change sentence. Entering sentence mode starts at the first sentence.
- **Scroll:** the full lesson scrolls. Page controls are hidden.

Switching to page mode from scroll or sentence while the expanded player is open and playing asks “Video will be stopped.” Cancel stays put. Continue stops playback, closes the player, and switches to page.

Sentence mode lists the sentence’s LingQs as term cards under the text. A card’s status button opens the same vertical status menu as the medium widget. Tapping the card opens the large widget, or updates the side panel when that panel is already open.

## Lesson chrome

- The lesson progress bar floats in the lesson header, centered with the text, more, and panel buttons. It shrinks before it meets those buttons. The track is `#F1F3F4`. It hides while video is showing so the video can sit in that space.
- Page and sentence controls are the full tall hit target, inset 12px from the screen edges. Hover is `#f4f6f7`, pressed is `#e8ecee`.
- The **Aa** menu changes theme and font. Visual only.
- The **ellipsis** menu (page, sentence, and scroll) includes Show Translations. The first item sits against the lesson header.
- Scroll mode fades the lesson text at the top and bottom. Words under the fade stay clickable. At the top of the scroll, the first line is not faded. The last line can scroll clear of the bottom fade.
- With video open in sentence mode, the same top fade sits above the sentence.

## Bottom bar

Default bar: play on the left, mode and vocabulary in the center, Ask Lynx on the right. Items sit 16px above the bottom of the screen. The center group is vertically centered with play and Lynx.

- **Play** morphs into the collapsed player. Pause on the collapsed player stops playback and returns to the play button.
- **Expand** opens the full player and, if the lesson is in page mode, switches to scroll. Video shows in scroll and sentence, not in page mode.
- Pause in the expanded player keeps it open and shows the paused video frame. Collapse returns to the collapsed player if audio is still playing, otherwise to the play button.
- The expanded player’s ellipsis opens a menu above the button (lesson, Auto-Advance, Playback Speed, Timer, Loop Audio, Theme, Settings, and Chat with Lynx). Toggles are local and visual. Outside click or Escape closes it. The same menu works on the collapsed player.

## Side panel

The panel button docks the large widget on the right and shifts the lesson text left. Opening it with no word selected uses the first visible word and creates a LingQ if that word is still blue.

- Clicking another word does not close the panel. The panel updates to that word, and the small widget still opens. The small widget’s forward chevron is hidden while the panel is open.
- Clicking the same word toggles only the small widget.
- A status change or clicking outside the small widget hides the small widget only.
- Closing the panel returns to the centered lesson column.

## Lynx

The whole Ask Lynx pill opens the chat, including the icon and padding. The click highlight is blue.

- In the default bottom bar, the field morphs into a panel in the same right-hand column as the word panel, sharing the field’s bottom edge. The footer field hides while the chat is open.
- With the expanded player open, Lynx opens from the player’s Lynx button and sits above the player.
- If the word panel is already open, it contracts to its header and status footer and Lynx fills the rest. Closing Lynx expands the word panel again.
- Suggestions and the composer are local. Sending or tapping a suggestion appends the message. There is no AI backend. The mic button is visual. The downward chevron closes the chat.

## Still inert

Header pills (coins, streak, language count), vocabulary button, copy, generate, notes, tag editing, dictionary links inside the widgets, section chevrons, and the audio menu’s speed, timer, theme, settings, and help rows. Auto-Advance and Loop Audio remember their toggles for the session only.
