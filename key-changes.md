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
