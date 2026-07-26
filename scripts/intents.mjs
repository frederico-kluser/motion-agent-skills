/**
 * intents.mjs — curated "o que a pessoa pede" → "o que existe no catálogo".
 *
 * This is the only hand-maintained knowledge in the catalog pipeline: the registry
 * gives names and English descriptions, this gives the words a person actually types
 * (PT and EN) so step 1 of the cascade resolves without a round-trip.
 *
 * Consumed by `refresh-catalog.mjs` (renders the table into references/catalog.md)
 * and by `motion-ui.mjs search`. Add a row whenever a lookup misses.
 */
export const INTENTS = [
  ['hero / capa / topo da landing', 'hero-editorial-stagger · hero-parallax-layers · hero-terminal · text-split-reveal'],
  ['preços / planos / pricing', 'pricing-tiers-morph · pricing-usage-slider · pricing-border-beam'],
  ['FAQ / perguntas / acordeão / accordion', 'faq-plus-minus (seção) · accordion (componente)'],
  ['depoimentos / testimonials / avaliações', 'testimonials-stack · card-stack'],
  ['logos de clientes / marquee / ticker / esteira', 'logo-ticker'],
  ['números / métricas / KPI / contador animado / counter', 'stats-counters · stats-live-panel'],
  ['bento / grid de features / funcionalidades', 'bento-staggered · feature-expand'],
  ['menu / navegação / navbar / mega menu / header', 'nav-mega-menu · nav-command-palette · shrink-header'],
  ['⌘K / cmd+k / busca / command palette / launcher', 'command-palette (componente) · nav-command-palette (seção)'],
  ['CTA / banner de conversão / chamada', 'cta-banner-magnetic · cta-signup-celebrate'],
  ['rodapé / footer / newsletter', 'footer-newsletter'],
  ['modal / dialog / drawer / gaveta / sheet / bottom sheet', 'sheet · overlay · overlay-sheet'],
  ['toast / snackbar / notificações / alerts', 'toast-stack · list-notifications-stack'],
  ['loading / skeleton / shimmer / progresso / progress', 'skeleton · loader-skeleton · progress-bar'],
  ['carrossel / carousel / slider de imagens / galeria', 'coverflow · carousel-controls'],
  ['abas / tabs / segmented control / toggle', 'smooth-tabs · segmented-toggle'],
  ['transição de página / rota / route transition', 'page-curtains · page-mask-transitions · page-curtain · mask-wipe'],
  ['revelar ao rolar / scroll reveal / aparecer / entrada', 'stagger-reveal · split-reveal · scroll-zoom-reveal · screenshot-scroll-reveal · scroll-spotlight'],
  ['parallax / profundidade / camadas', 'parallax-layers · hero-parallax-layers'],
  ['header que encolhe ao rolar / sticky header', 'shrink-header'],
  ['botão de compra / add to cart / carrinho / basket', 'add-to-basket · button-add-to-basket'],
  ['botão com estados / loading / sucesso / erro', 'multi-state-button'],
  ['segurar para confirmar / hold to confirm / destrutivo', 'hold-to-confirm · button-hold-to-confirm'],
  ['botão de copiar / copy / clipboard', 'copy-button'],
  ['link com seta / read more / saiba mais', 'arrow-link'],
  ['borda animada / glow / beam / destaque no card', 'border-beam · pricing-border-beam'],
  ['card que expande / detalhe / shared element', 'expand-card'],
  ['card com tilt 3D / inclinar / hover 3d', 'tilt-card'],
  ['swipe / arrastar para revelar ações / iOS', 'swipe-actions'],
  ['confete / confetti / celebração / sucesso', 'confetti · cta-signup-celebrate'],
  ['cursor magnético / imã / atrair', 'magnetic-pull · cta-banner-magnetic'],
  ['gráfico pequeno / sparkline / mini chart', 'sparkline'],
  ['texto embaralhado / scramble / glitch', 'scramble-reveal'],
  ['texto que sobe / split text / máscara', 'split-reveal · text-split-reveal · stagger-reveal'],
  ['terminal / CLI / bloco de código animado', 'terminal-session · hero-terminal'],
  ['tema / cores / fontes do motion.dev / look and feel', 'velocity-preview-theme (opcional) + motion-theme'],
];
