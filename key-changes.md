# Key design changes

Deltas between this demo and the existing Figma components. Match the demo. Styling only.

## Collapsed audio player

[AudioPlayer (Web)](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=5700-84606)

- Expand control is a single right chevron (18px), not chevrons-up-down.
- Progress track sits inside the card and is clipped to the bottom corners (`0 0 11px 11px`). It does not bleed 1px past the border, and it is not a full pill.
- The card itself does not clip overflow. Only the progress track is clipped, so the audio menu can float above the card.

## Expanded audio player

[AudioPlayer (Web), expanded](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=4943-37538)

- No lesson thumbnail, title, or course in this bar.
- Progress is a full-bleed 4px track on the top edge. No thumb. No `0:00` / duration labels on either side of a scrubber.
- Time is one muted label in the control row (`03:30 / 20:45`), after a 1px divider. Footnote Medium, `--fg-muted`.
- Transport order: pause, back 5, forward 5, repeat, `1x`. Pause is a 45px circle, 1px `--border`, white fill, shadow `0 2px 8px rgba(0,0,0,0.02)`, 20px icon.
- Other transport icons are 18px in 45px hit targets, radius 6. Hover fill `#f4f6f7`.
- Right cluster stays grouped: ellipsis, divider, mode, Lynx, collapse chevron. Horizontal padding is 16px, not 24px.
- Mode control is not the filled chip. Transparent, radius 6, padding 6px, gap 10px. The active mode icon is `--fg-default` (`#0a0a0a`). The up-down chevron stays `--fg-muted`.
- Lynx is a plain 45px icon button (22px mark), not the 42px bordered circle.

## Lynx chat

[LynxChat](https://www.figma.com/design/2hnfSE92imLKR8gnp4qa36/Reader?node-id=5871-55466)

- Close control is a downward chevron in the same circular outline button, not an X.
- Shadow is `0 -4px 12px rgba(0,0,0,0.08)`, same as the word panel. Not `0 4px 6 rgba(0,0,0,0.08)`.
- Border `1px #f1f3f4` and radius 16 match the docked word panel. Keep the two panels on the same values.
- The footer Ask Lynx pill is the collapsed state of this panel. The panel’s bottom edge is the pill’s bottom edge. The whole pill is the hit target, including padding and the icon. Focus ring is blue, `2px solid #2e75cd`, not green.

## Small widget

- While the side panel is open, hide the forward chevron. The meaning row has nothing left to open.

## Large widget

- The floating card has no side-panel button. That button exists only on the docked panel. There is no control for turning the popup into the side panel.

## Finish lesson

Not in the reader Figma frames. Use this treatment at the end of the lesson.

- **Page and sentence:** the right paging control keeps its size (52px wide, up to 408px tall, radius 12). The chevron becomes a 16px circle-check. Fill `#F4FCEF`. Icon and 1px stroke are `#42A564`.
- **Scroll:** no side chevrons. The same control lies flat under the text, full text-column width, 52px tall, radius 12, same fill and stroke. Label is “Finish Lesson” beside the check. 16px below the last line, 48px of space under the bar. It fades in only at the bottom of the scroll.

The confirm dialog is the design-system dialog, horizontal on wide screens and stacked below 768px:

- [Dialog, horizontal](https://www.figma.com/design/kLZpcEEsV9ZUCTBiipPN6y/LingQ-Design-System--Lynx-Fluent-?node-id=3502-820)
- [Dialog, vertical](https://www.figma.com/design/kLZpcEEsV9ZUCTBiipPN6y/LingQ-Design-System--Lynx-Fluent-?node-id=3502-840)

Title “Finish this Lesson?”. Body “Confirm to wrap up this lesson and view your learning stats.” Primary button label is “Finish Lesson”, green `#42A564`.

## Lesson header exit

Far left of the lesson header, opposite the Aa, ellipsis, and panel buttons. Same 45px icon button, radius 6, 24px icon. Lucide log-out, flipped so the arrow points left. Inset 12px, including when video collapses the header.

## Site header

No extra fill and no bottom border. The lesson header sits 12px below it, the same gap the lesson header already has above the text. That gap closes while video is open, so the exit and panel buttons stay at the top of the video.

## Vocabulary split button

One control in the bottom bar, not an icon and a separate chevron.

- 36px tall, radius 8px. One fill for the whole button, `#FBFCFD`. Border `1px solid #F1F3F4`.
- Icon half is 40×36. Chevron half is 32×36. Both are transparent so the container color shows through.
- Divider is 1×16px and vertically centered. It does not run the full height. Color is `--fg-muted` (`#49525B`), not the border.
- The chevron rotates 180° while its menu is open. 150ms ease. No transition when reduced motion is on. The search-type chevron in the vocabulary search field uses the same flip.

## Review actions menu

[Review actions](https://www.figma.com/design/dROMt3II5ySPNXRqUZrbjQ?node-id=530-8308)

Menu matches that frame. It opens upward, 16px above the split button, aligned to the button’s right edge.

## Vocabulary filters

Status is chips, not a slider. Order: Ignored (eye-off), New 1, Recognized 2, Familiar 3, Learned 4, Known (check).

- Chip: pill, padding 8px 12px, 14/500/18. Unselected is white, `1px #D1D6D9`, muted text. Selected is border and text `--fg-secondary`, fill `#F1F7FE`.
- Select all sits in the Status heading, opposite the label, space-between. Text first, then an 18px checkbox. Checked is `--fg-secondary` with a white check. Mixed is a blue dash on `#F1F7FE`. Empty is white with a `#D1D6D9` stroke. The label stays “Select all”.
- No back chevron. The header is the title, Clear, then the panel button. Cancel is the way back.
- Clear is the text pill from [Filters, Clear](https://www.figma.com/design/dROMt3II5ySPNXRqUZrbjQ?node-id=524-7560): “Clear” plus a 16px refresh icon, gap 6px, padding 8px 12px, radius 999, `1px var(--border)`, 14/500/18, color `--fg-muted`. Hover `#F4F6F7`. Disabled text and icon are `#D1D6D9`. On press the icon spins one full turn (500ms), then the button shows disabled. Reduced motion skips the spin.

## Review button

Same blue button: `1px var(--fg-secondary)`, fill `#F1F7FE`, 14/500/18, 16px vocabulary icon. The label is the filtered count, not “Start Review”. “Review 25 Terms”, “Review 5 Words”, “Review 1 Phrase”. Noun follows the terms filter. Singular when the count is 1.
