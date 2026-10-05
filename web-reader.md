# Web reader

In-memory demo. Nothing persists. Refresh re-rolls word statuses and clears phrases.

This file is the source for how the reader behaves and how it is drawn. Where the demo differs from Figma, match the demo.

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
- **Click a blue word** creates a LingQ 1, then opens the small widget.
- **Long-press (~480ms)** opens the medium widget. On a blue word it first creates a LingQ 1, the same as a click, so the card opens in the LingQ state. Movement over 8px cancels the press. The click that follows a long-press is ignored.
- Scrolling the word out of view closes the small and medium widgets.
- Click outside or Escape closes the open widget. The snackbar is not an outside click.

## Small widget

Anchored 8px above the word, inside the text column. Flips below if it would leave the column, and clamps horizontally.

- Meaning wraps (max width ~300px). No ellipsis. Status chip and chevron stay vertically centered. Short meanings stay at least 50px tall.
- Status chip morphs into a horizontal status bar (50px tall). Back chevron returns to the meaning.
- Choosing a status applies it and closes the widget. Choosing the current status only closes it.
- Forward chevron opens the large widget. While the side panel is open, that chevron is hidden. The meaning row has nothing left to open.

## Medium widget

Long-press card, also kept inside the text column.

**LingQ** (saved word or saved phrase): meaning with an inert play button, status chip, chevron, tags, horizontally scrollable actions.

**New** (unsaved valid phrase): header “Suggested Meanings”, up to 2 glosses with a plus, tags, dictionary row (Google Translate, Linguee, DeepL, WörterBuch). No status chip. A blue word is already a LingQ before this card opens.

- Tag and dictionary rows match. Each is a white leading icon button, then chips (radius 4, fill `#FBFCFD`). Labels are 12px regular, `#49525B`. The large widget uses the same rows. Both are visual only.
- Actions row scrolls by swipe or click-and-drag. A drag does not fire the button.
- **Ignore** and **Known** update status and close the widget.
- Status chip opens a vertical labeled menu, clamped to the text column. Any choice collapses the menu and leaves the widget open.
- Forward chevron opens the large widget.
- **Select Phrase** starts phrase selection.

## Large widget

Centered in the lesson column, 400×600 (shrinks if the column is shorter). Not anchored to the word.

- Shows the term, meanings, the full sentence, and its English translation. Original sentence is regular and italic, and clamps to 2 lines. Translation is not italic and does not clamp. German transliteration is hidden.
- Header and footer are white. Each section (Meanings, Sentence, Notes) keeps its header outside a `#F6F8F9` card, radius 12, with 12px padding on the left and right.
- Section labels are 14px regular, `#49525B`, 18px line height. Icons and chevrons are 16px. Lucide strokes are 1.33. The Sentence icon is the custom image at 16px.
- The reader's default grey buttons, including these section chevrons, are `#F6F8F9`. Borders and the meaning dividers are `#F1F3F4`.
- Meaning dividers are inset from the left, in line with the text, and run to the right edge.
- Tags are not in the term header. They sit under the meanings. On a word that is not a LingQ they sit between the meanings and the dictionaries.
- **New** variant (unsaved valid phrase): up to 3 suggested meanings with a plus, tags between the meanings and the dictionary row.
- Saving a meaning creates a LingQ 1 and **keeps the widget open**, switching it to the saved form.
- Footer status bar updates the word or saved phrase and leaves the widget open.
- Click outside or Escape closes it.
- The floating card has no side-panel button. That button exists only on the docked panel. Docking is how the popup becomes the side panel.
- Play, copy, generate, notes, tag editing, dictionary links, and section chevrons are visual only.

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

- Clicking or long-pressing a blue word into a LingQ
- Saving a suggested meaning (word or phrase)
- Ignore, Known, or any status-bar choice that actually changes status

It shows that status’s chip and name. One snackbar at a time; a newer change replaces it.

- Fades up, holds, then fades and drifts down. Gone after **2.5s** (fade-out starts at 2.1s).
- Click undoes **only the latest** change. Undo does not show another snackbar.
- Dismissing an unsaved phrase does not show one.

## Reading modes

Page, sentence, and scroll. The mode control sits in the center of the bottom bar. With the expanded player open, the same menu sits in the player.

In the expanded player the mode control is not the filled chip. Transparent, radius 6, padding 6px, gap 10px. The active mode icon is `--fg-default` (`#0a0a0a`). The up-down chevron stays `--fg-muted`.

- **Page:** the lesson text is 550px tall. Overflow is hidden. Paragraphs that do not fit move to the next page. Left and right controls change page.
- **Sentence:** one sentence, with its translation when Show Translations is on. Left and right controls change sentence. Entering sentence mode starts at the first sentence.
- **Scroll:** the full lesson scrolls. Page controls are hidden.

Switching to page mode from scroll or sentence while the expanded player is open and playing asks “Video will be stopped.” Cancel stays put. Continue stops playback, closes the player, and switches to page.

Sentence mode lists the sentence’s LingQs as term cards under the text. A card’s status button opens the same vertical status menu as the medium widget. Tapping the card opens the large widget, or updates the side panel when that panel is already open.

## Finish lesson

Not in the reader Figma frames. On the last page, or the last sentence, the right chevron becomes a circle-check in the same tall control. Clicking it opens “Finish this Lesson?”.

- **Page and sentence:** the right paging control keeps its size (52px wide, up to 408px tall, radius 12). The chevron becomes a 16px circle-check. Fill `#F4FCEF`. Icon and 1px stroke are `#42A564`.
- **Scroll:** the side chevrons stay hidden. The same control lies flat under the text, full text-column width, 52px tall, radius 12, same fill and stroke. Label is “Finish Lesson” beside the check. 16px below the last line, 48px of space under the bar. It fades in only at the bottom of the scroll.

The confirm dialog is the design-system dialog, horizontal on wide screens and stacked below 768px:

- [Dialog, horizontal](https://www.figma.com/design/kLZpcEEsV9ZUCTBiipPN6y/LingQ-Design-System--Lynx-Fluent-?node-id=3502-820)
- [Dialog, vertical](https://www.figma.com/design/kLZpcEEsV9ZUCTBiipPN6y/LingQ-Design-System--Lynx-Fluent-?node-id=3502-840)

- Title “Finish this Lesson?”. Body “Confirm to wrap up this lesson and view your learning stats.” Primary button label is “Finish Lesson”, green `#42A564`.
- **Cancel**, the backdrop, or Escape closes it and stays in the lesson.
- **Finish Lesson** closes it. There is no stats screen yet.
- **Don’t show this again** applies only after Finish Lesson. Later finish clicks in that session do not open the dialog. Refresh clears it.
- Below 768px the actions stack full width, Cancel above Finish Lesson.

## Site header and lesson chrome

The site header has no extra fill and no bottom border. The lesson header sits 12px below it, the same gap the lesson header already has above the text. That gap closes while video is open, so the exit and panel buttons stay at the top of the video.

- **Exit** sits on the far left of the lesson header, opposite the Aa, ellipsis, and panel buttons. Same 45px icon button, radius 6, 24px icon. Lucide log-out, flipped so the arrow points left. Inset 12px, including when video collapses the header. It leaves the lesson and returns to where that lesson was opened.
- The lesson progress bar floats in the lesson header, centered with the exit, text, more, and panel buttons. It shrinks before it meets those buttons. The track is `#F1F3F4`. It hides while video is showing so the video can sit in that space. The exit button stays on the left in that state.
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

### Collapsed player

[AudioPlayer (Web)](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=5700-84606)

- Expand control is a single right chevron (18px), not chevrons-up-down.
- Progress track sits inside the card and is clipped to the bottom corners (`0 0 11px 11px`). It does not bleed 1px past the border, and it is not a full pill.
- The card itself does not clip overflow. Only the progress track is clipped, so the audio menu can float above the card.

### Expanded player

[AudioPlayer (Web), expanded](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=4943-37538)

- No lesson thumbnail, title, or course in this bar.
- Progress is a full-bleed 4px track on the top edge. No thumb. No `0:00` / duration labels on either side of a scrubber.
- Time is one muted label in the control row (`03:30 / 20:45`), after a 1px divider. Footnote Medium, `--fg-muted`.
- Transport order: pause, back 5, forward 5, repeat, `1x`. Pause is a 45px circle, 1px `--border`, white fill, shadow `0 2px 8px rgba(0,0,0,0.02)`, 20px icon.
- Other transport icons are 18px in 45px hit targets, radius 6. Hover fill `#f4f6f7`.
- Right cluster stays grouped: ellipsis, divider, mode, Lynx, collapse chevron. Horizontal padding is 16px, not 24px.
- Lynx is a plain 45px icon button (22px mark), not the 42px bordered circle.
- The ellipsis opens a menu above the button (lesson, Auto-Advance, Playback Speed, Timer, Loop Audio, Theme, Settings, and Chat with Lynx). Toggles are local and visual. Outside click or Escape closes it. The same menu works on the collapsed player.

### Vocabulary button

One split control, not an icon and a separate chevron. Hidden while the player is open.

- 36px tall, radius 8px. One fill for the whole button, `#FBFCFD`. Border `1px solid #F1F3F4`.
- Icon half is 40×36. Chevron half is 32×36. Both are transparent so the container color shows through.
- Divider is 1×16px and vertically centered. It does not run the full height. Color is `--fg-muted` (`#49525B`), not the border.
- The icon starts the default review for the current reading mode. It does not toggle the list shut.
- The chevron opens Review actions and rotates 180° while that menu is open. 150ms ease. No transition when reduced motion is on. The search-type chevron in the vocabulary search field uses the same flip.
- Opening the mode menu or the review menu closes the other. Outside click or Escape closes it.

[Review actions](https://www.figma.com/design/dROMt3II5ySPNXRqUZrbjQ?node-id=530-8308) matches that frame. It opens upward, 16px above the split button, aligned to the button’s right edge.

**Default for the icon, and for the Review button inside the list:**

- **Page mode** opens Page Vocabulary Review.
- **Sentence mode** opens Sentence Vocabulary Review.
- **Scroll mode** opens the vocabulary list in the side panel.

A menu choice overrides the mode.

- **Review Page**, **Review Due**, and **Review Lesson** open that review: Page Vocabulary Review, Due Vocabulary Review, or Lesson Vocabulary Review.
- **Vocabulary List** opens the list and closes any review overlay.
- **Manage Vocabulary** only closes the menu.

### Review overlay

Mock only. Not a card review.

- Centered in the lesson area, under the lesson header and above the bottom bar. Max 1000×750. Shrinks to stay inside that area, with 12px of the lesson area showing around it.
- Scrim covers the whole screen, black at 10% opacity.
- Close is an X in the card’s upper left, 12px from the card edges.
- Opening an overlay also closes the vocabulary list if that panel is open.

## Side panel

The panel button docks the large widget on the right and shifts the lesson text left. Opening it with no word selected opens the vocabulary list. It does not select a word or create a LingQ. The header panel button hides while the list is open, same as while the large widget is docked.

- Clicking another word does not close the panel. The panel updates to that word, and the small widget still opens.
- Clicking the same word toggles only the small widget.
- A status change or clicking outside the small widget hides the small widget only.
- Closing the panel returns to the centered lesson column.
- The list closes from its own close control, or when a review overlay opens.

## Vocabulary list

Saved phrases, plus lesson words that are a LingQ, Known, Ignored, or still blue. Blue words are listed as Blue, not as New. A word that is already a LingQ is not also listed as blue. Duplicates collapse by lowercase text.

Default filter: All terms, SRS Due off, statuses New, Recognized, and Familiar. Blue Words is not in the default, so the usual list is unchanged. The filter button is pressed only when the applied filter differs from that. Choosing every status, including Blue Words, is still an active filter.

- The count is the filtered list before search. All reads “25 terms”, Words “25 words”, Phrases “0 phrases”. Singular at 1. Search does not change it.
- **Cancel** drops the draft and returns to the list. **Apply** commits it. **Clear** restores the draft to the default. It is disabled when the draft already matches the default, including right after a clear. The refresh icon spins once first.
- **Select all** turns every status on, including Blue Words. When every status is already on, it turns them all off. Some selected shows the mixed checkbox. Chips toggle one status at a time.
- Words and Phrases split the list by saved phrase. SRS Due on shows nothing. This demo has no due dates.
- Search narrows the rows only. Contains matches the term or the meaning. Starts With and Ends With match the term. Source Text Containing matches the term. Meaning Containing matches the meaning. The match control hides once the field has text, and its chevron points up while the menu is open.
- Sort: Importance and Creation Date keep list order. Status runs Blue, New, Recognized, Familiar, Learned, Known, Ignored. A–Z and Z–A use German sort.
- A row’s status chip opens the vertical status menu and writes that status onto the phrase, or onto every lesson copy of the word. The usual snackbar appears. Choosing the current status does nothing. Row audio does nothing.
- The Review button uses the same count as the header: “Review 25 Terms”, “Review 5 Words”, “Review 1 Phrase”. It starts the same default review as the bottom-bar vocabulary button.
- Course, Lesson, and Tags do not open. The search submit does nothing.

### Filters

Status is chips, not a slider. Order: Blue Words (circle-plus), Ignored (eye-off), New 1, Recognized 2, Familiar 3, Learned 4, Known (check).

- Blue Words uses the same chip as the others. The filter chip icon is Lucide circle-plus. In the list, and on the status button, Blue uses Lucide plus, so the round status control is not a circle inside a circle.
- Chip: pill, padding 8px 12px, 14/500/18. Unselected is white, `1px #D1D6D9`, muted text. Selected is border and text `--fg-secondary`, fill `#F1F7FE`.
- Select all sits in the Status heading, opposite the label, space-between. Text first, then an 18px checkbox. Checked is `--fg-secondary` with a white check. Mixed is a blue dash on `#F1F7FE`. Empty is white with a `#D1D6D9` stroke. The label stays “Select all”.
- No back chevron. The header is the title, Clear, then the panel button. Cancel is the way back.
- Clear is the text pill from [Filters, Clear](https://www.figma.com/design/dROMt3II5ySPNXRqUZrbjQ?node-id=524-7560): “Clear” plus a 16px refresh icon, gap 6px, padding 8px 12px, radius 999, `1px var(--border)`, 14/500/18, color `--fg-muted`. Hover `#F4F6F7`. Disabled text and icon are `#D1D6D9`. On press the icon spins one full turn (500ms), then the button shows disabled. Reduced motion skips the spin.

### Review button

Same blue button: `1px var(--fg-secondary)`, fill `#F1F7FE`, 14/500/18, 16px vocabulary icon. The label is the filtered count, not “Start Review”. Noun follows the terms filter. Singular when the count is 1.

## Lynx

[LynxChat](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=5871-55466)

The whole Ask Lynx pill opens the chat, including the icon and padding. The click highlight is blue (`2px solid #2e75cd`), not green.

- The footer pill is the collapsed state of this panel. In the default bottom bar, the field morphs into a panel in the same right-hand column as the word panel. The panel’s bottom edge is the pill’s bottom edge. The footer field hides while the chat is open.
- Close control is a downward chevron in the same circular outline button, not an X.
- Shadow is `0 -4px 12px rgba(0,0,0,0.08)`, same as the word panel. Not `0 4px 6 rgba(0,0,0,0.08)`.
- Border `1px #f1f3f4` and radius 16 match the docked word panel. Keep the two panels on the same values.
- With the expanded player open, Lynx opens from the player’s Lynx button and sits above the player.
- If the word panel is already open, it contracts to its header and status footer and Lynx fills the rest. Closing Lynx expands the word panel again.
- Suggestions and the composer are local. Sending or tapping a suggestion appends the message. There is no AI backend. The mic button is visual.

## Still inert

Header pills (coins, streak, language count), copy, generate, notes, tag editing, dictionary links inside the widgets, section chevrons, and the audio menu’s speed, timer, theme, settings, and help rows. Auto-Advance and Loop Audio remember their toggles for the session only. Finish Lesson does not open stats. Manage Vocabulary only closes its menu. Vocabulary search submit, row audio, and the Course, Lesson, and Tags rows do nothing.
