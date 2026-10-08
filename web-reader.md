# Web reader

In-memory demo. Nothing persists. Refresh re-rolls word statuses and clears phrases.

This file is the source for how the reader behaves and how it is drawn. Where the demo differs from Figma, match the demo.

## Lesson text

- Words match letters and numbers. Punctuation stays outside the word frame.
- On load, ~75% of words are **Known**. The rest split evenly between **LingQs** (levels 1–4) and **New** (blue). Assignment is random per load, then stable.
- Multiple glosses render joined with ` ; `. A saved meaning replaces the glossary for that word.
- LingQ and blue highlights have no border until that word is open in a popup. Hover does not add one. An open LingQ, including Learned, takes a `#dea201` border. An open blue word takes `--fg-secondary`. An open Known or Ignored word takes `--fg-muted`.
- Phrase highlights use a stroke that does not change text layout.
- The reading column is 620px wide and centered, with no horizontal padding, so the paragraph box is 620px. Body text is 18px regular with a 36px line height. Paragraphs are separated by 36px. Each word has 1px of vertical padding and none on the sides. Page, scroll, and the sentence itself use this same text. The English line in sentence mode, when shown, is 16px regular, `#49525B`, with a 20px line height. Learned, Known, and Ignored words have no fill.

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

**LingQ** (saved word or saved phrase): meaning with an inert play button, chevron, tags, a Select Phrase action, and the full status bar along the bottom. Ignore and Known are not repeated as buttons while that bar is showing.

**New** (unsaved valid phrase): header “Suggested Meanings”, up to 2 glosses with a plus, tags, dictionary row (Google Translate, Linguee, DeepL, WörterBuch). No status chip. A blue word is already a LingQ before this card opens.

- Tag and dictionary rows match. Each is a white leading icon button, then chips (radius 4). Tags are `#F8F9FA`. Dictionary chips are `#FBFCFD`. Labels are 12px regular, `#49525B`. The large widget uses the same rows. Both are visual only.
- Actions row scrolls by swipe or click-and-drag. A drag does not fire the button.
- **Ignore** and **Known** appear only when the status bar is hidden, on an unsaved phrase. They update status and close the widget.
- The status bar is visible by default, under the actions. Choosing a status updates the word and leaves the widget open.
- Forward chevron opens the large widget.
- **Select Phrase** starts phrase selection.

## Large widget

Centered in the lesson column, 400×600 (shrinks if the column is shorter). Not anchored to the word.

- Shows the term, meanings, the full sentence, and its English translation. Original sentence is regular and italic, and clamps to 2 lines. Translation is not italic and does not clamp. German transliteration is hidden.
- Header and footer are white. Each section (Meanings, Sentence, Notes) keeps its header outside a `#F8F9FA` card, radius 12, with 12px padding on the left and right.
- Section labels are 14px regular, `#49525B`, 18px line height. Icons and chevrons are 16px. Lucide strokes are 1.33. The Sentence icon is the custom image at 16px.
- The reader's default grey buttons, including these section chevrons, are `#F8F9FA`. Borders and the meaning dividers are `#F1F3F4`.
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
- Theater mode hides it, so it does not sit on the line under the video.

## Reading modes

Page, sentence, and scroll. The mode control sits in the center of the bottom bar. The same menu opens from the player.

In the player the control is a white pill, 40px tall, radius 999, no shadow, with 10px of padding on either side and 8px between the marks. It shows the mode icon and the up-down chevron, both 20px, and not the mode name. The icon is `--fg-default` (`#0a0a0a`). The chevron stays `--fg-muted`. That control is in the expanded player at every width, and in the collapsed player only below 767px.

- **Page:** the lesson text fills the space between the lesson header and the bottom bar. Overflow is hidden. A page ends on the last line that fits, so a paragraph can continue on the next page. Left and right controls change page. The controls stay vertically centered on the text.
- **Sentence:** one sentence, with its translation when Show Translations is on. Left and right controls change sentence. Entering sentence mode from page starts at the first sentence. When the play choice is video, that also opens the video paused. With no video, the sentence block is centered in the text area. With video stacked above the text, it starts at the top.
- **Scroll:** the full lesson scrolls. Entering scroll mode from page opens the video paused when the play choice is video. Page controls are hidden, but above 767px they still occupy their 52px columns so the text stays aligned with page and sentence mode. Below 767px those columns leave the layout. The text keeps the 12px screen inset and uses the rest of the width. Switching between sentence and scroll keeps the video and the player as they are, including when the player has been closed.

Switching to page mode from scroll or sentence while the video is showing asks “Video will be stopped.” Cancel stays put. Continue stops playback, closes the player, and switches to page.

Sentence mode lists that sentence’s LingQs at levels 1–3 (New, Recognized, and Familiar) as term cards under the text. Learned, Known, Ignored, and unsaved blue words are not cards. A card is at least 100px wide, with 8px of vertical padding and 12px on the sides. The status button and the text are 12px apart. The term is 16px regular with a 20px line height, and the meaning is 14px medium with an 18px line height, with no gap between them. Selecting that word in the sentence scrolls the row so the card is the first one, and the card’s stroke pulses once in the LingQ 1 gold (`#dea201`). A card’s status button opens a vertical status menu. Tapping the card opens the large widget, or updates the side panel when that panel is already open.

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

The site header has no extra fill and no bottom border. Below 767px the language pill (flag and word count) hides. The streak pill stays. The lesson header has 12px of padding on top and 16px on the bottom. The bottom bar has 24px of padding on top and 16px on the bottom. There is no extra gap between the site header and the lesson header, between the lesson header and the lesson text, or between the lesson text and the bottom bar. The lesson header keeps that layout whether or not video is showing.

- **Exit** sits on the far left of the lesson header, opposite the Aa, ellipsis, and panel buttons. Same 45px icon button, radius 6, 24px icon. Lucide log-out, flipped so the arrow points left. Inset 12px. It leaves the lesson and returns to where that lesson was opened.
- The lesson progress bar matches the lesson text: 620px max, the same left edge, and the same width when that fits. It keeps the same clearance from the buttons on the right as it keeps from the exit button, and shortens from the right when the text would run underneath them. The track is `#F8F9FA`. The fill stays green. It stays in the lesson header whether or not video is showing. The video begins under that header.
- Below 1024px the side-panel button in the lesson header hides, and an open side panel closes. The progress bar then clears only the Aa and ellipsis buttons.
- Page and sentence controls are the full tall hit target, inset 12px from the screen edges. Hover and pressed fills are `#F8F9FA`.
- The **Aa** button opens the theme menu. The **ellipsis** in the lesson header is vertical, the same mark as in the player, and opens the lesson menu. Both are described under Menus.
- Scroll mode fades the lesson text at the top and bottom. Words under the fade stay clickable. At the top of the scroll, the first line is not faded. The last line can scroll clear of the bottom fade. Menus opened from the bottom bar paint above that fade.
- With video open in sentence mode, the same top fade sits above the sentence.

## Menus

Above 767px, list menus share one row. The row is 36px. The label is 14px medium with an 18px line height. Lucide icons are 16px with a 1.5px stroke. The icon and the label are 8px apart, and the icon sits 12px in from the menu edge. Rows sit against each other. A divider is a 1px line with 4px above and below it.

That row is the lesson menu, the audio menu, the mode menu, review menus, and the play split menu. The mode marks stay the mode icons. The theme menu is not this row. It keeps its color swatches and font cards. The text size slider’s track is `#F8F9FA`. Its fill and thumb stay `#D1D6D9`.

Below 767px those list rows are a 48px button with 4px of padding above and below, and 12px of padding inside the button. Text stays 14px medium. Icons stay 16px with a 1.5px stroke. The theme menu, the lesson menu, and the audio menu open as bottom sheets. A 36×4 `#D1D6D9` handle sits on the top edge. Dragging it down, or pressing it, closes the sheet. The mode menu and the vocabulary menu stay anchored to their buttons.

### Lesson menu

The menu is 360px wide. It does not scroll, so Download can open beside it. The first item sits against the lesson header. On-state switches are `#2E75CD`.

In sentence mode, Edit Sentence is first. Then Show Translations, Regenerate Lesson (AI), and Simplify Lesson (AI). Then Edit Lesson, Unsubscribe, Refresh Lesson, Print Lesson, Download, and Add to Playlist. Then Settings, Statistics, and Help. Demo settings is last, under its own divider.

Unsubscribe, under Edit Lesson, is `#DD2525` with a crossed-out bell. It does nothing. Download, under Print Lesson, shows a muted chevron. On a wide screen, hovering or focusing it opens a menu to the left, 8px away and 220px wide: Download Audio and Download SRT File, each with the same download icon. Below 767px, tapping Download opens those two items inside the sheet. Neither downloads a file. Statistics, a column chart, sits between Settings and Help and does not open stats. Settings does nothing.

Demo settings uses a flask icon. It opens a placeholder dialog in the center of the screen over a black scrim at 10% opacity. It is not part of the reader. Clicking the scrim or pressing Escape closes it. Lesson type is a segmented control on a `#F8F9FA` track. The selected segment is white, with `--fg-secondary` text. The options are Video, Audio Only, and Audio & Video, and Video is the default.

- **Video.** The play control is the YouTube icon. Play in page mode switches to scroll and starts the video. Entering sentence or scroll from page opens the video paused. Switching to page while the video is showing asks “Video will be stopped.”
- **Audio Only.** The play control is the Play icon. Play stays in the current mode, including page. There is no video, no split view, and no page-mode prompt. The dismiss tooltip reads “Dismiss audio”.
- **Audio & Video.** The play control is a split pill, 48px tall: a 48px icon button, a 1×34 divider, and a 40px chevron. The shadow sits on the pill. The last choice stays on the button, and the other choice is in the chevron menu. Video is the default, so the button starts as the YouTube icon and the menu is Play audio. Play audio stays in the current mode and does not show the video. After that, closing the player leaves the Play icon on the button, and Play video moves into the menu. Choosing video again swaps them back. Closing the player does not forget that choice. Entering sentence or scroll from page opens paused video only while that choice is still video.
- Switching lesson type closes the player, collapsed or expanded, and restores that type’s default. Video and Audio & Video return to the YouTube icon. Audio Only returns to the Play icon.

### Audio menu

The more control is a vertical ellipsis, in the expanded player and the collapsed player. Its rows use the shared menu row. On a wide screen the menu opens upward and scrolls once it is taller than 560px, or taller than the viewport minus 96px. Opened from the collapsed player, it grows to the right of the ellipsis so it stays on screen. Below 767px it is the bottom sheet described above.

The items are the lesson, Auto-Advance, Playback Speed, Timer, Loop Audio, Theme, Settings, and Chat with Lynx. When the lesson has video, the collapsed player’s menu also has Split view and Theater mode, switches after Loop Audio. An audio-only lesson hides both switches, and hides the expanded player’s Split view and Theater mode buttons. Those switches use the same `#2E75CD` on state. Split view and theater mode are kept for the session. The other toggles are local and visual. Outside click or Escape closes the menu.

## Bottom bar

Default bar: play on the left, mode and vocabulary in the center, Ask Lynx on the right. Items sit 16px above the bottom of the screen. The center group stays horizontally centered as the bar narrows. Play and Ask Lynx are 48px circles: white, no border, 24px marks, shadow `0 4px 6px rgba(0,0,0,0.08)`. Icons in this default bar are 24×24. Its chevrons are 20px. The center group is a pill (radius 999), the same white fill and shadow, padding 6px 12px, gap 10px. A 1px divider in `--border` (`#F1F3F4`) stretches the height of that pill between the mode control and the vocabulary section. The mode label is 14px medium with an 18px line height. Its hover fills the 48px control, with 12px of padding on either side, the same inset as a 24px icon in a 48px circle. The pill’s 6px padding stays clear of that fill. The collapsed player is its own pill, at least 300px wide, with shadow `0 4px 12px rgba(0,0,0,0.08)`.

Below 767px the mode control drops its label and keeps the mode icon plus the up-down chevrons. On that same width, an open player replaces the center group and Lynx with the player stretched across the bar.

- **Play** morphs into the collapsed player and starts the video. Choosing sentence or scroll from page opens that same player with the video paused. When the lesson includes video and is in page mode, the play button switches to scroll so the video can show, and starts playback. That button uses the Lucide YouTube icon, still 24px with a 1.5 stroke. For Audio & Video the control is a split pill: the last choice stays on the button, and the other choice is in the chevron menu. Video is the default, so the button starts as the YouTube icon and the menu is Play audio. After Play audio, closing the player shows the Play icon, and the menu is Play video. When the lesson is audio only, or Play audio is chosen, Play uses the Play icon and starts audio in the current mode, including page mode, without showing video. Pause in the collapsed player stops playback and leaves the video and the player up. The play icon returns in the same pill.
- **Expand** opens the full player. It does not start playback. When the play choice is video and the lesson is in page mode, expanding switches to scroll. An audio choice stays in the current mode. Video shows in scroll and sentence while the player is open, not in page mode. The expanded player is one full-width bar with a 1px top border, not a pill.
- **Close** hides the video, stops playback, and brings back the play button. The reading mode stays. On desktop and tablet the control is a muted X, 16px in a 40px circle, the same quieter size and `--fg-muted` color as the mode and vocabulary chevrons. It sits after the expand chevron. Below 767px that X is hidden. A 36×4 handle, `#D1D6D9`, sits centered on the top edge of the full-width player. Each drag moves one step. Dragging the collapsed handle up opens the expanded player. Dragging the expanded handle down returns to the collapsed player. Dragging the collapsed handle down, or clicking or pressing it, closes the player. Clicking or pressing the expanded handle collapses it. Escape closes the player when no menu or dialog is open.
- Pause in the expanded player keeps it open and shows the paused video frame. Collapse returns to the collapsed player, whether or not audio is playing.

### Collapsed player

[AudioPlayer (Web)](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=5700-84606)

- No lesson thumbnail, title, or course. The card is a pill: radius 999, padding 6px 12px, no border, white. Its shadow is `0 4px 12px rgba(0,0,0,0.08)`. Pause and the other controls sit at opposite ends.
- Pause is a 48px circle with a 24px icon and no border or shadow of its own. On desktop and tablet it sits at the left, and toggles between play and pause. Replay is 10 seconds. Replay, the more menu, the expand chevron, and a muted close X sit at the right, gap 10px. Those are 40px circles. Replay and expand are 20px icons (1.5px stroke where the icon is stroked). The close X is 16px, in `--fg-muted`. The pill is at least 300px wide.
- Expand control is a right chevron (20px), after a 1px divider the height of those 40px controls. The close X follows it, 16px and `--fg-muted`. Hovering or focusing either control shows a tooltip above it: “Expand player” on the chevron, and “Dismiss video” on the X. In an audio-only lesson that tooltip reads “Dismiss audio”.
- Below 767px the card fills the bar. Pause comes first, then the same replay control as on wider screens, both on the left. The ellipsis, mode, and Lynx sit on the right, in that order. The divider, the expand chevron, and the close X are hidden. A drag handle sits centered on the top edge. Dragging it up expands the player. Dragging it down closes the player. Tapping the card, outside its buttons, expands the player.
- On desktop and tablet, the mode and vocabulary group stays centered while more than 16px remains between it and the collapsed player. When the player would come closer, the group shifts right until that gap is 16px. It stops 16px short of Lynx. Below 767px the player takes the whole bar and that center group hides.
- Progress is a 4px line on the bottom edge of the pill. The track is `#F8F9FA`. The fill is `#2E75CD` and 76px wide. The line is clipped to the pill, so the ends follow the curve.
- The pill itself does not clip overflow. Only the progress line is clipped, so the audio menu can float above the pill.

### Expanded player

[AudioPlayer (Web), expanded](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=4943-37538)

- No lesson thumbnail, title, or course in this bar.
- Progress is a full-bleed 4px track on the top edge. The track is `#F8F9FA` and the fill stays blue. No thumb. No `0:00` / duration labels on either side of a scrubber.
- Time is one muted label in the control row (`03:30 / 20:45`), after a 1px divider. Footnote Medium, `--fg-muted`.
- Transport order: pause, back 5, forward 5, repeat, then the timestamp, kept as one group so a narrower window closes the space before the right cluster instead of letting repeat overlap the skip buttons. Nothing divides repeat from the timestamp. The timestamp sits in the same 48px surface pill as the actions on the right: radius 999, fill `#F8F9FA`, with 12px of horizontal padding. A space sits on each side of the slash. Play and pause stay a 48px pill with Play’s shadow (`0 4px 6px rgba(0,0,0,0.08)`) and a 24px icon. Every other control is a 40px pill with the same white fill and no shadow. Icon buttons are circles. The mode control is a wider pill, 40px tall, with 10px of padding on either side. Icons are 20px, with a 1.5px stroke where the icon is stroked. Chevrons are 20px. The row stays tall enough for the 48px play control, and the 40px controls sit centered on it. Controls in the row are 16px apart.
- Hover fill is `#F8F9FA`. An icon button that toggles, including Split view and Theater mode, uses a light blue fill (`#F1F7FE`) and a blue icon (`#2E75CD`) while it is on.
- Right cluster: the actions pill, the mode control, Lynx, a divider, and the collapse chevron. The divider sits between Lynx and the collapse chevron. The pill is 48px tall, radius 999, fill `#F8F9FA`, padding 4px 8px, gap 8px. Inside it, left to right: Split view, Theater mode, speed (`1x`, 14px semibold), and the vertical ellipsis. Buttons in the pill have no fill of their own until hover. Split view hides while theater mode is on. The mode control is the icon and chevron only. Horizontal padding of the bar is 16px, not 24px.
- Lynx is a 40px circle with a 20px mark.
- The more control opens the audio menu. See Menus.
- **Split view** gives the video and the text equal halves of the lesson area, with 24px between the video and the text and 12px between each half and the chevron column beside it. Turning it on or off animates for about 560ms, the same ease as theater mode: the video and the text glide between the stacked layout and the two halves. Reduced motion changes the layout immediately. The video stays on the left and keeps its shape, centered in its half. The text uses the full height of the right half, and the sentence ticker stays inside that half. In sentence mode the sentence, its controls, and the ticker are centered vertically in that half, and sit at the top again if they are taller than the half. Below 767px the control is hidden and the video stays stacked above the text, with the sentence at the top of the text. In the expanded player the same switch is a 40px button in the actions pill, with a 20px columns icon. While on, the icon is `#2E75CD` and the fill is `#F1F7FE`. It hides while theater mode is on.
- **Theater mode** is separate from the video’s own fullscreen. It is available when the lesson has video: a switch in the collapsed player’s menu, and a 40px button in the expanded player’s actions pill, after Split view. That button uses Lucide Maximize at 20px, and switches to Minimize while theater mode is on. Split view hides while this is on. Turning it on hides the site header, keeps the lesson header, and opens the expanded player. That change animates: the site header fades upward, the lesson header slides into its place, and the video and the line ease together into the center. Leaving animates back the same way. The reading mode does not change. The video grows, stays centered horizontally, and keeps its own shape, so the frame has no black side bars. The video and the text sit together in the center of the lesson area, with 24px between them in page, sentence, and scroll. Under the video is one line of lesson text, the first line that was on screen when theater mode opened, and the translation under that when Show Translations is on. Both lines are centered. That line stays frozen for the demo. It does not advance, and the page and sentence chevrons are hidden. The lesson line never wraps. If it is longer than the column, words drop from the end until the line fits. Narrowing the page drops more words, so the line gets shorter instead of running off the page. There is no ellipsis. The translation is only for the words still on that line, not the rest of the sentence they belong to. It uses the same column and may wrap to a second line. Words on that line keep the same tap behavior as the rest of the lesson. A soft line runs under the lesson text, below the word highlights. It fades from the page color to blue and back to the page color, travels off one end of the sentence, and comes back in from the other end. That loop stays on the same sentence and is only for the demo. It is not synced to playback, and it does not move on to the next line. Escape or the theater control leaves theater mode and keeps the expanded player. Collapsing the player also leaves theater mode. An audio-only lesson hides the control.
- Below 767px the expanded player stacks. Play and pause stay 48px, and the other controls stay 40px. A drag handle sits centered above the controls. Dragging it down returns to the collapsed player, and leaves theater mode if it was on. Back, play, and forward sit centered on the first row. The next row is the vertical ellipsis, theater mode, speed, mode, and Lynx, spread across the width. The collapse chevron is hidden here, because the drag handle returns to the collapsed player. Repeat and Split view are not on this layout. The progress track is full width along the bottom. While it is dragged, `12px` regular timestamps sit just above it: the current time on the left and the duration on the right. They hide when the drag ends.

### Vocabulary button

One split control, not an icon and a separate chevron. Hidden while the player is open.

- A pill inside the center pill. No fill. No border. Horizontal padding 4px. The icon, divider, and chevron live in that one section.
- Icon half is 48×48. Chevron half is 40×40. Both are transparent so the section color shows through. The vocabulary icon does not use the blue toggle state.
- Divider is 1×34px and vertically centered. Color is `--border` (`#F1F3F4`).
- The icon starts the default review for the current reading mode. It does not toggle the list shut.
- The chevron opens Review actions and rotates 180° while that menu is open. 150ms ease. No transition when reduced motion is on. The search-type chevron in the vocabulary search field uses the same flip.
- Opening the mode menu or the review menu closes the other. Outside click or Escape closes it.

[Review actions](https://www.figma.com/design/dROMt3II5ySPNXRqUZrbjQ?node-id=530-8308) matches that frame’s items. On desktop the rows use the shared menu row. It opens upward, 16px above the split button, aligned to the button’s right edge.

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

The panel button docks the large widget on the right and shifts the lesson text left. Opening it while the large widget is open docks that word. Opening it otherwise opens the vocabulary list, including when only a smaller widget is open or a word was open earlier. It does not select a word or create a LingQ. The side-panel icon inside the panel does not use the blue toggle state. The header panel button hides while the list is open, same as while the large widget is docked.

- Clicking another word does not close the panel. The panel updates to that word, and the small widget still opens without its forward chevron. If the vocabulary list is what the panel is showing, the list gives way to that word’s panel.
- Clicking the same word toggles only the small widget.
- A status change or clicking outside the small widget hides the small widget only.
- Closing the panel returns to the centered lesson column. Below 1024px the panel closes on its own, since the side panel is not available at that width. From 768px to 1024px the vocabulary list still opens in that side column. Below 767px the vocabulary list opens as a bottom sheet instead, with the same drag handle as the other mobile sheets. Dragging that bar down, or pressing it, closes the list. The close control in the sheet header is an X, not the side-panel icon. The lesson column stays full width.
- The list closes from its own close control, or when a review overlay opens. Below 767px it is a bottom sheet rather than a side column.

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
- No back chevron. The header is the title, Clear, then the panel button. On the mobile sheet that last control is an X. Cancel is the way back.
- Clear is the text pill from [Filters, Clear](https://www.figma.com/design/dROMt3II5ySPNXRqUZrbjQ?node-id=524-7560): “Clear” plus a 16px refresh icon, gap 6px, padding 8px 12px, radius 999, `1px var(--border)`, 14/500/18, color `--fg-muted`. Hover `#F8F9FA`. Disabled text and icon are `#D1D6D9`. On press the icon spins one full turn (500ms), then the button shows disabled. Reduced motion skips the spin.

### Review button

Same blue button: `1px var(--fg-secondary)`, fill `#F1F7FE`, 14/500/18, 16px vocabulary icon. The label is the filtered count, not “Start Review”. Noun follows the terms filter. Singular when the count is 1.

## Lynx

[LynxChat](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=5871-55466)

The Ask Lynx circle in the bottom bar opens the chat. The click highlight is blue (`2px solid #2e75cd`), not green.

- The footer circle is the collapsed state of this panel. On desktop and tablet it morphs into a panel in the same right-hand column as the word panel. The panel’s bottom edge is the circle’s bottom edge. The footer circle hides while the chat is open.
- Below 767px the chat opens as a bottom sheet, the same shell as the vocabulary list. A drag handle sits on the top edge. Dragging it down, or pressing it, closes the chat. Opening the chat closes the vocabulary sheet, and opening the vocabulary sheet closes the chat.
- On desktop and tablet the close control is a downward chevron in the same circular outline button. On the mobile sheet the header matches the vocabulary sheet: `--surface` background, a 16px medium title, and the same circular X.
- Shadow is `0 -4px 12px rgba(0,0,0,0.08)`, same as the word panel. Not `0 4px 6 rgba(0,0,0,0.08)`.
- Border `1px #f1f3f4` and radius 16 match the docked word panel. Keep the two panels on the same values.
- With the expanded player open, Lynx opens from the player’s Lynx button and sits above the player.
- If the word panel is already open, it contracts to its header and status footer and Lynx fills the rest. Closing Lynx expands the word panel again.
- Suggestions and the composer are local. Sending or tapping a suggestion appends the message. There is no AI backend. The mic button is visual.

## Still inert

Header pills (coins, streak, language count), copy, generate, notes, tag editing, dictionary links inside the widgets, section chevrons, and the audio menu’s speed, timer, theme, settings, and help rows. Settings in the lesson menu does nothing. Demo settings opens the placeholder dialog. Auto-Advance and Loop Audio remember their toggles for the session only. Split view and theater mode change the video layout when the lesson has video. Theater mode’s moving underline loops on the same frozen line for the demo and is not synced to playback. Finish Lesson does not open stats. Manage Vocabulary only closes its menu. Vocabulary search submit, row audio, and the Course, Lesson, and Tags rows do nothing.
