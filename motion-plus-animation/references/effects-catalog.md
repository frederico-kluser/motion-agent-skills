# Catálogo de efeitos prontos

> **Gerado** por `scripts/refresh-effects.mjs` a partir de `https://motion.dev/llms.txt` (público, sem token).
> Não editar à mão. Atualizado em **2026-07-26** — 114 exemplos
> agrupados em 86 efeitos, nas plataformas React / JS / Vue.
>
> **Este índice é o público.** A biblioteca do Motion+ tem 400+ exemplos e o único acesso
> programático é o MCP: `mcp__motion__search-motion-codex`. Se nada aqui bater, pergunte a ele
> **antes** de escrever do zero.

Como usar: ache o efeito → abra pelo MCP ou pela URL → **adapte ao markup e ao CSS do projeto**.
Esta skill não troca o seu layout; ela anima o que já existe.

## Entrada e saída (mount/unmount)

| Efeito | O que faz | Onde |
|---|---|---|
| `animate-presence-modes` | An example of the three AnimatePresence modes (sync, wait, and popLayout) demonstrating how elements enter and exit the DOM with Motion for React. | [React](https://motion.dev/examples/react-animate-presence-modes) |
| `enter-animation` | An example of animating an element when it's added to the DOM using Motion for React. | [React](https://motion.dev/examples/react-enter-animation) |
| `exit-animation` | An example of animating an element when it's removed from the DOM using AnimatePresence in Motion for React. | [React](https://motion.dev/examples/react-exit-animation) |
| `infinite-loading` | An example of creating an infinite loading list with staggered animations in Motion for React. | [React](https://motion.dev/examples/react-infinite-loading) |
| `notifications-list` | An example of animating a list of animations as they're added and removed, using Motion for JavaScript's animation capabilities. It implements manual FLIP animations so that notifications animate into their new layouts. | [JS](https://motion.dev/examples/js-notifications-list) |
| `notifications-stack` | A iOS inspired notifications stack using Motion for React's variants. | [JS](https://motion.dev/examples/js-notifications-stack) · [React](https://motion.dev/examples/react-notifications-stack) |

## Scroll

| Efeito | O que faz | Onde |
|---|---|---|
| `parallax` | Scroll-linked parallax effect where background images move at a different speed to foreground content, creating a sense of depth. | [React](https://motion.dev/examples/react-parallax) · [JS](https://motion.dev/examples/js-parallax) |
| `scroll-fade` | An example of fading content in and out as you scroll using Motion's scroll function. | [JS](https://motion.dev/examples/js-scroll-fade) |
| `scroll-hide-header` | A sticky header that hides when scrolling down and reappears when scrolling up. Uses useMotionValueEvent to detect scroll direction. | [React](https://motion.dev/examples/react-scroll-hide-header) |
| `scroll-highlight` | An example of creating a scroll-triggered skill showcase with dynamic highlighting in Motion. | [JS](https://motion.dev/examples/js-scroll-highlight) |
| `scroll-image-reveal` | Images reveal with a clip-path curtain effect as you scroll. Uses useScroll with element targeting and useTransform for clipPath and scale. | [React](https://motion.dev/examples/react-scroll-image-reveal) |
| `scroll-pinning` | An example of pinning content on scroll and animating content horizontally using position: sticky and Motion's scroll function. | [JS](https://motion.dev/examples/js-scroll-pinning) |
| `scroll-triggered` | An example of using Motion's inView function to trigger animations when elements enter the viewport. | [JS](https://motion.dev/examples/js-scroll-triggered) |
| `scroll-velocity-linked-offset` | A 3D carousel with scroll velocity-linked wave effect using Motion for React. | [React](https://motion.dev/examples/react-scroll-velocity-linked-offset) |
| `scroll-zoom-hero` | An immersive hero section where the background image scales up, blurs, and fades as you scroll. Creates a dramatic entry effect. | [React](https://motion.dev/examples/react-scroll-zoom-hero) |
| `use-animation-frame` | An example of using Motion for React's useAnimationFrame hook to animate a 3D cube. | [React](https://motion.dev/examples/react-use-animation-frame) |

## Texto

| Efeito | O que faz | Onde |
|---|---|---|
| `characters-remaining` | An example of creating a character counter with spring animations in Motion | [JS](https://motion.dev/examples/js-characters-remaining) |
| `html-content` | An example using Motion for React to animate HTML content by rendering a MotionValue. | [React](https://motion.dev/examples/react-html-content) · [JS](https://motion.dev/examples/js-html-content) |
| `loading-fill-text` | An example of creating a text fill loading animation with Motion for React. | [Vue](https://motion.dev/examples/vue-loading-fill-text) · [JS](https://motion.dev/examples/js-loading-fill-text) · [React](https://motion.dev/examples/react-loading-fill-text) |
| `split-text` ★ | An example of creating a text reveal animation with split text in Motion for React | [React](https://motion.dev/examples/react-split-text) · [JS](https://motion.dev/examples/js-split-text) |
| `split-text-scatter` ★ | Demonstrate how to use the splitText function from Motion+ to create scatter text animations. | [JS](https://motion.dev/examples/js-split-text-scatter) |
| `split-text-wavy` ★ | Demonstrate how to use the splitText function from Motion+ to create wavy text animations. | [JS](https://motion.dev/examples/js-split-text-wavy) |
| `text-reveal` | An example of revealing text on hover using flexbox and Motion's layout animations. | [JS](https://motion.dev/examples/js-text-reveal) |
| `typewriter` | An example of a typewriter effect using Motion for JavaScript animation values. | [JS](https://motion.dev/examples/js-typewriter) |

## Layout compartilhado / morph

| Efeito | O que faz | Onde |
|---|---|---|
| `accordion` | An example of an accordion component using Motion for React. Animate accordion content using height: auto and accessible markup. Uses focus events and shared layout animations for keyboard accessibility. | [JS](https://motion.dev/examples/js-accordion) · [React](https://motion.dev/examples/react-accordion) |
| `app-store` | An example of animating cards inspired by the iOS App Store using Motion for React's layout animations. | [JS](https://motion.dev/examples/js-app-store) · [React](https://motion.dev/examples/react-app-store) |
| `app-store-layout` | An example of creating a card layout inspired by the iOS App Store with Modal functionality using Motion's animateLayout for shared element animations. | [JS](https://motion.dev/examples/js-app-store-layout) |
| `ios-app-folder` | An iOS-style app folder that expands to reveal apps inside, using Motion for React's layout animations and AnimatePresence. | [React](https://motion.dev/examples/react-ios-app-folder) |
| `layout-animation` | An example of animating a layout change using Motion for React's simple layout prop. | [React](https://motion.dev/examples/react-layout-animation) |
| `lightbox` | An example and tutorial for a lightbox shared element transition, using Motion's view function. | [JS](https://motion.dev/examples/js-lightbox) |
| `page-wipe` | An example of combining a full page wipe with a shared element transition using Motion's view function. The view function is built on the browser's native View Transition API. | [JS](https://motion.dev/examples/js-page-wipe) |
| `shared-view-animation` | Animate shared elements between states using View Transitions API via Motion's view() function. | [JS](https://motion.dev/examples/js-shared-view-animation) |
| `tab-select` | An example of using making a tab select component with Motion for React's shared layout animations. Because it uses onTap and whileFocus, it's keyboard-accessible by default. Try tabbing between the options and hitting Enter. | [React](https://motion.dev/examples/react-tab-select) |
| `view-animation` | An example of animating a layout change using the View Transitions API via Motion's simple view function. | [JS](https://motion.dev/examples/js-view-animation) |

## View transitions / página

| Efeito | O que faz | Onde |
|---|---|---|
| `family-dialog` | Family-style dialog using Motion. It uses the HTML dialog and Motion's animateView function for View Transitions. | [JS](https://motion.dev/examples/js-family-dialog) |

## Gestos e drag

| Efeito | O que faz | Onde |
|---|---|---|
| `bobble-hover` | A 3x3 grid of tiles that bobble with a spring when hovered, with the bounce scaled to how fast the pointer was moving, using Motion for React. | [React](https://motion.dev/examples/react-bobble-hover) |
| `card-stack` | An example of creating a swipeable card stack with photos in Motion for React. | [React](https://motion.dev/examples/react-card-stack) |
| `carousel-ios-exposure-slider` ★ | An example of creating a camera exposure slider interface with animated notches using the Motion+ Carousel component for React. | [React](https://motion.dev/examples/react-carousel-ios-exposure-slider) |
| `cursor-floating-target` ★ | An example of creating a floating target with rotating text and hover effects using the Motion+ Cursor and usePointerPosition. | [React](https://motion.dev/examples/react-cursor-floating-target) |
| `drag` | An example of making an element draggable using Motion for React's drag prop. | [React](https://motion.dev/examples/react-drag) |
| `gestures` | An example of using gestures to animate an element using Motion for React's simple whileTap and whileHover props. | [JS](https://motion.dev/examples/js-gestures) · [React](https://motion.dev/examples/react-gestures) |
| `hold-to-confirm` | A Motion for React example showing long-press interaction. The button's events update a progress motion value that drives multiple animations of other motion values. | [JS](https://motion.dev/examples/js-hold-to-confirm) · [React](https://motion.dev/examples/react-hold-to-confirm) |
| `hover` | An example of using Motion's hover function to animate elements as a user hovers over them. hover() automatically filters out polyfilled hover events from touch screens, which can normally lead to broken visual states. | [JS](https://motion.dev/examples/js-hover) |
| `image-reveal-slider` | An example of creating an interactive image comparison slider with Motion for React. | [JS](https://motion.dev/examples/js-image-reveal-slider) · [React](https://motion.dev/examples/react-image-reveal-slider) |
| `ios-slider` | An example of recreating the iOS slider using Motion for React. This example uses useTransform to map input to slider state, and slider state to pull, squish and squash animations. It uses React'setModal onFocus and onBlur to set up keyboard-accessible inputs, with Motion's whileFocus prop to animate a custom focus indicator. | [JS](https://motion.dev/examples/js-ios-slider) · [React](https://motion.dev/examples/react-ios-slider) |
| `material-design-ripple` | An example of creating a press ripple with Motion for React, inspired by Google Material Design. | [JS](https://motion.dev/examples/js-material-design-ripple) · [React](https://motion.dev/examples/react-material-design-ripple) |
| `press` | An example of using Motion's press function to animate elements as a user presses them. press() automatically filters out right clicks and secondary touch points. Every element with a press gesture is keyboard accessible by default. | [JS](https://motion.dev/examples/js-press) |
| `swipe-actions` | iOS-style swipe actions where UI elements and animations respond dynamically to swipe progress. Actions trigger via taps or full swipes (for primary actions). A modern, space-efficient alternative to dropdown menus that keeps actions hidden behind the main item until revealed by a swipe gesture. | [React](https://motion.dev/examples/react-swipe-actions) |
| `todo-list` | A draggable to-do list with animated checkboxes and strikethrough effects using Motion for React's Reorder component. | [React](https://motion.dev/examples/react-todo-list) |

## Cursor e ponteiro

| Efeito | O que faz | Onde |
|---|---|---|
| `conic-gradient-pointer` | An example of creating a dynamic conic gradient that follows the pointer position. | [JS](https://motion.dev/examples/js-conic-gradient-pointer) |
| `cursor-trail` | An example of creating a cursor trail with images in Motion for React. | [React](https://motion.dev/examples/react-cursor-trail) |
| `cursor-trail-velocity` | An example of creating a cursor trail with velocity-based inertia animations in Motion for React. | [React](https://motion.dev/examples/react-cursor-trail-velocity) |
| `follow-pointer-with-spring` | An example of making an element follow the pointer with a spring using Motion for React's useSpring hook. | [React](https://motion.dev/examples/react-follow-pointer-with-spring) |
| `magnetic-filings` | An example of creating a grid of metal filings that rotate to point towards the cursor position using Motion for React. | [React](https://motion.dev/examples/react-magnetic-filings) |
| `spring-follow-cursor` | An example of a spring animation that follows the cursor. | [JS](https://motion.dev/examples/js-spring-follow-cursor) |
| `tilt-card` | A card that tilts based on pointer position using Motion for React's useSpring hook. | [JS](https://motion.dev/examples/js-tilt-card) · [React](https://motion.dev/examples/react-tilt-card) |

## Loading e progresso

| Efeito | O que faz | Onde |
|---|---|---|
| `apple-intelligence` | An example of the 'ripple' part of the Apple Intelligence animation using Motion for React. It uses a cloned version of the current content rather than using shaders. | [React](https://motion.dev/examples/react-apple-intelligence) |
| `loading-circle-spinner` | An example of creating a circle spinner loading animation with Motion for React. | [Vue](https://motion.dev/examples/vue-loading-circle-spinner) · [JS](https://motion.dev/examples/js-loading-circle-spinner) · [React](https://motion.dev/examples/react-loading-circle-spinner) |
| `loading-infinite-path-drawing` | An example of creating an infinite path drawing loading animation with Motion. This example uses svgEffect to animate the path. svgEffect is the next-generation Motion SVG renderer that makes it easy to create these infinitely looping drawing animations. In a future version of Motion it'll be possible to just use the animate function below without the svgEffect setup. | [JS](https://motion.dev/examples/js-loading-infinite-path-drawing) |
| `loading-jumping-dots` | An example of creating a jumping dots loading animation with Motion for React. | [Vue](https://motion.dev/examples/vue-loading-jumping-dots) · [JS](https://motion.dev/examples/js-loading-jumping-dots) · [React](https://motion.dev/examples/react-loading-jumping-dots) |
| `loading-line-reveal` | An example of creating a line reveal loading animation with clipPath in Motion for React | [Vue](https://motion.dev/examples/vue-loading-line-reveal) · [JS](https://motion.dev/examples/js-loading-line-reveal) · [React](https://motion.dev/examples/react-loading-line-reveal) |
| `loading-progress-bar` | An example of creating a progress bar loading animation with Motion for React. | [Vue](https://motion.dev/examples/vue-loading-progress-bar) · [JS](https://motion.dev/examples/js-loading-progress-bar) · [React](https://motion.dev/examples/react-loading-progress-bar) |
| `loading-ripple` | An example of creating a ripple loading animation with Motion for React. | [Vue](https://motion.dev/examples/vue-loading-ripple) · [JS](https://motion.dev/examples/js-loading-ripple) · [React](https://motion.dev/examples/react-loading-ripple) |
| `loading-three-dots-pulse` | An example of creating a pulsing dots loading animation with Motion for React. | [Vue](https://motion.dev/examples/vue-loading-three-dots-pulse) · [JS](https://motion.dev/examples/js-loading-three-dots-pulse) · [React](https://motion.dev/examples/react-loading-three-dots-pulse) |
| `multi-state-badge` | A badge that can be in multiple states, such as processing, success, or error. | [JS](https://motion.dev/examples/js-multi-state-badge) · [React](https://motion.dev/examples/react-multi-state-badge) |
| `svg-loading-spinner` | An example of using Motion to animate an SVG loading spinner. | [JS](https://motion.dev/examples/js-svg-loading-spinner) |

## SVG e path

| Efeito | O que faz | Onde |
|---|---|---|
| `motion-path` | An example of animating an element along a path using Motion for React. | [React](https://motion.dev/examples/react-motion-path) |
| `path-drawing` | An example of animating a SVG path to make a path drawing effect, using Motion for React. | [React](https://motion.dev/examples/react-path-drawing) |
| `path-morphing` | An example of creating smooth SVG path morphing animations with Motion for React. | [React](https://motion.dev/examples/react-path-morphing) |
| `svg-path-morphing` | An example of using Motion and Flubber to animate an SVG between different shapes. | [JS](https://motion.dev/examples/js-svg-path-morphing) |

## 3D e transformações

| Efeito | O que faz | Onde |
|---|---|---|
| `rotate` | An example of animation the rotation of an element with Motion for React | [JS](https://motion.dev/examples/js-rotate) · [React](https://motion.dev/examples/react-rotate) |
| `three` | An example of a rotating cube using Three.js and Motion. | [JS](https://motion.dev/examples/js-three) |

## Cor e gradiente

| Efeito | O que faz | Onde |
|---|---|---|
| `color-interpolation` | A comparison of color interpolation between Motion and the browser's native interpolation. Motion uses linear RGB color space, which avoids the dimming effect suffered by browser interpolation. | [JS](https://motion.dev/examples/js-color-interpolation) |

## Sobreposições (modal, tabs, acordeão)

| Efeito | O que faz | Onde |
|---|---|---|
| `command-palette` | A ⌘K-style command palette with spring-animated entrance, filtered search, and keyboard navigation | [React](https://motion.dev/examples/react-command-palette) |
| `modal` | An example of a modal dialog using Motion and the HTML <dialog /> element. This example demonstrates smooth animations for opening and closing the modal, with a backdrop overlay and click-outside-to-close functionality. | [JS](https://motion.dev/examples/js-modal) |
| `smooth-tabs` | Segmented control with sliding indicator and directional content transitions | [React](https://motion.dev/examples/react-smooth-tabs) |

## Springs e easing

| Efeito | O que faz | Onde |
|---|---|---|
| `bounce-easing` | A toggle switch that demonstrates custom easing functions with both bounce and spring animations. | [JS](https://motion.dev/examples/js-bounce-easing) |
| `css-spring` | An example of generating a spring animation in CSS using Motion's spring function. | [React](https://motion.dev/examples/react-css-spring) |
| `keyframes` | An example of animating an element using keyframes with Motion for React. | [React](https://motion.dev/examples/react-keyframes) |
| `keyframes-wildcards` | An example of using Motion for React's keyframe wildcards to create interruptible keyframe animations. | [React](https://motion.dev/examples/react-keyframes-wildcards) |
| `options` | An example of using easing and duration options to customise a scale animation in Motion. | [JS](https://motion.dev/examples/js-options) |
| `spring` | An example of a spring animation in Motion. | [JS](https://motion.dev/examples/js-spring) |
| `stagger` | An example of staggering animations in Motion using its stagger() function. | [JS](https://motion.dev/examples/js-stagger) |
| `staggered-grid` | An example of animating elements with a delay staggered by physical distance. | [JS](https://motion.dev/examples/js-staggered-grid) |
| `transition` | An example of setting transition options in Motion for React. | [React](https://motion.dev/examples/react-transition) |
| `variants` | An example of orchestrating animation sequences using Motion for React's variants. | [React](https://motion.dev/examples/react-variants) |

★ = usa API exclusiva do Motion+ (`splitText`, `Carousel`, `Cursor`, …) — ver
`references/premium-components.md`.
