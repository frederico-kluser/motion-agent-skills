# Motion for React — core API reference

> Package `motion` (line 12; latest `12.42.2`, 2026-07-01. React ≥ 18.2). Import everything from
> `motion/react`. `framer-motion` is a same-version mirror — never import from it. For Next.js
> Server Components, add `"use client"` or import from `motion/react-client`.
> When an exact prop/signature matters, confirm with `mcp__motion__search-motion-codex`.
>
> **Num projeto Motion UI isto é o passo 4 da cascata**, não o ponto de partida: só se chega aqui
> depois de o catálogo ([`catalog.md`](./catalog.md)) não ter o que resolve. E o `transition` vem
> dos tokens ([`theme-and-lookfeel.md`](./theme-and-lookfeel.md)), não de números escritos à mão.

## The `motion.*` component

Prefix any HTML/SVG tag: `motion.div`, `motion.button`, `motion.circle`, `motion.path`, …

Core props:

- **`animate`** — the target; when it changes, Motion animates to it. Accepts keyframes
  (`animate={{ x: [0, 100, 0] }}`) and the wildcard first frame (`[null, 100, 0]` = "from current").
- **`initial`** — the mount state. `initial={false}` disables the entrance animation (render at target).
- **`exit`** — the unmount state; **requires an `<AnimatePresence>` ancestor**.
- **`transition`** — timing/physics (see below).
- **`variants`** + named labels — `initial="hidden" animate="visible"`; named states that
  **propagate down the tree** and orchestrate (`when`, `delayChildren`, `staggerChildren`).
- **`style`** — supports transform shorthands: `x`, `y`, `z`, `scale`, `scaleX/Y`, `rotate`,
  `rotateX/Y/Z`, `skew`, `originX/Y/Z`. Bind MotionValues here.
- **`layout`** / **`layoutId`** — animate layout changes (FLIP, scale-corrected) and shared-element
  transitions across components. Wrap related trees in `<LayoutGroup>`.
- **`drag`** (`"x"`/`"y"`/`true`) + **`dragConstraints`**, **`dragElastic`**, **`dragMomentum`**,
  **`dragTransition`** (inertia), **`dragControls`**.

## Gestures

`whileHover`, `whileTap`, `whileFocus`, `whileDrag`, `whileInView` (animate a transient state),
plus callbacks `onHoverStart/End`, `onTap`, `onDrag`, `onViewportEnter/Leave`, etc.
`whileInView` takes `viewport={{ once, amount, margin }}`.

## Transitions (`transition`)

`type`: `"tween"` | `"spring"` | `"inertia"`.

- **Tween** — `duration` (default `0.3`; `0.8` with multiple keyframes), `ease`
  (`"linear"`, `"easeIn/Out/InOut"`, `"circOut"`, `"backInOut"`, `"anticipate"`, a cubic-bezier
  array `[.17,.67,.83,.67]`, or a JS easing fn), `times` (keyframe offsets 0–1).
- **Spring (physical)** — `stiffness`, `damping` (default `10`), `mass`, `velocity`, `restSpeed`,
  `restDelta`.
- **Spring (duration-based, preferred)** — `bounce` (default `0.25`) + `visualDuration` (seconds
  to *visually* reach target). Easier to reason about than stiffness/damping.
- **Inertia / drag** — `power`, `timeConstant`, `modifyTarget`, `min`/`max`, `bounceStiffness`,
  `bounceDamping`.
- **Orchestration** — `delay`, `repeat`, `repeatType` (`"loop"`/`"reverse"`/`"mirror"`),
  `repeatDelay`, `when` (`"beforeChildren"`/`"afterChildren"`), `delayChildren`, and
  `staggerChildren` — or the `stagger(0.1, { from: "last" })` helper.
- **Per-value transitions** — nest by key:
  `transition={{ default: {…}, opacity: { duration: 0.2 }, x: { type: "spring" } }}`.
- **Curved motion** — `path: arc()` produces a curved path between `x`/`y` keyframes.

**Defaults:** physical values (`x`, `scale`, `rotate`) animate as spring; visual values
(`opacity`, `color`, `backgroundColor`) animate as tween.

## Components

- **`<AnimatePresence>`** — enables `exit` for children leaving the tree. Props: `mode`
  (`"sync"` default / `"wait"` serialize / `"popLayout"` pop leaving element from flow),
  `initial`, **`custom`** (feeds dynamic data to variant functions — the correct way to do
  direction-aware exits). Children need stable, unique `key`s.
- **`<LayoutGroup>`** — namespaces `layoutId` and coordinates layout animations across siblings.
- **`<MotionConfig>`** — sets a default `transition` and `reducedMotion` (`"user"`/`"always"`/`"never"`)
  + `nonce` for the whole subtree.
- **`<LazyMotion>`** — code-split the runtime (`features={domAnimation|domMax}`), render `m.*`
  from `motion/react-m`. **Incompatible with `motion-plus` premium when `strict`.**
- **`<Reorder.Group>` / `<Reorder.Item>`** — drag-to-reorder lists (`values` + `onReorder`).
- **`<AnimateView>`** — view/route transitions. **Free since `motion@12.41.0`** (2026-06-23), when
  `animateView` graduated from Motion+ Early Access into the main library. Not premium any more.
- **`<AnimateActivity>`** — enter/exit/layout inside React's `<Activity>` boundaries. Also core.

## Motion values & hooks

- **`useMotionValue(initial)`** — a value that updates without React re-render. **Never call
  `.get()` in render** — derive instead.
- **`useTransform`** — map a value: range form `useTransform(x, [0, 100], [0, 1])` (preferred) or
  the argless reactive form `useTransform(() => x.get() * 2)`. The `useTransform(x, v => …)`
  closure form is deprecated.
- **`useScroll`** — `{ scrollX, scrollY, scrollXProgress, scrollYProgress }`; pass
  `{ target, offset, container }` for element-relative progress.
- **`useSpring`** — smooth a value/another MotionValue with spring physics.
- **`useVelocity`**, **`useTime`**, **`useMotionTemplate`** (` `${x}px` ` → MotionValue string),
  **`useMotionValueEvent(value, "change", cb)`**.
- **`useAnimate`** — returns `[scope, animate]` for imperative sequences; the returned controls
  expose `.speed`, `.time`, `.play()`, `.pause()`, `.stop()`, `.then()`.
- **`useInView(ref, { once, amount, margin })`**, **`usePageInView`**, **`useDragControls`**,
  **`useReducedMotion`**, **`useAnimationFrame`**.
- Standalone functions exported from `motion`: **`animate()`**, **`stagger()`**, **`scroll()`**,
  **`inView()`**, **`spring()`**, **`hover()`**, **`press()`**.

## What Motion can animate

Any CSS value; colors across formats (hex/rgba/hsla/oklch/oklab/`color-mix`); `width`/`height`
to/from `"auto"`; CSS variables (`"--x"`); SVG path drawing (`pathLength`, `pathSpacing`,
`pathOffset`); and independent transforms. In Next.js, `motion/react-client` ships less client JS
for mostly-static entrances.
