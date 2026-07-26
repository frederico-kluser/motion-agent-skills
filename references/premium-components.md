# Motion+ premium (`motion-plus`) — os primitivos que você não deve reescrever

> Pacote `motion-plus`, dependência normal do projeto. Não traz layout, não traz CSS de design
> system: são **primitivos de animação** para colocar dentro do markup que você já tem.
>
> **Não reinvente nada daqui.** Um ticker, carrossel ou contador feito à mão erra em
> acessibilidade, RTL, reduced-motion e interrupção — problemas já resolvidos aqui, e que só
> aparecem em produção.

Instalação: `node scripts/ensure-setup.mjs --with-premium` (detalhes em [`setup.md`](./setup.md)).

## Componentes React (`motion-plus/react`)

| Componente | O que faz | Notas |
|---|---|---|
| **`<Ticker>`** | Marquee/ticker infinito com controle real de velocidade e algoritmo de clone mínimo | ~+2.1kb; horizontal/vertical, RTL, reduced motion, foco |
| **`<Carousel>`** | Carrossel infinito e acessível: drag/wheel/teclado, paginação custom, overflow até a viewport | ~+5.5kb |
| **`<Cursor>`** | Cursor custom com **magnetismo** e **zonas**; assume a forma do alvo via layout animation | desktop; barre em touch e reduced motion |
| **`<AnimateNumber>`** | Números "tickando", locale-aware via `Intl.NumberFormat` (moeda, notação compacta) | ~+2.5kb; figuras tabulares |
| **`<ScrambleText>`** | Embaralhamento estilo terminal, via motion values (sem re-render do React) | ~1kb; usa `stagger`; use com parcimônia |
| **`<Typewriter>`** | Digitação com cadência humana, cursor estilizável, acessível | via motion values, sem re-render |

## Hooks

- **`useCurtains`** (`motion-plus/curtains`) — cobre a view com um efeito, troca o conteúdo enquanto
  está escondido e revela depois do commit do React. Chegou no Motion+ **2.12.0** (2026-06-09).
- Versões headless (`useCarousel`, `useTicker`, `usePointerPosition`, …) expõem a MotionValue de
  `offset`/posição para dirigir UI própria. **Confirme a assinatura no MCP**
  (`mcp__motion__search-motion-codex`, platform `react`) — essa superfície muda mais rápido que a
  dos componentes.

## `splitText()` — JS/DOM

Quebra o texto em chars/words/lines aplicando o ARIA correto, e devolve `{ chars, words, lines }`
como arrays de elementos. ~+0.7kb. É utilitário **DOM** (não é componente React), e funciona em
qualquer framework:

```ts
import { splitText } from "motion-plus"
import { animate, stagger } from "motion"

const { chars } = splitText("h1")
animate(chars, { opacity: [0, 1], y: [10, 0] }, { duration: 1, delay: stagger(0.05) })
```

Os retornos são elementos comuns — dá para animar com CSS ou outra lib, ou pendurar gesto em cada
pedaço. Exemplos no catálogo: `split-text`, `split-text-scatter`, `split-text-wavy`.

Equivalente JS puro do scramble: **`scrambleText`** (também Motion+).

## Já é grátis (não procure no Motion+)

Migraram para a biblioteca core:

- **`<AnimateView>`** / `animateView()` — transições de view/rota. Saiu do Early Access do Motion+
  para a lib principal no **`motion@12.41.0`** (2026-06-23).
- **`<AnimateActivity>`** — enter/exit/layout dentro de `<Activity>` do React.
- `animateLayout()`, `AnimatePresence`, `LayoutGroup`, `MotionConfig`, `Reorder`, `LazyMotion`.

## Não existe

**`AnimateText`** não é componente da Motion — `motion.dev/docs/react-animate-text` responde 404.
Para revelar texto: `splitText` (Motion+) ou os exemplos `split-text*` do catálogo.

## Imports

```ts
import { Ticker, Carousel, Cursor, AnimateNumber, ScrambleText, Typewriter } from "motion-plus/react"
import { useCurtains } from "motion-plus/curtains"
import { splitText, scrambleText } from "motion-plus"        // DOM / vanilla
// core, sem Motion+:
import { AnimateView, AnimateActivity, AnimatePresence } from "motion/react"
```

Com o alias do `package.json` (`"motion-plus": "npm:@motionplus/core@^2.12.0"`) esses caminhos
funcionam como documentado. Sem o alias, importe de `@motionplus/core/react`.

## Regras duras

- **Nunca** instalar `motion-plus` do npmjs — tombstone `1.5.1`; `motion-plus-react` também está
  morto (`1.5.4`), enquanto `motion-plus-dom` segue vivo em `2.12.0`. A assimetria engana: o
  catálogo React está justamente no pacote morto. Registry privado, sempre.
- **`<LazyMotion … strict>` quebra estes componentes** — precisam do runtime completo do Motion.
- Acessibilidade vem de fábrica, mas não é automática para tudo: continue barrando efeito magnético
  e contínuo com `useReducedMotion()` e checagem de ponteiro/touch.
- Estilo estático continua vindo do **seu** CSS: estes componentes aceitam `className`/`style` e não
  impõem design system nenhum.

## Referências

- [Ticker](https://motion.dev/docs/react-ticker) · [Carousel](https://motion.dev/docs/react-carousel) · [Cursor](https://motion.dev/docs/cursor)
- [AnimateNumber](https://motion.dev/docs/react-animate-number) · [ScrambleText](https://motion.dev/docs/react-scramble-text) · [Typewriter](https://motion.dev/docs/react-typewriter)
- [splitText](https://motion.dev/docs/split-text) · [useCurtains](https://motion.dev/docs/react-use-curtains)
- [AnimateView](https://motion.dev/docs/react-animate-view) (core) · [AnimateActivity](https://motion.dev/docs/react-animate-activity) (core)

**Última atualização:** 2026-07-26
