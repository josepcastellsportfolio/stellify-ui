# UX, motion and type principles (v2)

Forty principles: twenty on UX and animation and twenty design terms. Each one is either built into a component
(so you get it for free) or is a rule for the code you write around them. Storybook shows the live ones under
**Foundations → Principles**. The tokens they use are in [tokens.md](tokens.md).

## Motion

| Principle | In the library |
|---|---|
| Squash & stretch | Buttons compress to 97% on press (`active:scale-[0.97]`). Nothing else squashes: UI is not cartoon. |
| Anticipation | Not used for UI moves. Hover states (tint, cursor) are the wind-up before a click. |
| Staging | A dialog dims the page behind it (`bg-foreground/40`) so there is one thing to look at. One plate per empty screen. |
| Pose to pose | Every component animates between two defined states (`data-state`), never an improvised path. |
| Follow-through | `--ease-spring` gives a small overshoot to things that land: switch thumb, segmented and tab indicators, collapse chevrons. Never for things that leave. |
| Slow in & slow out | `--ease-out` for entrances and feedback, `--ease-in-out` for moves across the screen. No linear easing except spinners. |
| Moving in arcs | Not used: UI moves are short and straight. |
| Secondary action | The checkbox's check lands with a small zoom; the chevron turns when a section opens. |
| Snappy timing | `--duration-fast` 120ms (hover, press, menus, tooltips), `--duration-base` 240ms (indicators, dialogs), `--duration-slow` 400ms (page-level only). |
| Exaggerated feedback | Feedback is visible without hunting: "Enlace copiado" replaces the share label, invalid fields turn `danger-subtle`. No shaking (it fails reduced motion and reads as an error tone). |
| Solid drawing | Not applicable to a flat system; the plates (`illustration`) are the drawn element. |
| Overall appeal | One shadow, two radii, tonal surfaces, a single focus style: consistency is the appeal. |
| Interruptible animation | Every transition is a CSS transition or GSAP tween with `overwrite: "auto"`: a new input retargets from where the element is, never queues. |
| Origin-aware animation | Popovers, menus, selects and tooltips scale from their trigger (`origin-(--radix-…-transform-origin)`). |
| Stagger | `Stagger` fades arriving items in turn, 40ms apart, capped at 8 steps (320ms). Only for content that arrives, never for what the person is acting on. |
| Shared element transition | `useViewTransition` + the same `viewTransitionName` in both views morphs one element into the next (a card into its detail). |

Reduced motion cuts every duration to near zero (`stellify-base`); delays still apply, they are not motion.

## UX laws

| Principle | In the library |
|---|---|
| Fitts's law | Primary actions are the biggest targets in their group; destructive ones are never next to the primary. |
| Bigger hit areas / touch target | On touch screens (`pointer: coarse`) buttons, checkboxes, switches, segmented options and the dialog close get an invisible hit area of at least `--touch-target` (44px); combobox rows are 44px tall. The drawn size doesn't change. |
| Hick's law | `SegmentedControl` takes 2 to 5 options and warns in development above that: more wants a `select` or `combobox`. |
| Miller's law | Tables paginate (10–50 rows) and show "1–10 de 42"; filters are chips you can count; long forms are split into `Field` groups. |
| Doherty threshold | Waits under `--delay-feedback` (150ms) show nothing: the button spinner and `Spinner delay` fade in only after it. Above ~400ms show progress; use optimistic updates to avoid the wait. |
| Postel's law | `NumberInput` reads "1.234,5", "1,234.5", "12,5 €" and "−3" (`parseNumber`), and clamps on blur, not while typing. `Combobox` filters ignoring accents, case and spaces. |
| Jakob's law | Controls behave as people already know them: WAI-ARIA keyboard patterns (radiogroup, tabs, combobox), Escape closes, Enter selects. |
| Frequency of use | The more often something happens, the less it animates: menus and tooltips use the fast duration, and once one tooltip is open the next appears at once (`skipDelayDuration`). |
| Progressive disclosure | Advanced filters live in a popover with a count; the table shows actions on the row only when needed. |
| Optimistic update | Apply the change first and roll back on error, with React's `useOptimistic` (see the story). Pair with a toast on failure, never a silent revert. |
| Affordance | What can be clicked shows a pointer (base layer), a hover tint and a focus outline; nothing else does. |
| Layout shift | A loading button keeps its label's width (spinner on top); illustrations reserve their aspect ratio; numbers use tabular figures so they don't jiggle while updating. |
| Combobox | `combobox`: a searchable select for long lists, single or multiple. |

## Type

| Term | In the library |
|---|---|
| Kerning | On (`font-kerning: normal`, `optimizeLegibility`) for all text. |
| Tracking | Display sizes tighten (`--tracking-display`), mono caps open up (`tracking-wide`). Body text is untouched. |
| Leading | Tailwind's text sizes carry their line height; long-form text uses `leading-relaxed`. |
| x-height | Inter's tall x-height is why 13–14px UI text stays readable; don't swap the font for one with a small x-height. |
| Tabular numbers | Tables, `time`, `data` and `output` use tabular figures by default; metrics and numeric columns add `font-mono tabular-nums`. |
| Widow | Headings `text-wrap: balance`, paragraphs and list items `text-wrap: pretty` (base layer). |
| Line length | Running text stays around 60–75 characters (`max-w-prose`, articles at `max-w-3xl`). |
| Optical centre | Rule: center by eye, not by box. Icons in buttons are 16px against 14px text; asymmetric glyphs (play, arrows) get a 1px nudge toward their light side. |
| OKLCH | Every color token is oklch, so lightness steps are perceptual and contrast is computed in the tests. |
| Safe area | Sticky and fixed bars (`sticky-cta`, `cookie-consent`, `site-nav`, `app-shell`) pad by `env(safe-area-inset-*)`. Add `viewport-fit=cover` to the viewport meta. |
