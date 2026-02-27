# Claude Prompt (V3)

Please implement the following **new** refinements. V1 and V2 are already completed; this is a fresh V3 request.

## 1) Prevent accidental movement of Brew Feedback knobs while scrolling
Current issue:
- Brew Feedback knobs are triggered too easily during normal card scrolling.
- Users unintentionally change values while trying to scroll.

Required behavior:
- Make knob interaction less sensitive to incidental touch/scroll movement.
- Prioritize vertical scroll intent over knob drag intent.
- Ensure knobs only move on deliberate interaction (clear drag/turn gesture).
- Keep normal scrolling smooth and unaffected.

## 2) Pressed-state behavior and visibility fixes for action controls
### A) Manual / Upload Image pressed state should auto-reset
Current behavior:
- Pressing Manual or Upload Image changes color and stays in that state until another interaction.

Required behavior:
- Keep pressed feedback, but automatically revert to default state after a short timeout.

### B) Dark mode icon visibility in pressed state
Current issue:
- In dark mode, icon color for Manual and Upload Image is hard to see when pressed.

Required behavior:
- In pressed state (dark mode), set icon color to match the pressed-state text color for proper contrast.

### C) Light mode pressed background for Manual / Upload Image
Current issue:
- In light mode, pressed background does not visibly change.

Required behavior:
- Add a subtle light-grey pressed background color for Manual and Upload Image in light mode.

### D) Apply the same short auto-reset behavior to additional controls
Also apply the “switch back after a short time” behavior to:
- `+ / -` Grind Setting
- `+ / -` Temperature
- Pause button
- Reset button
- Pencil icon **only** in the state after edits were made and the green checkmark confirmation was pressed

Implementation note:
- Preserve existing actions; only reset visual pressed/active highlight state automatically after a short delay.

## 3) Roast Date field centering and sizing
Required behavior:
- Center the inserted roast date (`dd.mm.yy`) text.
- Adjust the date input box width to fit the date content appropriately (avoid oversized box).
- Center all elements within the Roast Date section:
  - Roast Date icon
  - “Roast Date” label
  - Insert Date field
- Ensure alignment is visually balanced across themes and mobile/desktop layouts.

## Acceptance criteria
- Brew Feedback knobs no longer move unintentionally during scroll; deliberate interaction still works.
- Manual/Upload pressed state auto-resets after a short time.
- Dark mode pressed icons for Manual/Upload are clearly visible and match text color.
- Light mode Manual/Upload pressed state has a subtle grey background.
- Short auto-reset pressed-state behavior is applied to grind +/- , temperature +/- , pause, reset, and the pencil icon (only in the specified confirmed-edits state).
- Roast date value is centered, date box is sized to content better, and Roast Date section elements are centered consistently.

Please keep architecture and style conventions intact, and make minimal targeted changes.
