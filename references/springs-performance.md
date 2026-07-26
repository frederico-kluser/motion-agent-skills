# Springs, CSS easing, performance & reduced motion

## Springs in Motion

Prefer the **duration-based** spring — it's intuitive and easy to coordinate:

```ts
const transition = { type: "spring", visualDuration: 0.5, bounce: 0.2 };
```

- `visualDuration` — seconds for the value to *appear* to reach its target.
- `bounce` — `0` (no overshoot) … `1` (very springy); default `0.25`.

Physical params (`stiffness`, `damping` default `10`, `mass`, `velocity`) still work; reach for
them only when porting an existing physical feel. Non-numeric / multi-value cases also accept
`{ type: "spring", bounce, visualDuration }`.

**Name once, reuse.** Define the project's spring vocabulary in a single module and import it —
*don't* scatter ad-hoc curves across components. Sanity-check a config visually with
`mcp__motion__visualise-spring`.

> **Num projeto Motion UI esse módulo já existe e é o `motion.theme.ts`.** Não crie um
> `transitions.ts` paralelo: consuma `useMotionUITransition("snap"|"ui"|"gentle"|"lively"|"ambient")`
> e ajuste os números lá, num lugar só. Ver [`theme-and-lookfeel.md`](./theme-and-lookfeel.md).
> O bloco abaixo é o padrão para projetos **sem** Motion UI:

```ts
// transitions.ts — the principle, not prescribed values
export const snappy   = { type: "spring", visualDuration: 0.3, bounce: 0.2 } as const;
export const gentle   = { type: "spring", visualDuration: 0.6, bounce: 0.1 } as const;
export const playful  = { type: "spring", visualDuration: 0.5, bounce: 0.5 } as const;
```

## CSS `linear()` springs (no Motion runtime)

For a pure-CSS target, generate the curve with the MCP and paste it:

- `mcp__motion__generate-css-spring` ({ bounce, duration }) — returns `"<calcDuration> linear(…)"`.
  Example — `bounce: 0.2, duration: 0.5` →
  `550ms linear(0, 0.2606, 0.7094, 1.0343, 1.158, 1.1389, 1.0674, 1.006, 0.977, 0.975, 0.9856, 0.9967, 1.003, 1.0043, 1.0029, 1.001, 0.9997, 1)`

  ```css
  transition: transform 550ms linear(0, 0.2606, 0.7094, 1.0343, 1.158, /* …trimmed… */ 1);
  ```

  Note: the **perceptual** duration you asked for (0.5s) differs from the **calculated** duration
  in the output (550ms). When coordinating *other* animations, use the perceptual value you asked for.

- `mcp__motion__generate-css-bounce-easing` ({ duration }) — gravity-style bounce; looks best
  around `1s` (longer = lighter/lower gravity, shorter = heavier).

In Motion itself you never need this — `import { spring } from "motion"` directly.

## Performance rules (the MotionScore basis)

1. **Animate only `transform`, `opacity`, `filter`** (compositor-only; no layout/paint).
   Never animate `top`/`left`/`width`/`height`/`margin`/`padding`. For size/position changes, use
   the `layout` prop (Motion does FLIP with scale correction) rather than animating the box model.
2. **`will-change`**: let Motion manage it. A hard-coded, never-removed `will-change` keeps a GPU
   layer alive permanently (memory + compositor cost).
3. **Scroll-linked work must not jank.** Verify in the Performance panel: no Layout/Recalc spikes
   while scrolling. Keep `useScroll` consumers mapping to transform/opacity only.
4. **`overflow-x: hidden` on an ancestor breaks `position: sticky`** (which scroll pinning relies
   on). Use `overflow-x: clip`.

## MotionValue rules

- **Never read a MotionValue in render** (`value.get()` in the JSX/body is a bug — it won't update
  the DOM and can warn). Derive a display value and bind it:

  ```tsx
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [0, 1]); // ✅ range form
  return <motion.div style={{ x, opacity }} />;
  ```

- The **deprecated** `useTransform(value, v => …)` closure form → use the **range** form
  (`useTransform(value, [in], [out])`) or the **argless reactive** form
  (`useTransform(() => value.get() * 2)`).
- Compose with `useSpring`, `useVelocity`, `useMotionTemplate`. Subscribe with
  `useMotionValueEvent(value, "change", cb)` (not by reading in render).

## Reduced motion (accessibility — required)

- **Global**: wrap the app once.

  ```tsx
  import { MotionConfig } from "motion/react";
  <MotionConfig reducedMotion="user"><App /></MotionConfig>
  ```

  This neutralises transform/layout animations from `animate`/`whileInView`/`exit` while keeping
  opacity/color crossfades (so content still appears).

  Com Motion UI, o equivalente é `reducedMotion: "calm"` no `motion.theme.ts` (tira o *travel*,
  mantém os fades) ou `"off"`. Os dois podem coexistir; o tema cobre o que as seções fazem, o
  `MotionConfig` cobre o resto da app.

- **Scroll-driven / continuous / autoplay** effects aren't covered by `MotionConfig` — gate them:

  ```tsx
  import { useReducedMotion } from "motion/react";
  const shouldReduce = useReducedMotion();
  // if shouldReduce: render the final/static state; skip the parallax/marquee/loop.
  ```

- The reduced-motion fallback must present **100%** of the content (no permanently-hidden or
  mid-animation states). Canonical docs: `motion://docs/react/use-reduced-motion` (via the MCP).
