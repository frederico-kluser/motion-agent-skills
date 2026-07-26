# Fora do React: `motion` (JS puro) e `motion-v` (Vue)

> A capacidade é a mesma; muda a assinatura. É aqui que esta skill vai além da `motion-plus-ui`,
> que é React-only. Ao pedir exemplo ao MCP, passe a `platform` certa
> (`mcp__motion__search-motion-codex { platform: "js" | "vue" | "react" }`) — o catálogo tem
> variantes por plataforma (`js-*`, `vue-*`, `react-*`).

## JavaScript puro — `import … from "motion"`

Funciona em qualquer stack (incluindo Webflow, WordPress e Squarespace, que têm guia próprio).

### O núcleo

| API | O que faz |
|---|---|
| **`animate(target, keyframes, options)`** | O motor. Aceita seletor CSS, Element, array de elementos ou MotionValue. Acelerado por hardware quando dá. |
| **`scroll(callback \| animation, options)`** | Liga progresso de scroll a uma animação ou callback. Base de parallax, progresso e pinning. |
| **`inView(target, callback, options)`** | Dispara quando o elemento entra na viewport. |
| **`animateView()`** | Transições de view via View Transitions API — **grátis** desde `motion@12.41.0`. |
| **`animateLayout()`** | Anima mudança de layout (FLIP com correção de escala). |
| **`hover()` / `press()` / `resize()`** | Gestos com as arestas já resolvidas: `hover` filtra hover falso de touch; `press` ignora clique direito e toque secundário, e é acessível por teclado. |

### Utilitários

`spring()` · `stagger()` · `delay()` · `frame()` · `mix()` · `transform()` · `wrap()` · `arc()`
(movimento em arco) · `easing-functions` (as curvas nomeadas).

`wrap()` é o que resolve índice circular de paginação/loop.

### Motion values

`motionValue()` · `springValue()` · `transformValue()` · `mapValue()` — valores animáveis que
atualizam o estilo **sem** passar por re-render de framework nenhum.

### Effects (renderizadores)

`styleEffect` · `attrEffect` · `propEffect` · `svgEffect` — ligam um motion value a estilo,
atributo, propriedade ou path SVG. `svgEffect` é o renderizador de nova geração para desenho de
path (é o que faz o loop infinito de "path drawing" ficar simples).

### Motion+ no JS

`splitText()` · `scrambleText()` · `curtains()` — mesmos primitivos premium, versão DOM.
Ver [`premium-components.md`](./premium-components.md).

```js
import { animate, stagger, inView } from "motion"
import { splitText } from "motion-plus"

const { chars } = splitText("h1")
inView("h1", () => animate(chars, { opacity: [0, 1], y: [12, 0] }, { delay: stagger(0.04) }))
```

## Vue — `motion-v`

Paridade quase completa com o React: variants, gestos, scroll, layout animations.

### Duas formas de aplicar

- **Componente**: `<motion.div>` — a mesma API declarativa do React.
- **Diretiva `v-motion`**: adiciona gestos, layout e variants a **qualquer** elemento HTML/SVG, sem
  wrapper. Não tem equivalente no React e costuma ser o caminho mais limpo para animar markup que
  já existe — exatamente o caso desta skill.

### Componentes

`AnimatePresence` (via prop `exit`) · `LayoutGroup` · `MotionConfig` · `LazyMotion` (bundle a partir
de ~6kb) · `Reorder`.

### Motion+ no Vue

`AnimateNumber` · `Carousel` · `Cursor` · `Ticker` · `Typewriter`.
*(`ScrambleText` só tem doc de React e JS — confirme no MCP antes de prometer em Vue.)*

### Hooks

Os mesmos nomes do React: `useAnimate`, `useAnimationFrame`, `useDragControls`, `useInView`,
`useMotionTemplate`, `useMotionValueEvent`, `useReducedMotion`, `useScroll`, `useSpring`, `useTime`,
`useTransform`, `useVelocity`.

### Primitivos headless

Integração documentada com **Reka UI** (o equivalente Vue do Radix) — mesma ideia do React: o
primitivo cuida de foco/teclado/ARIA, o Motion cuida da coreografia.

## O que vale igual nas três plataformas

- Anime só `transform`, `opacity`, `filter`.
- Movimento físico → spring; valor visual → tween.
- Reduced motion não é opcional; o estado reduzido mostra 100% do conteúdo.
- Motion escreve **estilo inline**, então sobrepõe classe de CSS/Tailwind: estilo estático vem da
  sua classe, o que anima vem do Motion.

## Referências

- [Get started with Motion (JS)](https://motion.dev/docs/quick-start) · [animate](https://motion.dev/docs/animate) · [scroll](https://motion.dev/docs/scroll)
- [Get started with Motion for Vue](https://motion.dev/docs/vue) · [Motion Directive](https://motion.dev/docs/vue-directive) · [Reka](https://motion.dev/docs/vue-radix)
- [Webflow](https://motion.dev/docs/webflow) · [WordPress](https://motion.dev/docs/wordpress) · [Squarespace](https://motion.dev/docs/squarespace)
- [Migrar do GSAP](https://motion.dev/docs/migrate-from-gsap-to-motion) · [GSAP vs Motion](https://motion.dev/docs/gsap-vs-motion)

**Última atualização:** 2026-07-26
