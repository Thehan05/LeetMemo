# LeetMemo Popup Motion Design

## Goal

Bring the lightweight motion language demonstrated in
`preview/leetmemo-motion-demo.html` into the real Chrome extension without
making the popup feel slow or distracting.

## Motion Direction

Use short CSS transitions and animations, with JavaScript limited to toggling
state classes when an interaction needs an enter or exit phase. Motion should
clarify hierarchy and state changes rather than decorate every element.

Use a shared easing curve:

```css
cubic-bezier(0.2, 0.75, 0.25, 1)
```

Interactive transitions should last 100-210ms. Initial content reveals and
heatmap cells may last up to 320ms.

## Included Motion

### Dashboard Entrance

When the dashboard becomes visible, its major sections fade upward into place.
The profile, difficulty cards, activity, reviews, and recent submissions use
small staggered delays. The total sequence remains under 450ms.

The setup screen uses one restrained fade-and-rise animation when displayed.

### Settings Menu

The settings menu fades and moves down from the settings button while scaling
from 98% to 100%. Closing plays the reverse transition before the menu becomes
hidden.

The settings button retains its existing hover and pressed feedback. The theme
switch thumb keeps its current sliding transition.

### Cards, Lists, and Controls

Difficulty cards rise by 2px on hover. Recent submission rows shift their text
3px to the right while changing color. Header, review, back, and primary
buttons retain short pressed-state scaling or translation.

These effects must not change surrounding layout.

### Heatmap Reveal

Rendered heatmap cells begin slightly smaller and transparent, then reveal in
sequence. JavaScript assigns a capped delay based on each cell's index so the
full grid finishes promptly. Existing hover enlargement remains available
after the entrance animation.

Placeholder heatmap cells remain invisible and do not animate.

### Notes View Transition

Opening a note moves the recent-submissions view slightly left while fading it
out. The editor enters from the right. Returning reverses the direction.

The current `hidden`-attribute switch cannot animate an exit, so the notes
feature will use state classes during the transition and only apply `hidden`
after the outgoing animation finishes. Focus moves to the textarea only after
the editor is available.

### Save Feedback

After storage succeeds, the Save note button:

1. stays in its existing position and keeps the same dimensions;
2. turns green;
3. changes its text to `\u2713 Saved` (rendered as a check mark and "Saved");
4. plays one subtle scale pop;
5. returns to `Save note` after about 1.1 seconds.

The existing live status region remains available for validation and storage
errors, but a successful save does not insert separate status text beside the
button.

Repeated clicks clear the previous reset timer before starting a new one.

## Implementation Boundaries

- CSS owns presentation, timing, easing, and reduced-motion behavior.
- Feature modules own state classes and transition cleanup.
- No animation library or new dependency is introduced.
- Existing light and dark color variables remain the source of theme colors.
- A new success color variable may be added for consistent save feedback.
- Animation classes must not alter popup width or cause content to jump.

## Accessibility

The existing `prefers-reduced-motion: reduce` rule remains the global fallback.
Motion-dependent JavaScript must also complete state changes immediately when
reduced motion is requested, so elements do not remain temporarily visible or
unfocusable.

Focus indicators, keyboard behavior, and `aria-expanded` state remain intact.
The save button's text change provides a non-color success signal.

## Testing

Automated DOM/source tests will verify:

- the settings menu has open and closing motion states;
- notes use explicit list/editor transition states;
- successful saves use a button state rather than a separate success message;
- heatmap cells receive staggered animation delays;
- reduced-motion CSS covers animations and transitions.

Manual verification in the extension popup will check:

- no layout shift during save feedback;
- settings open and close cleanly;
- notes move in the correct direction;
- heatmap entrance finishes quickly;
- the popup remains responsive during all animations;
- light mode, dark mode, and reduced-motion mode remain usable.

## Out Of Scope

- Spring physics or animation libraries
- Continuous background animation
- Animated numeric counters
- Changes to the extension's data model or API behavior
- Redesigning the layout, typography, or color palette
