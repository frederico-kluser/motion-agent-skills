# Catálogo Motion UI — o que já existe pronto

> **Gerado** por `scripts/refresh-catalog.mjs` a partir de `https://api.motion.dev/ui/registry/index.json`.
> Não editar à mão. Atualizado em **2026-07-26** — 64 itens: **26 seções** + **35 componentes** + infraestrutura.
> `Motion+` = puxa `@motionplus/core` (precisa do `.npmrc` com escopo). `Base UI` = primitivo acessível por baixo.

Instalar qualquer item: `npx shadcn@latest add @motion/<name>`

## Passo 1 da cascata — achar pela intenção

| Quero… | Usar |
|---|---|
| hero / capa / topo da landing | hero-editorial-stagger · hero-parallax-layers · hero-terminal · text-split-reveal |
| preços / planos / pricing | pricing-tiers-morph · pricing-usage-slider · pricing-border-beam |
| FAQ / perguntas / acordeão | faq-plus-minus (seção) · accordion (componente) |
| depoimentos / testimonials | testimonials-stack · card-stack |
| logos de clientes / marquee / ticker | logo-ticker |
| números / métricas / contador animado | stats-counters · stats-live-panel |
| bento / grid de features | bento-staggered · feature-expand |
| menu / navegação / mega menu | nav-mega-menu · nav-command-palette |
| ⌘K / busca / command palette | command-palette (componente) · nav-command-palette (seção) |
| CTA / banner de conversão | cta-banner-magnetic · cta-signup-celebrate |
| rodapé / newsletter | footer-newsletter |
| modal / drawer / gaveta / sheet | sheet · overlay · overlay-sheet |
| toast / notificações | toast-stack · list-notifications-stack |
| loading / skeleton / progresso | skeleton · loader-skeleton · progress-bar |
| carrossel / slider de imagens | coverflow · carousel-controls |
| abas / tabs / segmented control | smooth-tabs · segmented-toggle |
| transição de página / rota | page-curtains · page-mask-transitions · page-curtain · mask-wipe |
| revelar ao rolar / scroll reveal | stagger-reveal · split-reveal · scroll-zoom-reveal · screenshot-scroll-reveal · scroll-spotlight |
| parallax | parallax-layers · hero-parallax-layers |
| header que encolhe ao rolar | shrink-header |
| botão de compra / add to cart | add-to-basket · button-add-to-basket |
| botão com estados (loading/ok/erro) | multi-state-button |
| segurar para confirmar | hold-to-confirm · button-hold-to-confirm |
| botão de copiar | copy-button |
| link com seta | arrow-link |
| borda animada / glow no card | border-beam |
| card que expande | expand-card |
| card com tilt 3D | tilt-card |
| swipe / ações ao arrastar (iOS) | swipe-actions |
| confete / celebração | confetti · cta-signup-celebrate |
| cursor magnético | magnetic-pull |
| gráfico pequeno / sparkline | sparkline |
| texto embaralhado / scramble | scramble-reveal |
| terminal / bloco de código animado | terminal-session · hero-terminal |

Nada bateu? Refine com `node scripts/motion-ui.mjs search "<termo>"` e consulte o
`mcp__motion__search-motion-codex` (MCP ≥ 6.2.0 devolve o source Motion UI completo)
**antes** de decidir que o catálogo não cobre o caso.

## Seções (`registry:block`) — blocos de página inteiros

### Bento — `bento-grids`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `bento-staggered` | An example of a staggered feature bento with scroll-triggered reveals and considered hover micro-interactions in Motion for React. | Motion+ |
| `feature-expand` | An example of a bento grid of feature cards that expand in place into a detail dialog with a shared-element layout animation in Motion for React. | — |

### Botões — `buttons`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `button-add-to-basket` | An example of an add-to-basket button that flies the product into the basket along a curved arc with a spring recoil, in Motion for React. | — |
| `button-hold-to-confirm` | An example of a hold-to-confirm button with press-and-hold progress feedback in Motion for React. | — |

### CTA — `cta-sections`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `cta-banner-magnetic` | An example of a full-bleed conversion banner built around a clamped magnetic pill call-to-action in Motion for React. | — |
| `cta-signup-celebrate` | An example of an animated trial-signup call-to-action with idle, loading and success states and an accent-coloured confetti celebration, in Motion for React. | — |

### FAQ — `faq-sections`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `faq-plus-minus` | An example of a chromeless standalone FAQ section with line-divided rows and a plus-to-minus icon morph in Motion for React. | Base UI |

### Rodapé — `footers`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `footer-newsletter` | An example of an animated site footer with a newsletter subscribe form, quiet link-column hovers and inline state feedback in Motion for React. | — |

### Hero — `hero-sections`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `hero-editorial-stagger` | An example of a type-led hero with a masked line-by-line headline reveal and an orchestrated entrance stagger in Motion for React. | Motion+ |
| `hero-parallax-layers` | An example of a full-bleed marketing hero with a three-layer scroll-linked parallax between a background wash, a live product-analytics window and the headline, in Motion for React. | — |
| `hero-terminal` | An example of a dev-tool hero with a terminal that types a Velocity CLI session and a copyable install command in Motion for React. | Motion+ |
| `text-split-reveal` | An example of a type-led product header whose headline and supporting copy reveal word by word through masked split-text animation, in Motion for React. | Motion+ |

### Listas — `lists`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `list-notifications-stack` | An example of a notifications stack that expands from grouped cards into a full list in Motion for React. | — |

### Loaders — `loaders`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `loader-skeleton` | An example of skeleton shimmer placeholders that morph into loaded content in Motion for React. | Motion+ |

### Navegação — `navigation`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `nav-command-palette` | An example of a Cmd+K command palette with a fuzzy-filtered, keyboard-navigable list and a shared-layout selection highlight in Motion for React. | Base UI |
| `nav-mega-menu` | An example of a site navigation with a single shared mega-menu panel that morphs directionally between sections, in Motion for React. | Base UI |

### Overlays — `overlays`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `overlay-sheet` | An example of a bottom sheet overlay with a springy entrance and drag-to-dismiss in Motion for React. | — |

### Transição de página — `page-transitions`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `page-curtains` | An example of a curated page-transition demo swapping between fade, wipe, doors and iris curtain effects in Motion for React. | Motion+ |
| `page-mask-transitions` | A directional page transition that uses AnimateView and an animated mask image to wipe the incoming view into place without a crossfade. React 19 canary only. | Motion+ |

### Preços — `pricing-sections`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `pricing-border-beam` | An example of a three-tier pricing section that draws attention to the recommended plan with an animated arc of light around its border, in Motion for React. | — |
| `pricing-tiers-morph` | An example of an animated pricing section with a monthly to yearly toggle and prices that morph digit by digit in Motion for React. | Motion+ · Base UI |
| `pricing-usage-slider` | An example of a usage-based pricing calculator with a draggable events slider, live animated prices and tier breakpoints in Motion for React. | Motion+ · Base UI |

### Métricas — `stats-sections`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `stats-counters` | An example of scroll-triggered stat counters with tabular animated figures in Motion for React. | Motion+ |
| `stats-live-panel` | An example of a live engagement dashboard panel with a ticking events-per-minute counter, a trend delta and a path-drawn sparkline in Motion for React. | Motion+ |

### Depoimentos — `testimonials`

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `logo-ticker` | An example of a trusted-by logo ticker with edge fade masks and a gentle slow-on-hover in Motion for React. | Motion+ |
| `testimonials-stack` | An example of a draggable testimonial card stack that re-fans as you flick the top card away in Motion for React. | — |

## Componentes (`registry:component`) — peças para compor

| `add @motion/…` | O que é | Deps |
|---|---|---|
| `accordion` | Springy height-morph accordion panels that fold open with a blur-in on the copy. | Base UI |
| `add-to-basket` | A product image that arcs into the basket icon, with a recoil and ripple on arrival. | — |
| `arrow-link` | A read-more link whose trailing arrow slides forward on hover. | — |
| `border-beam` | A thin arc of light that sweeps the rounded border of any panel. | — |
| `card-stack` | A fanned card stack navigated with carousel controls and a top-left pop between cards. | — |
| `carousel-controls` | Prev and next buttons with animated position dots for any paged carousel. | — |
| `command-palette` | Motion's fuzzy-filtered Cmd+K launcher choreography on Base UI's Dialog primitive, with a sliding selection highlight. | Base UI |
| `confetti` | A brand-coloured celebration burst that fires on any success beat. | — |
| `copy-button` | A copy-to-clipboard button that confirms with a glyph swap and a self-drawing check. | — |
| `coverflow` | A 3D coverflow carousel where items rotate, scale and fade as they leave centre. | Motion+ |
| `expand-card` | An App Store-style expand where a grid tile morphs into a centred detail panel. | — |
| `hold-to-confirm` | A press-and-hold button that wipes a destructive fill across the label as you confirm. | — |
| `magnetic-pull` | An element that gently chases the pointer within a magnetic field, then springs back. | — |
| `mask-wipe` | A directional page transition that wipes the incoming view into place through a soft animated mask. React 19 canary only. | Motion+ |
| `multi-state-button` | A button whose width, glyph and label morph as it moves between states. | — |
| `overlay` | Focus trap, scroll lock and dimming backdrop primitives for modals, sheets and palettes. | — |
| `page-curtain` | A slanted clip-wipe page transition that carries the incoming page name across the screen. | Motion+ |
| `parallax-layers` | Scroll-linked depth layers that move at different speeds as the page scrolls. | — |
| `progress-bar` | A horizontal progress fill that reveals on entrance, with optional benchmark ticks. | — |
| `scramble-reveal` | Text that churns through random glyphs on scroll-in, then settles character by character. | Motion+ |
| `screenshot-scroll-reveal` | A headline that lifts away while a screenshot tilts upright and scales into centre on scroll. | — |
| `scroll-spotlight` | Copy lines that brighten as they cross a reading band, driving a sticky product visual. | — |
| `scroll-zoom-reveal` | A zoomed, tilted screenshot that settles crisp and flat as it scrolls into view. | — |
| `segmented-toggle` | A segmented control whose selection pill slides between options on a snap spring. | Base UI |
| `sheet` | Motion's bottom-sheet choreography on the native HTML dialog element, with a 50px fade-up entrance plus drag and flick dismissal. Keep SheetBackdrop and SheetPanel as direct Sheet children. | — |
| `shrink-header` | A fixed header that condenses from full-height and transparent into a compact solid bar on scroll. | — |
| `skeleton` | A shimmer placeholder that handoffs to real content with a mask wipe or staggered reveal. | Motion+ |
| `smooth-tabs` | Tabs whose active pill slides between labels while panels crossfade with a directional blur. | Base UI |
| `sparkline` | A path-drawn micro-chart that draws in on reveal and updates live as values change. | — |
| `split-reveal` | Masked text that rises line, word or character at a time from below a clip. | Motion+ |
| `stagger-reveal` | An editorial entrance where a headline rises line by line, then followers stagger in behind it. | Motion+ |
| `swipe-actions` | A list row that follows a swipe to reveal actions, and commits on a full flick. | — |
| `terminal-session` | A CLI session that types commands in and fades output lines up as each step completes. | Motion+ |
| `tilt-card` | A card that leans toward the pointer in 3D, on compositor transforms only. | — |
| `toast-stack` | Toasts that fan into a scaled pile at the bottom of the screen and settle on a shared spring. | — |

## Infraestrutura — instalar uma vez, nunca reinstalar por cima

| `add @motion/…` | O que é |
|---|---|
| `motion-theme` | Project-owned motion.theme.ts starter. Install once, then customise without later Motion UI installs replacing it. |
| `ui-theme` | Shared motion tokens (springs, durations, easings, stagger, travel) every Motion UI section consumes. Installed automatically as a dependency of any section. |
| `velocity-preview-theme` | The optional motion.dev-brand preview theme (shadcn variable values + the light/dark switcher shell) every Motion UI section's live demo wraps in. Install it to get the monochrome Velocity look; skip it to use your own shadcn theme instead. |

**`motion-theme` sobrescreve `motion.theme.ts`.** Rodar só quando o arquivo não existe —
depois de customizado, é o único comando capaz de apagar a sua configuração.

## Onde os arquivos caem

Tudo em `components/motion-ui/**` (seções em `components/motion-ui/sections/<name>/`).
Itens compartilham subcomponentes — instalar `stats-counters` também traz
`components/motion-ui/animated-number/`, por exemplo. Isso é esperado: o shadcn CLI
**é dono** desses arquivos e os sobrescreve em cada `add`. Suas edições vão em *wrappers*.

## Fora do catálogo (mas já pronto no `motion-plus/react`)

Antes de escrever qualquer coisa nova, lembre que o pacote premium já entrega
`Ticker`, `Carousel`, `Cursor`, `AnimateNumber`, `AnimateText`, `ScrambleText`,
`Typewriter`, `splitText`, `AnimateView`, `AnimateActivity` e `useCurtains` —
ver `references/premium-components.md`.
