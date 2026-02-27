# Claude Prompt (New Request)

Please implement the following **new** UI refinements. The previous request is already completed; this is a separate iteration.

## 1) Style and alignment for Variety / Altitude / Tasting Notes values
Current status:
- Placement is good.

Required changes:
- Apply the app's **golden theme font color** to the **values** of:
  - Variety
  - Altitude
  - Tasting Notes
- Ensure the values are aligned cleanly under each other (consistent vertical/value alignment).
- Add indentation for these lines so the block looks structured and visually grouped.

## 2) Improve dark-theme readability for key labels
Current issue:
- In dark theme, these labels are hard to read:
  - "Scan Bag AI Analysis"
  - "BREW METHOD"
  - "GRINDER"

Required changes:
- Make these labels more prominent in a golden color in dark theme.
- Keep visual consistency with the existing golden theme language.

## 3) Increase "CoffeeShot" font size
Required change:
- Increase the CoffeeShot text size by **15%**.

## 4) Roast date box refinement after font updates
Current issues:
- Roast date box is now too wide for the updated typography.
- The down-arrow icon is still too far right (near the border).

Required changes:
- Adjust roast date box width/padding so it fits the new font sizing more tightly.
- Move the down arrow further left so it does not hug the box border.
- Add a **golden frame/border** around the roast date box.

## 5) Match combined button width to CoffeeShot button width
Current issue:
- "Upload Image" + "Manual" area width does not match CoffeeShot button width.

Required changes:
- Make the **combined width** of "Upload Image" and "Manual" equal to the CoffeeShot button width.
- **Do not change CoffeeShot button width**.

## Acceptance criteria
- Variety/Altitude/Tasting Notes values use golden font color and are neatly aligned with consistent indentation.
- In dark theme, "Scan Bag AI Analysis", "BREW METHOD", and "GRINDER" are clearly more readable in prominent golden color.
- CoffeeShot font size is increased by 15%.
- Roast date box is visually balanced for the new text size, includes golden border, and has arrow shifted left.
- Upload Image + Manual combined width matches CoffeeShot button width exactly, with CoffeeShot width unchanged.

Please keep changes minimal and consistent with existing project styling conventions.
