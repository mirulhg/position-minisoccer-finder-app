# 001 — Entrance animation for the results reveal

- **Status**: DONE
- **Commit**: 7c741d7
- **Severity**: MEDIUM
- **Category**: Missed opportunities (delight, rare/first-time moment)
- **Estimated scope**: 2 files, ~15 lines (1 new CSS rule + 1 token + 1 className)

## Problem

`ResultsScreen.tsx` renders the main position reveal — the single highest-emotion moment in the product (the payoff after a full onboarding + questionnaire flow) — with zero motion. It pops in fully formed like every other settings/utility screen in the app.

```tsx
// src/features/results/components/ResultsScreen.tsx:98-100 — current
<div className="md:col-span-2">
  <MainPositionHeader positionScore={result.mainPosition} confidenceLabel={result.confidenceLabel} />
</div>
```

This screen mounts exactly once per result (see `src/app/router.tsx` — `screen === 'results'` renders `<ResultsScreen>` without a changing `key`, so it is not remounted on re-render). There is currently no motion library, no `@keyframes`, and no CSS custom properties for easing anywhere in the repo (`grep -rn "framer-motion\|@keyframes\|--ease" src` returns nothing) — this plan establishes the first easing token rather than picking from existing ones.

## Target

A one-time entrance: the header block fades and rises into place on mount, using CSS `@starting-style` (no JS, no library, matches this repo's existing preference for modern CSS platform features like `dvh` and `env()` over polyfills/JS).

```css
/* src/index.css — target */
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1); /* strong ease-out for UI entrances */
}

@layer components {
  .results-reveal {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 400ms var(--ease-out),
      transform 400ms var(--ease-out);

    @starting-style {
      opacity: 0;
      transform: translateY(8px);
    }
  }
}
```

```tsx
/* src/features/results/components/ResultsScreen.tsx:98 — target */
<div className="md:col-span-2 results-reveal">
  <MainPositionHeader positionScore={result.mainPosition} confidenceLabel={result.confidenceLabel} />
</div>
```

400ms sits in the AUDIT.md "Modals, drawers: 200–500ms" budget — the closest category to a full-screen reveal, and appropriate for a rare, high-emotion moment rather than a frequent UI transition. `ease-out` because this is an entrance (AUDIT.md §2 decision order: "Entering or exiting → ease-out"). `translateY(8px)` + `opacity: 0`, never `scale(0)` (AUDIT.md §3 physicality rule).

## Repo conventions to follow

- No easing/duration tokens exist yet anywhere in the repo — this plan creates the first one, `--ease-out`, as a `:root` custom property in `src/index.css` (the project's one global stylesheet, already holding the only other cross-cutting motion rule — the `prefers-reduced-motion` block at the bottom of the same file). Any future animation plan should reuse this same `--ease-out` token rather than hand-typing a new cubic-bezier.
- Tailwind v4 (`@import 'tailwindcss'` at `src/index.css:1`) supports native CSS nesting and `@layer` — use `@layer components` for this new rule, parallel to the existing `@layer base` block already in the file, so it composes correctly with Tailwind's own layers instead of fighting utility specificity.
- Exemplar for "reduced-motion already handled at the global level, don't re-solve it locally": `src/index.css:43-51` already zeroes `transition-duration` (and `animation-duration`) for every element under `prefers-reduced-motion: reduce`. Do not add a second, local reduced-motion rule for `.results-reveal` — the existing global block already covers it (see Verification).
- Styling elsewhere in this codebase is Tailwind utility classes directly in JSX (see any component under `src/components/ui/`); this plan's one exception (a named CSS class) is deliberate because `@starting-style` cannot be expressed as a Tailwind utility — keep the exception scoped to exactly this one class.

## Steps

1. Open `src/index.css`. Immediately after line 2 (`@config '../tailwind.config.ts';`) and before the existing `@layer base { ... }` block, insert:
   ```css
   :root {
     --ease-out: cubic-bezier(0.23, 1, 0.32, 1); /* strong ease-out for UI entrances */
   }
   ```
2. In the same file, after the closing `}` of the existing `@layer base { ... }` block (currently ending at line 41) and before the `@media (prefers-reduced-motion: reduce)` block (currently starting at line 43), insert a new block:
   ```css
   @layer components {
     .results-reveal {
       opacity: 1;
       transform: translateY(0);
       transition:
         opacity 400ms var(--ease-out),
         transform 400ms var(--ease-out);

       @starting-style {
         opacity: 0;
         transform: translateY(8px);
       }
     }
   }
   ```
3. Open `src/features/results/components/ResultsScreen.tsx`. On line 98, change:
   ```tsx
   <div className="md:col-span-2">
   ```
   to:
   ```tsx
   <div className="md:col-span-2 results-reveal">
   ```
   (this is the wrapper immediately around `<MainPositionHeader ... />` at line 99 — do not touch any other `md:col-span-2` wrapper in this file).

## Boundaries

- Do NOT touch `MainPositionHeader.tsx` itself, `PillarRadar.tsx`, `PillarBreakdown.tsx`, `RoleCard.tsx`, or any other results-screen component — this plan is scoped to the one header wrapper only. (Animating the radar/pillar breakdown was explicitly rejected in the animation-opportunities sweep this plan came from: those are data the user is reading, and stacking a second staggered reveal right below this one would compete with it.)
- Do NOT modify the existing `@media (prefers-reduced-motion: reduce)` block in `src/index.css:43-51` — it already covers this new rule.
- Do NOT add a motion library (Framer Motion, React Spring, etc.) or any new dependency. This is plain CSS only.
- Do NOT add a `data-mounted` / JS fallback for `@starting-style`. If a step doesn't match the code you find (drift since commit `7c741d7`), STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx tsc -b` (expect no errors), `npx oxlint` (expect no errors), `npm run build` (expect a clean Vite build — this also confirms Lightning CSS accepts the nested `@starting-style` syntax), `npm test` (expect the existing 38/38 to still pass — this plan touches no logic).
- **Feel check**: `npm run dev`, open the app, complete onboarding and the questionnaire to reach the Results screen (or reload if already on it — the header block should replay its entrance on every fresh mount of `ResultsScreen`, i.e. once per completed assessment).
  - The "Posisi utamamu" / position name block should fade in and rise ~8px into place over ~400ms — no hard pop, no flash of the header at full opacity before the animation starts.
  - Nothing else on the Results screen should move — the radar, role cards, pillar breakdown, etc. must remain exactly as static as they are today.
  - In DevTools → Animations panel, set playback to 10% and confirm the motion is a smooth opacity+translateY ease-out with no scale, no jump, no double-expose of two states.
  - In DevTools → Rendering panel, enable "Emulate CSS media feature prefers-reduced-motion: reduce", reload, and reach the Results screen again: the header must still end up fully visible in its final position, but the transition should be imperceptibly fast (governed by the existing global `0.01ms` override) rather than the full 400ms rise.
- **Done when**: `results-reveal` plays exactly once per Results screen mount, no other element on the screen animates, all four mechanical checks pass, and the reduced-motion behavior above is confirmed.
