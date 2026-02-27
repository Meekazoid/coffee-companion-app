# Claude Prompt

Please implement the following UI/UX fixes for the coffee card flow.

## Context
This is about the coffee card details view that opens when a user opens a coffee card.

## 1) Move coffee info fields higher in the open coffee card
Current issue:
- These fields are currently displayed at the bottom of the open coffee card:
  - Variety
  - Altitude
  - Tasting Notes

Required behavior:
- Move these fields so they appear **between the divider line and the Roast Date**.
- Keep the same font and font color currently used for these fields.
- Render them vertically (one per line, in this order):
  1. Variety
  2. Altitude
  3. Tasting Notes
- If a field has no value, do **not** render that line.
- Only show data that actually exists from the coffee creation flow (scan, manual, or image upload). Do not show placeholders.

## 2) Roast date alignment, date arrow position, and Android font size
### Desktop vs mobile alignment
Current issue:
- On desktop, roast date is centered.
- On mobile, roast date is not centered.

Required behavior:
- Make roast date alignment consistent so it is centered on mobile too (matching desktop behavior).

### Insert date field arrow on mobile
Current issue:
- In mobile view, the small arrow in the "insert date" field sits too far right.

Required behavior:
- Move the arrow slightly to the left in mobile layout.

### Roast date font size on Android app
Current issue:
- Inserted roast date text appears too large in the Android app.

Required behavior:
- Make the inserted roast date font a bit smaller on Android.

## 3) Close manual entry when switching to image flows
Current issue:
- If user taps **Manual**, then chooses image-based flows (**Upload Image** or **Scan Image**), the manual entry fields remain open.

Required behavior:
- Automatically close/collapse the manual entry section when either:
  - Upload Image is selected, or
  - Scan Image is selected.

## Acceptance criteria
- Variety / Altitude / Tasting Notes appear between divider and roast date in the open coffee card.
- Missing values do not render empty labels/rows.
- Roast date is centered on both desktop and mobile.
- Mobile insert-date arrow is shifted left.
- Android inserted roast date font is slightly reduced.
- Switching from Manual to Upload Image or Scan Image collapses manual section.

Please keep existing styling and architecture patterns, and make only the minimal necessary code changes.
