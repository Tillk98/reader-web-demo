# Web reader

This file is how the reader behaves and how it is drawn.

The page background stays white, `--bg-page` (`#FFFFFF`). A gray fill that sits on that white is background elevated, `--bg-elevated` (`#F8F9FA`). A gray fill that sits on that gray is surface default, `--surface-default` (`#F1F3F4`). Lines and dividers stay `#F1F3F4`.

## Lesson text

- Words match letters and numbers. Punctuation stays outside the word frame.
- Each word shows the learner’s saved status: **Known**, a **LingQ** at levels 1–4, or **New** (blue).
- Multiple glosses render joined with ` ; `. A saved meaning replaces the glossary for that word.
- LingQ and blue highlights have no border until that word is open in a popup. Hover does not add one. An open LingQ, including Learned, takes a `#dea201` border. An open blue word takes `--fg-secondary`. An open Known or Ignored word takes `--fg-muted`.
- Phrase highlights use a stroke that does not change text layout.
- The reading column is 620px wide and centered, with no horizontal padding, so the paragraph box is 620px. Body text defaults to 18px regular with a 36px line height. The theme menu’s text size sets that size, and the line height stays twice the size. Paragraphs stay one line apart. Each word has 1px of vertical padding and none on the sides. Page, scroll, sentence, and the theater caption use this same lesson text. The English line, in sentence mode and in theater, is one text-size step smaller: 16px regular at the default, `#49525B` in sentence mode, with a line height of 1.25. At the smallest lesson size, 14px, the translation is 12px. Learned, Known, and Ignored words have no fill.

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

Applying the status the word or phrase already has leaves it unchanged, and does not show a snackbar.

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

**LingQ** (saved word or saved phrase): meaning with a play button, chevron, then one row with Select Phrase, a 30px divider, and the tags. The full status bar sits along the bottom. Ignore and Known are not repeated as buttons while that bar is showing. The chevron is hidden while the side panel is open. Play plays the term.

**New** (unsaved valid phrase): white header “Suggested Meanings” at 14px regular, chevron, up to 2 glosses with a plus and the same inset dividers, then the tags row, then the dictionary row. The full status bar sits along the bottom. A blue word is already a LingQ before this card opens, so this state stays in the code for an unsaved phrase.

- Tag and dictionary chips match: radius 4, `#F8F9FA`, 12px regular, `#49525B`. The add-tag button is a 16px icon with 9px padding, 4px from the chips. The dictionary button is the same size on a white fill. Dictionaries stay below the tags. Meaning rows use the same inset divider as the large widget. The add-tag button adds a tag. A dictionary chip opens that dictionary. The dictionary button opens the dictionaries page.
- Tag and dictionary rows scroll by swipe or click-and-drag. A drag does not fire the button.
- Select Phrase sits on the tags row in both states, before a 30px divider.
- The status bar is on both the LingQ and new-word cards. Choosing a status on a saved word updates it and leaves the widget open. Choosing a status on an unsaved phrase cancels it: nothing is saved and no snackbar appears.
- Forward chevron opens the large widget. While the side panel is open, that chevron is hidden.
- **Select Phrase** starts phrase selection.

## Large widget

Centered in the lesson column, 400×600 (shrinks if the column is shorter). Not anchored to the word.

- Shows the term, meanings, the full sentence, and its English translation. Original sentence is 16px regular, not italic, and clamps to 2 lines. Translation is 14px regular and does not clamp. The sentence card is at least 128px tall. German transliteration is hidden.
- Notes text is 16px regular, matching the meaning and sentence text. The notes icon is the notebook. A note from Lynx uses the Lynx-marked notebook.
- Header and footer are white. Each section (Meanings, Sentence, Notes) keeps its header outside a `#F8F9FA` card, radius 12, with 12px padding on the left and right.
- Section labels are 14px regular, `#49525B`, 18px line height. Icons and chevrons are 16px. Lucide strokes are 1.33. The Sentence icon is the custom image at 16px.
- The reader's default grey buttons, including these section chevrons, are `#F8F9FA`. Borders and the meaning dividers are `#F1F3F4`.
- Meaning dividers are inset from the left, in line with the text, and run to the right edge.
- Tags are not in the term header. They sit under the meanings. On a word that is not a LingQ they sit between the meanings and the dictionaries.
- **New** variant (unsaved valid phrase): up to 3 suggested meanings with a plus, tags between the meanings and the dictionary row.
- A saved word with no meanings left shows up to two suggested meanings in that card, with an Add meaning row under them. Choosing a suggestion shows Added, then saves it on the word. Saving a custom meaning from that row closes the widget. With no saved meaning, the status bar has nothing selected.
- Saving a meaning creates a LingQ 1 and **keeps the widget open**, switching it to the saved form.
- Footer status bar updates the word or saved phrase and leaves the widget open.
- Click outside or Escape closes it.
- The floating card has no side-panel button. That button exists only on the docked panel. Docking is how the popup becomes the side panel.
- The Meanings chevron opens the meanings page: saved meanings (with the same dividers), an Add meaning row, tags, then the dictionary row, then Suggested Meanings with a locale flag and a report button. Each suggestion shows the English flag and a blue plus. Hover fills that plus. Clicking anywhere on the row shows Added, then the meaning joins the saved list above. Back returns to the default page. The Add meaning row keeps the grey card when it is the only row. A saved meaning shows the English flag. Hovering it reveals remove. Clicking it edits the text. The check or Enter saves it: the check slides left and the row briefly reads Saved. Remove slides the X left and briefly reads Removed, then the meaning is gone. The Add meaning plus stays blue, and the label turns blue on hover. Clicking it starts a blank meaning. The same edit states are on the default page’s saved meanings.
- The Sentence chevron opens the sentence page: the current sentence, a horizontal row of the words in that sentence, and Past Encounters. Original sentences on this page, including past encounters, use the same 16px regular style and are not truncated. Translations are 14px regular. A saved word lists up to three other lesson sentences that contain it. A new word, or a word with no earlier sentence, shows the first-encounter note. Back returns to the default page.
- The dictionary icon opens the Dictionaries page: Preferred lists the current dictionaries, All Resources lists more with a plus, and the English flag sits on that heading. Section labels stay 14px regular. The status bar is hidden on this page. Back returns to the page the icon was on. Adding a resource adds it to Preferred.
- Play plays the term. Copy copies it. Generate asks Lynx for a note. The notes field saves the note. Adding and removing tags edits them. A dictionary chip opens that dictionary. The report button reports that suggestion.

## Select phrase

1. **Select Phrase** closes the medium widget, doubles the start word’s stroke, and shows “Select another word to create a phrase.” at the bottom center of the lesson text.
2. The next word click selects the inclusive span. Clicking the start word again leaves the selection unchanged.
3. A phrase is valid when it is 2–9 words, in one paragraph, with no `.` `!` `?` strictly between the ends. Trailing punctuation after the last word is part of the phrase text.
4. **Valid:** span highlights as a new word, and the medium widget opens in the new-word state with two suggested meanings. Saving one creates a LingQ 1 phrase, highlights the span as that LingQ, and closes the widget (unless the large widget is open, in which case it stays open in the saved form).
5. **Invalid** (over 9 words, a sentence break, or a cross-paragraph span): grey highlight and an error card where the medium widget would be. The card shows the phrase text, **Cancel**, and **Google Translate** (`sl=de`, `tl=en`).
6. Click away, or any status on an unsaved phrase, cancels it. Nothing is saved and no snackbar appears.
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

Page, sentence, and scroll. The mode control sits in the center of the bottom bar. On desktop and tablet the same menu opens from the player. While theater mode is on, that control leaves the desktop and tablet player. Below 767px the expanded player does not include it. The collapsed player on a phone does.

In the desktop player the control is the 24px mode icon, with 12px of padding. The icon is `--fg-default` (`#0a0a0a`). Clicking it opens the mode menu.

- **Page:** the lesson text fills the space between the lesson header and the bottom bar. When the player is open, that space ends at the top of the player, so the last line stays fully visible above it. Overflow is hidden. A page ends on the last line that fits, so a paragraph can continue on the next page. Left and right controls change page. The controls stay vertically centered on the text. Below 767px those controls leave the layout, the text keeps the 12px screen inset, and a horizontal swipe changes page.
- **Sentence:** one sentence, with its translation when Show Translations is on. Left and right controls change sentence. Entering sentence mode from page starts at the first sentence. Changing mode does not open the player or start the video. If the video is already showing, playback stays as it is. With no video, the sentence block is centered in the text area. With video stacked above the text, it starts at the top. The text area keeps 64px under the sentence block, so the last term row can scroll clear of the bottom. On the last sentence that space grows to clear the finish button. Below 767px the controls leave the layout, the text keeps the 12px screen inset, and a horizontal swipe changes sentence.
- **Scroll:** the full lesson scrolls. Changing to scroll mode does not open the player or start the video. If the video is already showing, playback stays as it is. Page controls are hidden, but above 767px they still occupy their 52px columns so the text stays aligned with page and sentence mode. Below 767px those columns leave the layout. The text keeps the 12px screen inset and uses the rest of the width. Switching between sentence and scroll keeps the video and the player as they are, including when the player has been closed.

Switching to page mode from scroll or sentence while the video is showing keeps the video playing. The video stays stacked above the text until Landscape is chosen, and only above 1024px. From 1025px to 1399px, opening the side panel stacks the video above the text, beside that panel, even while Landscape is selected. At 1400px and above, with Landscape on, the video stays beside the text while the panel is open. From 768px to 1024px, and at 767px and below, the video stays stacked.

Sentence mode lists that sentence’s LingQs at levels 1–3 (New, Recognized, and Familiar) under the text, in a two-column list. The columns are 16px apart. Below 767px the list is one column. Learned, Known, Ignored, and unsaved blue words are not rows. Each row has 8px of vertical padding and 12px on the sides, and a 1px `#F1F3F4` divider under it, with 16px before the next row. The last row has no divider. The list has no scroll of its own. It grows with the sentence, and the lesson column scrolls both together. The status button and the text are 12px apart. The term is one text-size step below the lesson, but never smaller than 16px or larger than 24px. At the default it is 16px regular with a 20px line height. The meaning is one step below the term, never smaller than 14px or larger than 24px. At the default it is 14px with an 18px line height, with no gap between them. The row’s status button stays 32px. A long term or meaning ellipsizes on one line. Selecting that word in the sentence scrolls the lesson so the row is in view, and the row’s stroke pulses once in the LingQ 1 gold (`#dea201`). A row’s status button opens a vertical status menu. Tapping the row opens the large widget, or updates the side panel when that panel is already open.

## Finish lesson

[Complete Lesson](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=7893-26313). On the last page, and on the last sentence, the control sits in the lesson column. The paging chevrons stay chevrons. On the last page and the last sentence the right chevron does not advance, and it is not the finish button.

- **Page:** the button is at the bottom of the last page only. It is the same width as the lesson text, 620px max. 16px of padding sits above it and below it, and page breaks keep the text out of that block. When the last page is already full, the lines that would meet the button move onto one more page. That page holds those lines, with the button at the bottom.
- **Sentence:** the button floats at the bottom of the lesson, above the bottom bar, at the same 620px max width. A short fade into the page background sits above it, and the sentence can scroll underneath. Extra space at the end of that scroll lets the last line clear the button. Side by side, the button matches the text column.
- **Scroll:** the side chevrons stay hidden. The same button lies under the text, full text-column width. 16px below the last line, 48px of space under the button. It fades in only at the bottom of the scroll.

The button is full width: fill `#F4FCEF`, 1px stroke and label `#42A564`, radius 6, padding 10px by 16px, 8px between icon and label. The label is “Finish Lesson”, 16px medium with a 20px line height. The icon is a 20px circle-check. On the last page and the last sentence it fades and eases up into place. Hovering lifts it slightly and shows a soft shadow underneath. Pressing settles it back down. Clicking it opens the lesson complete page. There is no confirm dialog. Menus opened from the bottom bar paint above this control.

## Site header and lesson chrome

The site header has no extra fill and no bottom border. The coins pill, the streak pill, and the language pill each open that screen. Below 767px the language pill (flag and word count) hides. The streak pill stays. The lesson header has 12px of padding on top and 16px on the bottom. The bottom bar has 24px of padding on top and 16px on the bottom. Left and right padding is 32px, and 16px below 767px. There is no extra gap between the site header and the lesson header, between the lesson header and the lesson text, or between the lesson text and the bottom bar. The lesson header keeps that layout whether or not video is showing.

- **Exit** sits on the far left of the lesson header, opposite the Aa, ellipsis, and panel buttons. Same 45px icon button, radius 6, 24px icon. Lucide log-out, flipped so the arrow points left. Inset 12px. It leaves the lesson and returns to where that lesson was opened.
- The lesson title and the course name both truncate with an ellipsis. The lesson progress bar matches the lesson text: 620px max, the same left edge, and the same width when that fits. Below 767px the bar sits between the exit button and the header actions, with 12px of clearance on each side. It keeps the same clearance from the buttons on the right as it keeps from the exit button, and shortens from the right when the text would run underneath them. The track is `#F8F9FA`. The fill stays green. It stays in the lesson header whether or not video is showing. The video begins under that header.
- Below 1024px the side-panel button in the lesson header hides, and an open side panel closes. The progress bar then clears only the Aa and ellipsis buttons.
- Page and sentence controls are the full tall hit target, inset 12px from the screen edges. Hover and pressed fills are `#F8F9FA`. Below 767px they are hidden, and the text uses that space while staying 12px from the screen edges.
- The **Aa** button opens the theme menu. The **ellipsis** in the lesson header is vertical, the same mark as in the player, and opens the lesson menu. Both are described under Menus.
- Scroll mode fades the lesson text at the top and bottom. Words under the fade stay clickable. At the top of the scroll, the first line is not faded. The last line can scroll clear of the bottom fade. Menus opened from the bottom bar paint above that fade.
- With video open in sentence mode, the same top fade sits above the sentence.

## Menus

Above 767px, the play split menu row is 36px. The label is 14px medium with an 18px line height. Lucide icons are 16px with a 1.5px stroke. The icon and the label are 8px apart, and the icon sits 12px in from the menu edge. Rows sit against each other. A divider is a 1px line with 4px above and below it.

The mode menu and the vocabulary menu use the reader-menu row, without the lesson header. On a wide screen that row is 38px, with 10px of padding and a 6px radius. The icon is 16px, 8px from the label. The label is 14px medium with an 18px line height. Hover and pressed fill `#F8F9FA`. The current mode keeps that fill. Groups have 6px of padding. A divider between groups is a full-width 1px `#F1F3F4` line, so that padding sits above and below it. The vocabulary menu’s second group is Manage Vocabulary. Below 767px these two menus stay anchored to their buttons and keep this row.

The reader menu and the audio menu use the same row. Below 767px that row is 48px, with 12px of horizontal padding. The icon grows to 18px and sits 12px from the label. A submenu chevron is 12px and `--fg-muted` on a wide screen, and 14px below 767px.

The theme menu is not this row. It keeps its color swatches and font cards. A swatch sets the reading background. A font sets the lesson typeface. Text size is a slider from a small A to a large A. It has 10 steps, small to large: 14, 16, 18, 20, 22, 24, 26, 28, 30, and 36. It starts at 18. That size is the lesson text in page, scroll, sentence, and theater. The translation is the step below it, and 12px when the lesson is 14px. The term in a sentence row follows that same step, but stays between 16px and 24px. Its meaning follows one step below the term, and stays between 14px and 24px. The status button on that row stays 32px. Widgets, menus, and the player do not follow it. The slider’s track is `#F8F9FA`. Its fill and thumb stay `#D1D6D9`.

Below 767px the theme menu, the reader menu, and the audio menu open as bottom sheets. The reader and audio sheets use a 35% scrim. Tapping the scrim, or dragging the handle down, closes the sheet. Their handle is a 36×5 `#D1D6D9` pill, 8px below the top edge and 2px above the first row. The sheet’s top radius is 16px, the bottom is square, and the shadow is `0 -4px 24px rgba(0,0,0,0.12)`. The theme sheet keeps a 36×4 handle. The mode menu and the vocabulary menu stay anchored to their buttons.

### Reader menu

The menu is 367px wide, radius 12, shadow `0 8px 24px rgba(0,0,0,0.1)`. It does not scroll. Groups are split by a full-width 1px `#F1F3F4` divider. There are no group headings. On-state switches are 36×18, on `#2E75CD`.

The header is 64px, with 6px of padding. Previous and next are 34px circles on `#F8F9FA`, with 16px chevrons. Previous and next open the neighboring lessons in the course. The lesson card between them is 52px, radius 8, the same fill, with a 36px thumbnail. Its title is 14px medium. The card shows the lesson title and the course, with the lesson’s place in the course, as in YouTube auf Deutsch (3/5).

Four groups:

- **Change what I see:** Show Translations, Simplify Lesson, Regenerate Lesson. Show Translations toggles and leaves the menu open.
- **Change the content:** Edit Sentence in sentence mode, then Edit Lesson.
- **Organise:** Course, Remove from Active Playlist, Add to Playlist, Download & Print. A playlist the lesson is in shows Remove from that playlist, in red `#DD2525` with a list-x icon. Choosing it removes the lesson from that playlist and leaves the menu open. Add to Playlist can put it back.
- **App:** Settings, Statistics, Help.

Desktop rows with a chevron fly out to the left, 251px wide, 4px away, the first item level with the row. Hover opens one at once. Moving toward it keeps it open. Resting on another row switches after 300ms. Leaving both closes it after 300ms. Clicking the row opens it and focuses the first item. Left Arrow opens it. Right Arrow or Escape closes it and returns to the row.

- **Course:** View Course, Subscribe, Edit Course. Subscribe flips to Unsubscribe, in red with a bell-minus icon, and the menu stays open.
- **Add to Playlist:** New Playlist with a circle-plus icon, a divider, then playlists the lesson is not in. Those rows have no icon.
- **Download & Print:** Download Audio downloads the lesson audio. Download SRT File downloads the captions. Print Lesson prints the lesson.
- **Help:** Quick Start Guide, Grammar Guide, Keyboard Shortcuts, Knowledge Base, Ask Lynx AI. Quick Start Guide and Grammar Guide open those guides. Keyboard Shortcuts opens the shortcuts. Knowledge Base uses the black LingQ mark and opens the forum Knowledge Base in a new tab. Ask Lynx AI opens Lynx and closes the menu.

Below 767px, tapping a chevron row swaps the sheet to that submenu. A semibold back row replaces the lesson header, and the sheet height eases to fit over 220ms. The back row returns to the main list. Show Translations, Subscribe, and the playlist rows stay in the sheet. Any other row runs and closes it.

Simplify Lesson opens the simplify screen. Regenerate Lesson regenerates the lesson. Edit Sentence and Edit Lesson open those editors. View Course opens the course. Edit Course opens the course editor. New Playlist starts a new playlist. Settings opens Settings. Statistics opens Statistics.

A lesson is Video, Audio Only, or Audio & Video.

- **Video.** The video sits at the top from the start, and the player stays closed until Play. The play control is the YouTube icon. Play on the bottom bar opens the player and starts the video. Play in page mode stays in page mode. Changing to sentence or scroll does not open the player or start the video. If playback is already running, it stays as it is. Switching to page while the video is playing keeps it playing. The video is stacked above the text. Above 1024px, Landscape on the player puts the video beside the text while the side panel is closed. From 1025px to 1399px it stacks beside the panel when that panel is open. At 1400px and above, with Landscape on, it stays beside the text with the panel open.
- **Audio Only.** The play control is the Play icon. Play stays in the current mode, including page. There is no video and no split view. The dismiss tooltip reads “Dismiss audio”.
- **Audio & Video.** The play control is a split pill, 48px tall: a 48px icon button, a 1×34 divider, and a 40px chevron. The shadow sits on the pill. The last choice stays on the button, and the other choice is in the chevron menu. Video is the default, so the video sits at the top from the start and the player stays closed until Play. The button starts as the YouTube icon and the menu is Play audio. Play audio stays in the current mode and does not show the video. After that, closing the player leaves the Play icon on the button, and Play video moves into the menu. Choosing video again swaps them back. Closing the player does not forget that choice. Changing to sentence or scroll does not open the player or start the video.

### Audio menu

The more control is a vertical ellipsis in the player. Its rows, lesson header, switches, and mobile sheet use the reader menu’s styling. The header is the same lesson card as the reader menu, without the previous and next chevrons. On a wide screen the menu opens upward and scrolls once it is taller than 560px, or taller than the viewport minus 96px. Below 767px it is the bottom sheet described above.

A control stays in this menu even when its button is already on the player. The same menu is used by the desktop player, the collapsed phone player, and the expanded phone player, in and out of theater mode. Playback Speed, the timer, and Loop Audio are the first group. A divider follows. Layout and Theater mode are the next group, and that group is left out when neither row applies. Layout is in that group only above 1024px, and only while theater mode is off. Theater mode is in it only when the lesson has video, including while theater mode is on. Another divider follows. Sync text with audio, Settings, and Ask Lynx AI are the last group.

Each group has 6px of padding, so the hover fill does not sit against the line. Ask Lynx AI uses the Lynx mark and opens Lynx, with nothing on the right of that row. Layout uses Lucide Columns2. Its current choice sits on the right, the same way Playback Speed shows `1x`: Vertical or Landscape. Vertical is the default. Choosing the row switches between those two. Playback Speed opens the speed choices. Timer opens the sleep timer, and starts at None. Sync text with audio starts on. While it is on, the current line follows the audio, including in theater mode. Loop Audio repeats the current sentence. Theater mode uses the same `#2E75CD` on state. Settings opens Settings. These choices persist. Outside click or Escape closes the menu.

## Bottom bar

Default bar: play on the left, mode and vocabulary in the center, Ask Lynx on the right. Items sit 16px above the bottom of the screen. The center group stays horizontally centered as the bar narrows. Play and Ask Lynx are 48px circles: white, no border, 24px marks, shadow `0 4px 6px rgba(0,0,0,0.08)`. Icons in this default bar are 24×24. The center group is a pill (radius 999), the same white fill and shadow, padding 6px 12px, gap 10px. A 1px divider in `--border` (`#F1F3F4`) stretches the height of that pill between the mode control and the vocabulary section. The mode control is the mode icon and a 20px up-down chevron. On desktop and tablet it also shows the mode name, 14px medium with an 18px line height. The icon is `--fg-default`. The chevron is `--fg-muted`. Its hover fills the 48px control, with 12px of padding on either side, the same inset as a 24px icon in a 48px circle. The pill’s 6px padding stays clear of that fill. Vocabulary on this bar is a split button: a 48px cards icon and a 40px chevron, with no divider between them. The icon starts the default review. The chevron opens Review actions.

Below 767px the mode control drops its label and keeps the mode icon plus the up-down chevron. On that same width, play opens a collapsed player that takes the whole bar. Expanding it replaces the center group and Lynx with the full player.

- **Play** opens the player and starts playback. On desktop and tablet that is the full player. Below 767px it is the collapsed player. A video lesson and an Audio & Video lesson already show the video at the top, with the player closed, before Play. The picture starts paused, with the YouTube controls showing. Clicking it plays or pauses, and the player follows: play opens the player when it is closed, and pause pauses it. After 3 seconds with the pointer off the video, the YouTube controls hide while it plays. Moving the pointer back shows them again. Choosing sentence or scroll does not open the player or start the video. If playback is already running, it stays as it is. When the lesson includes video and is in page mode, the play button stays in page mode and starts playback. That button uses the Lucide YouTube icon, still 24px with a 1.5 stroke. For Audio & Video the control is a split pill: the last choice stays on the button, and the other choice is in the chevron menu. Video is the default, so the button starts as the YouTube icon and the menu is Play audio. After Play audio, closing the player shows the Play icon, and the menu is Play video. When the lesson is audio only, or Play audio is chosen, Play uses the Play icon and starts audio in the current mode, including page mode, without showing video. Pause keeps the player up and shows the paused video frame. Desktop and tablet have no collapsed player. The video shows in page, scroll, and sentence. The video is stacked above the text. Above 1024px, Landscape on the player puts the video beside the text while the side panel is closed. From 1025px to 1399px, opening the side panel stacks the video in the lesson column beside that panel. At 1400px and above, with Landscape on, the video stays beside the text with the panel open, so the lesson is three columns: video, text, and the panel. The expanded player is one full-width bar with a 1px top border, not a pill.
- **Close** stops playback, hides the video, and brings back the play button. The lesson still opens with the video showing and the player closed. After that, this X hides the video, and Play brings it back. The reading mode stays. On desktop and tablet the control is a 20px X in a 40px circle, after the divider at the right of the bar. The more menu sits at the end of the playback actions. Hovering or focusing it shows “Dismiss video”, or “Dismiss audio” for an audio-only lesson or Play audio. Below 767px that X is hidden. A 36×4 handle, `#D1D6D9`, sits centered on the top edge of the expanded player. Dragging it down, or clicking or pressing it, returns to the collapsed player, leaves the video up, and leaves theater mode if it was on. On the collapsed player, dragging that handle up expands, and dragging it down, or clicking or pressing it, closes the player and hides the video. Escape closes the player and hides the video when no menu or dialog is open.

### Player

[AudioPlayer (Web)](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=8262-127042)

This bar is the desktop and tablet player, from 768px up. It stays light. Play opens it directly. There is no collapsed player at this width. Below 767px, play opens the collapsed player described after this bar, and expanding that opens the earlier phone layout.

- No lesson thumbnail, title, or course in this bar. The bar is white, with 24px of horizontal padding and 20px of vertical padding, and a 1px `#E3E5E7` top border.
- Progress is a full-bleed 4px track on the top edge, sitting on that border. The track is `#F1F3F4`. The fill is a gradient from `#2E75CD` to `#4E8AD6`. No thumb.
- Left, 12px apart: pause, back 5, and forward 5, then a `#F8F9FA` time pill. Pause is a 48px circle, white, with the control shadow `0 4px 6px rgba(0,0,0,0.08)`, and a 24px icon. Back and forward are 48px and 12px apart. The time pill is 48px tall, 14px regular, line height 18, with 16px of padding on the sides. The current time is `--fg-default`. The slash and the duration are `--fg-muted`, at the same size and weight. The slash has the same space on both sides.
- The left group and the right group stay at least 16px apart. Extra room sits between them. When the window is narrower than that, playback actions leave the row one at a time so the two groups keep the 16px. They leave in this order: Loop Audio, speed, the timer, then the layout toggle. Theater mode stays just left of the more menu until those are gone. Theater mode leaves only if the 16px gap still cannot be kept. The more menu stays. Lynx and close stay on the bar. Vocabulary stays too. Mode stays, except while theater mode is on.
- Right: the playback actions, a divider, then mode, vocabulary, and Lynx, a divider, then the close X. The playback actions sit in a `#F8F9FA` pill, 48px tall, padding 4px 8px, radius 999. Left to right, 8px apart: that pill with Loop Audio, `1x` (16px medium), and the timer, then the layout toggle, Theater mode, and the more menu. Those three sit on the white bar, outside the pill, and each is a 48px icon button. The layout button is only there above 1024px. It has no fill. Pressing it switches between portrait and landscape. The icon shows the current layout and turns a quarter turn with the change. Mode, vocabulary, and Lynx are 48px targets, 8px apart, and Mode is the 24px mode icon. Vocabulary is the 24px cards icon. Clicking it starts the default review for the current reading mode. Lynx is a 24px mark. That reading group follows a divider, with 16px on each side of it. The close X is 48px with a 20px icon. A second divider sits 24px after the reading group, and the X sits 16px after that divider, clear of Lynx. While theater mode is on, the mode control leaves the bar, so vocabulary sits after the divider that follows the ellipsis, then Lynx. The divider before the close X stays. The mode control returns when theater mode ends.
- Hover fill is `#F8F9FA`. An icon button that toggles, including Loop Audio and Theater mode, uses a light blue fill (`#F1F7FE`) and a blue icon (`#2E75CD`) while it is on.
- Lynx in this bar is the icon only. The Ask Lynx field stays on the default bar, while the player is closed.
- The more control opens the audio menu. See Menus. Playback Speed opens the speed choices. The timer opens the sleep timer. Loop Audio repeats the current sentence.
- **Layout** switches the video between portrait and landscape. Portrait is the default at every width, including desktop: the video sits above the text. The control is one 48px icon button just left of Theater mode, outside the playback pill, and only above 1024px. It has no fill. Portrait uses Lucide Rows2 at 20px. In landscape that same icon turns 90 degrees the other way, so the video half moves between the top and the left. The icon shows the current layout, and the turn plays when it changes. Pressing it switches to the other one. Pressing Landscape places the video beside the text. The video and the text take equal halves of the lesson area, with 24px between the video and the text and 12px between each half and the chevron column beside it. Pressing Portrait stacks the video above the text again. The whole toggle leaves the bar before Theater mode. Above 1024px the more menu shows one Layout row, with Lucide Columns2, and the current choice on the right: Vertical or Landscape. That row stays while the button is on the bar. It leaves the menu while theater mode is on. At 1024px and below, Layout is not in the menu. The bar control hides while theater mode is on, and at 1024px and below. From 1025px to 1399px, opening the side panel, the vocabulary list, or Lynx stacks the video above the text in the lesson column, beside that panel, even while Landscape is selected. At 1400px and above those stay open beside the split lesson. Each half of the lesson is about 400px, the same width as the panel. From 768px to 1024px the video is stacked, including when the vocabulary list uses the side column. At 767px and below it stays stacked. The video stays on the left and keeps its shape, centered in its half. The text uses the full height of the right half, and the sentence ticker stays inside that half. In sentence mode the sentence, its controls, and the ticker are centered vertically in that half, and sit at the top again if they are taller than the half.
- **Theater mode** is separate from the video’s own fullscreen. It is available when the lesson has video. On desktop and tablet it is a 48px button with Lucide Maximize at 20px, switching to Minimize while theater mode is on. It sits just left of the more menu in the playback actions. The more menu stays last. The other playback actions leave first, so Theater mode stays on the bar as the window narrows. It leaves that row only after those are gone and the 16px gap still cannot be kept, and then it stays in the more menu. On a phone it stays the left control of the second row. The side-by-side layout hides while this is on. Turning it on hides the site header and the lesson header, on desktop and on mobile, and keeps the same player. The headers fade out and the video eases out to fill the space above the player. The player does not crossfade with that: its colors ease to the dark bar, the theater control turns on, and the mode control slides away so vocabulary and Lynx move over beside the divider after the ellipsis. Leaving eases back the same way. The reading mode underneath is unchanged. On desktop and tablet, the mode control leaves the player while theater mode is on, and vocabulary and Lynx stay. It returns when theater mode ends. The page and sentence chevrons stay hidden. The picture is 16:9, the same shape as the lesson video, centered in a black frame. Black around that picture comes from the frame, not from bars in the video. A frame taller than 16:9 gets black bars on the top and bottom. A frame wider than 16:9 gets them on the sides. YouTube chrome sits in the black frame, 12px in from the frame edges, not on the picture. When the picture letterboxes, that chrome stays put and rests in the black above and below the video. It stays above the audio player, so a taller player moves it up with the frame. Top left: a 36px circular channel image, then the video title (20px semibold, line-height 24, white) and, 2px under it, the channel name (16px regular, line-height 20, white). Both lines ellipsize. Center, while paused: a 68px play button, fill `rgba(0, 0, 0, 0.5)`, with Lucide Play at 36px in white. It starts playback and hides while the lesson is playing. Bottom left: a pill with that same fill, padding 8px 16px, gap 24px, holding a mirrored reply icon and a clock, both 24px white. Bottom right: a “Weitere Videos” chip (11px medium white, a 70×39 suggested-lesson image with a 1px white border and 9px radius) and the white YouTube wordmark at 16px tall. The “Weitere Videos” chip stays at every width. On a narrow frame its label ellipsizes before the thumbnail or the wordmark do, and the group stops short of the share and clock pill. The channel, share, the clock, Weitere Videos, and the YouTube wordmark each open their screen. The center play button stays centered on the picture. The lesson line and its translation sit above that bottom YouTube row, with 16px between the translation and the row, so the sentence is not squeezed beside the chrome. The column is up to 645px wide, inset 16px from each side of the frame. It stays in the frame with the chrome, including in the black below the picture, and it stays above the audio player. The line is one dark overlay: fill `rgba(0, 0, 0, 0.75)`, radius 12, padding 16, 20px medium, line-height 24, white. The overlay hugs the words. It grows with the line up to the column, and it does not stretch to the column when the line is shorter. When Show Translations is on, the translation is a second overlay 16px under it: the same fill and radius, padding 8px 16px, 16px medium, line-height 20, white. While Sync text with audio is on, the line follows the audio. It never wraps. If it is longer than the overlay, words drop from the end until the line fits. There is no ellipsis. The translation is only for the words still on that line. It may wrap to a second line inside its own overlay. Words on that line keep the same tap behavior as the rest of the lesson. Known words stay white. New words are `#2E75CD` on `rgba(41, 70, 112, 0.25)`. LingQ words are `#FFCA01` on `rgba(255, 202, 1, 0.25)`. Those highlights use a 6px radius. While theater mode is on, the player switches to a dark bar: fill `#1E2328`, top border `#49525B`, progress track `#262B30`, and white icons. On desktop and tablet that bar keeps the same sizes and spacing as the light bar. Pause is the 48px circle on `#262B30`, with the control shadow `0 4px 6px rgba(0,0,0,0.08)`. Back, forward, theater, the more menu, vocabulary, Lynx, and close are 48px. The time pill and the playback pill are 48px tall on `#262B30`. The playback pill, theater, and the more menu are 8px apart. The close X keeps the same clearance from Lynx. The time pill’s current time is white and the rest is `#D1D6D9`. Lynx uses its white mark. Leaving theater mode restores the light bar. Minimize, while theater mode is on, keeps the on-state fill `#F1F7FE` and the blue icon `#2E75CD`. The ellipsis still opens the audio menu upward from the bar. On a phone that menu is still the sheet. Escape, Minimize, or closing the player leaves theater mode. An audio-only lesson hides the control.
- Below 767px the expanded player keeps its earlier layout. Play and pause stay a 48px circle with the control shadow, and the other controls stay 40px white circles. A drag handle sits centered above the controls. Dragging it down, or clicking or pressing it, returns to the collapsed player and leaves theater mode if it was on. Back, pause, and forward sit centered on the first row, 20px apart. The next row is theater mode on the left, a `#F8F9FA` pill in the center, and the vertical ellipsis on the right. The pill is 48px tall, padding 4px 8px, gap 8px, and holds playback speed (`1x`, 14px semibold), the timer, and loop. Mode, Lynx, vocabulary, the time, and the close X are not on this bar. The progress track is `#F8F9FA` and runs the width of the bar along the bottom. While it is dragged, `12px` regular timestamps sit just above it: the current time on the left and the duration on the right. They hide when the drag ends. An audio-only lesson has no theater control, and the pill stays centered. In theater mode the pause circle and the actions pill use `#262B30`, and the icons are white. The theater control keeps the light blue on state.

### Collapsed player

Below 767px only. Desktop and tablet never show it. Play opens this pill. Narrowing the window to 767px or below collapses an open desktop player into this pill. If theater mode is on, the player stays expanded. Widening past 767px opens the full desktop player again.

The pill fills the bottom bar, white, radius 999, shadow `0 4px 12px rgba(0,0,0,0.08)`, padding 12px on the sides. A 4px `#F8F9FA` track runs along the bottom, with a 76px `#2E75CD` fill. A drag handle sits on the top edge. Dragging it up expands the player. Dragging it down, or clicking or pressing it, closes the player. Tapping the pill, outside its buttons, expands the player.

Left: pause, then replay 10 seconds. Right: the reading mode icon, 20px, then vocabulary, then Lynx, then the more menu. Vocabulary is the 20px cards icon in a 40px target. Clicking it starts the default review for the current reading mode. The more menu includes Theater mode when the lesson has video. An audio-only lesson hides that row.

### Vocabulary button

The vocabulary control in the players is the cards icon. Clicking it starts the default review for the current reading mode, the same as the cards icon on the default bar. While the player is open on desktop and tablet, that icon sits in the player, a 48px target. It stays there while theater mode is on, and switches to the white cards icon so the speech bubble stays visible on the dark bar. Below 767px the expanded player does not include it. The collapsed player does: a 20px cards icon in a 40px target, between the reading mode and Lynx.

On the default bar, while the player is closed, vocabulary is a split button on both desktop and mobile. No fill and no border. No divider between the cards icon and the chevron. Horizontal padding 4px. The cards icon and the chevron sit in that one section.

- Icon half is 48×48. Chevron half is 40×40. Both are transparent so the section color shows through. The vocabulary icon does not use the blue toggle state.
- The icon starts the default review for the current reading mode. It does not toggle the list shut.
- The chevron opens Review actions and rotates 180° while that menu is open. 150ms ease. No transition when reduced motion is on. The search-type chevron in the vocabulary search field uses the same flip.
- Opening the mode menu or the review menu closes the other. Outside click or Escape closes it.

[Review actions](https://www.figma.com/design/dROMt3II5ySPNXRqUZrbjQ?node-id=530-8308) matches that frame’s items. The rows use the reader-menu row, in two groups split by a divider. It opens upward, 16px above the split button on the default bar, aligned to the button’s right edge. There is no lesson header.

**Default for the cards icon on the default bar and in the players:**

- **Page mode** opens Page Vocabulary Review.
- **Sentence mode** opens Sentence Vocabulary Review.
- **Scroll mode** opens Lesson Vocabulary Review.

A menu choice overrides the mode.

- **Review Page**, **Review Due**, and **Review Lesson** open that review: Page Vocabulary Review, Due Vocabulary Review, or Lesson Vocabulary Review.
- **Vocabulary List** opens the list in the side panel when no review is open. While a review overlay is open, it switches that overlay to the list.
- **Manage Vocabulary** opens Manage Vocabulary.

### Review

Review Page, Review Due, Review Lesson, and the mode’s default review each open that vocabulary review over the lesson. Closing it, or clicking the page behind it, returns to the lesson. Opening a review also closes the vocabulary list if that panel is open. The header keeps the close X on the left and the ellipsis on the right. Centered between them are two tabs: Lucide List with the label List, then Lucide FileCheck with the label Review. The selected tab is `#0A0A0A` for the icon and the label, with a 2px `#2E75CD` underline. The other tab is `#49525B` for the icon and the label, with no underline. Below 767px the labels hide and each tab is the icon only. Review is selected whenever the overlay opens. Scroll mode opens Lesson Vocabulary Review, since that mode has no page or sentence review. The review card stays 1000px wide. The list hides its own title bar and fills that card. Choosing review returns to the review already open. In the list, a side-panel button sits just left of the ellipsis. It uses Lucide PanelRight at 18px. Pressing it closes the overlay and docks the vocabulary list in the side panel. Below 767px that button is not shown. The ellipsis opens the same Review actions menu, dropping down from that button, without the Vocabulary List row. Choosing a review there switches the overlay back to review view. The close X, the dock button, the ellipsis, and the header buttons on the side panels are ghost buttons: no border, transparent until hover fills `#F8F9FA`, full radius.

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

- The count is the filtered list before search. All uses “terms”, Words uses “words”, and Phrases uses “phrases”. Singular at 1. Search does not change the count.
- **Cancel** drops the draft and returns to the list. **Apply** commits it. **Clear** restores the draft to the default. It is disabled when the draft already matches the default, including right after a clear. The refresh icon spins once first.
- **Select all** turns every status on, including Blue Words. When every status is already on, it turns them all off. Some selected shows the mixed checkbox. Chips toggle one status at a time.
- Words and Phrases split the list by saved phrase. SRS Due shows the terms that are due.
- Above 767px in the review overlay, the search grows up to 550px. Filter and sort sit at the right, then a 1px divider, then the count. Below 767px the search fills the header on its own row, above filter, sort, and the count. The side panel keeps that stacked header.
- Search narrows the rows only. Contains matches the term or the meaning. Starts With and Ends With match the term. Source Text Containing matches the term. Meaning Containing matches the meaning. The match control hides once the field has text, and its chevron points up while the menu is open.
- Sort: Importance and Creation Date keep list order. Status runs Blue, New, Recognized, Familiar, Learned, Known, Ignored. A–Z and Z–A use German sort.
- Above 767px, a row in the review overlay is three columns, with 10px of vertical padding. The first column is the 32px status, the term at 16px medium, and the play button 12px after the term, the same gap as after the status button. The second is the meaning, and the third is a short piece of the sentence around the term. Meaning and that piece use the large widget’s text: 16px regular, 20px line height, on `#F8F9FA` with a 12px radius and 10px of vertical padding. The meaning’s grey fill hugs the text. The sentence piece’s grey fill also hugs the text, and its right edge lines up with the right edge of the overlay. The columns themselves keep their width. The meaning clamps at two lines. The piece shows four words before the term and four after it. The term is bold. `...` appears before the piece when earlier words were left out, and after it when later words were left out. The row grows to fit that piece. Several meanings show together, separated by ` ; `. Below 767px, and in the side panel, the row goes back to status, term, meaning underneath, and play on the right, with 18px of vertical padding. The sentence hides. The list has no floating Review button.
- A row’s status chip opens the vertical status menu and writes that status onto the phrase, or onto every lesson copy of the word. Choosing the current status leaves it unchanged. The row’s audio plays that term.
- Course, Lesson, and Tags open those filters. Search submit runs the search.

### Filters

Status is chips, not a slider. Order: Blue Words (circle-plus), Ignored (eye-off), New 1, Recognized 2, Familiar 3, Learned 4, Known (check).

- Blue Words uses the same chip as the others. The filter chip icon is Lucide circle-plus. In the list, and on the status button, Blue uses Lucide plus, so the round status control is not a circle inside a circle.
- Chip: pill, padding 8px 12px, 14/500/18. Unselected is white, `1px #D1D6D9`, muted text. Selected is border and text `--fg-secondary`, fill `#F1F7FE`.
- Select all sits in the Status heading, opposite the label, space-between. Text first, then an 18px checkbox. Checked is `--fg-secondary` with a white check. Mixed is a blue dash on `#F1F7FE`. Empty is white with a `#D1D6D9` stroke. The label stays “Select all”.
- No back chevron. The header is the title, Clear, then the panel button. On the mobile sheet that last control is an X. Cancel is the way back.
- Clear is the text pill from [Filters, Clear](https://www.figma.com/design/dROMt3II5ySPNXRqUZrbjQ?node-id=524-7560): “Clear” plus a 16px refresh icon, gap 6px, padding 8px 12px, radius 999, `1px var(--border)`, 14/500/18, color `--fg-muted`. Hover `#F8F9FA`. Disabled text and icon are `#D1D6D9`. On press the icon spins one full turn (500ms), then the button shows disabled. Reduced motion skips the spin.

## Lynx

[LynxChat](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=5871-55466)

The Ask Lynx circle in the bottom bar opens the chat. The click highlight is blue (`2px solid #2e75cd`), not green.

- The footer circle is the collapsed state of this panel. On desktop and tablet it morphs into a panel in the same right-hand column as the word panel. The panel’s bottom edge is the circle’s bottom edge. The footer circle hides while the chat is open.
- Below 767px the chat opens as a bottom sheet, the same shell as the vocabulary list. A drag handle sits on the top edge. Dragging it down, or pressing it, closes the chat. Opening the chat closes the vocabulary sheet, and opening the vocabulary sheet closes the chat.
- On desktop and tablet the close control is an X in the same ghost button: no border, transparent until hover fills `#F8F9FA`. On the mobile sheet the header matches the vocabulary sheet: `--surface` background, a 16px medium title, and the same ghost X.
- Shadow is `0 -4px 12px rgba(0,0,0,0.08)`, the same as the word panel.
- Border `1px #f1f3f4` and radius 16 match the docked word panel.
- With the player open on desktop and tablet, Lynx opens from the player’s Lynx button and sits above the player. Below 767px the expanded player does not include Lynx.
- If the word panel is already open, it contracts to the height of its header, one line of the first meaning, and the status bar. A longer meaning ends in an ellipsis after that line, and every term uses that same height. Lynx fills the rest. Closing Lynx expands the word panel again.
- If the vocabulary list is already open, it contracts to a quarter of the side column. That strip keeps the Vocabulary header and the list. Search, filter, sort, and the review button leave. Lynx takes the other three quarters. Closing Lynx expands the list again.
- Sending a message, or tapping a suggestion, sends it to Lynx and shows the reply. The mic starts voice input.
