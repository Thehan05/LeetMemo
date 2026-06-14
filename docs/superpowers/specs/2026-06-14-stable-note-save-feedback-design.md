# Stable Note Save Feedback Design

## Problem

The note editor action row uses `justify-content: space-between` and places the
status message before the save button. While the status is empty, it is hidden.
After a save, the status appears and the flex layout pushes the save button from
the left side to the right side. This makes the primary action change position
after it is clicked.

## Approved Design

Keep the **Save note** button anchored at the bottom-left of the note editor.
Render the status message immediately to the right of the button in the same
row. Showing or clearing the message must not change the button position.

The existing visual style, message text, accessibility behavior, and two-second
success timeout remain unchanged.

## Implementation

- Reorder the note action markup so the save button comes before the live status.
- Change the action row from space-between alignment to normal left alignment.
- Keep a consistent gap between the button and status.
- Preserve `aria-live="polite"` on the status element.
- Preserve current validation messages and focus behavior.

## Testing

Add a regression test that reads the note action markup and stylesheet and
asserts:

- the save button appears before the status element;
- the action row does not use `justify-content: space-between`;
- the row retains a gap between the fixed button and feedback.

Run the full Node test suite after the change.

## Out Of Scope

- Changing note persistence.
- Changing success or validation copy.
- Replacing the status with a toast or button-label animation.
- Restyling the note editor or other popup sections.
