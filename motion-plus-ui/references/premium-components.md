# Motion+ premium (`motion-plus`) — o que já existe fora do catálogo Motion UI

> Duas camadas diferentes, fácil de confundir:
> **Motion UI** = source instalado via `shadcn add @motion/<name>` (vira arquivo no seu repo).
> **Motion+** = o **pacote** `motion-plus`, dependência normal, com os primitivos premium.
> 20 dos 64 itens do Motion UI dependem dele — por isso o `.npmrc` do escopo `@motionplus` é
> obrigatório (ver [`motion-ui-setup.md`](./motion-ui-setup.md)).
>
> **Não reinvente nada daqui.** Um ticker/carrossel/contador feito à mão erra em acessibilidade,
> RTL, reduced-motion e interrupção — problemas já resolvidos.

## Componentes React (`motion-plus/react`) — Motion+

| Componente | O que faz | Notas |
|---|---|---|
| **`<Ticker>`** | Marquee/ticker infinito com controle real de velocidade e algoritmo de clone mínimo | ~+2.1kb; horizontal/vertical, RTL, reduced motion, focus |
| **`<Carousel>`** | Carrossel infinito e acessível: drag/wheel/teclado, paginação custom, overflow até a viewport | ~+5.5kb |
| **`<Cursor>`** | Cursor custom com **magnetismo** e **zonas**; assume a forma do alvo via layout animation | |
| **`<AnimateNumber>`** | Números "tickando", locale-aware via `Intl.NumberFormat` (moeda, notação compacta) | ~+2.5kb; usa figuras tabulares |
| **`<ScrambleText>`** | Embaralhamento estilo terminal (via motion values, sem re-render do React) | ~1kb; usa `stagger`; use com parcimônia |
| **`<Typewriter>`** | Digitação com cadência humana, cursor estilizável, acessível | via motion values, sem re-render |

Hook premium documentado: **`useCurtains`** — cobre a view com um efeito, troca o conteúdo enquanto
está escondido e revela depois do commit do React (`motion-plus/curtains`). Chegou no Motion+ 2.12.0
(2026-06-09).

Outros hooks headless (`useCarousel`, `useTicker`, `usePointerPosition`, …) expõem a MotionValue de
`offset`/posição para dirigir UI própria. **Confirme a assinatura exata no MCP**
(`mcp__motion__search-motion-codex`, platform `react`) antes de usar — essa superfície muda mais
rápido que a dos componentes.

## `splitText()` — JS/DOM, Motion+

Quebra o texto em chars/words/lines, aplicando o ARIA correto, e devolve `{ chars, words, lines }`
como arrays de elementos. ~+0.7kb. É utilitário **DOM**, não componente React:

```ts
import { splitText } from "motion-plus"
import { animate, stagger } from "motion"

const { chars } = splitText("h1")
animate(chars, { opacity: [0, 1], y: [10, 0] }, { duration: 1, delay: stagger(0.05) })
```

Em React, prefira a seção pronta `@motion/text-split-reveal` ou o componente `@motion/split-reveal`
— fazem o mesmo com o tema já aplicado.

## Já é grátis (não pague nem procure no Motion+)

Migraram para a biblioteca core e **não** precisam de `motion-plus`:

- **`<AnimateView>`** / `animateView()` — transições de view/rota. Saiu do Early Access do Motion+
  para a lib principal no **`motion@12.41.0`** (2026-06-23).
- **`<AnimateActivity>`** — enter/exit/layout dentro de `<Activity>` do React.
- `animateLayout()`, `AnimatePresence`, `LayoutGroup`, `MotionConfig`, `Reorder`, `LazyMotion`.

## Não existe

**`AnimateText`** não é um componente da Motion — `motion.dev/docs/react-animate-text` responde 404.
(Constava por engano na versão anterior desta skill.) Para revelar texto em React use
`@motion/split-reveal` / `@motion/stagger-reveal` do catálogo, ou `splitText` no DOM.

## Imports

```ts
import { Ticker, Carousel, Cursor, AnimateNumber, ScrambleText, Typewriter } from "motion-plus/react"
import { useCurtains } from "motion-plus/curtains"
import { splitText } from "motion-plus"        // DOM
// core, sem Motion+:
import { AnimateView, AnimateActivity, AnimatePresence } from "motion/react"
```

Com o alias do `package.json` (`"motion-plus": "npm:@motionplus/core@^2.12.0"`) esses caminhos
funcionam como documentado. Sem o alias, importe de `@motionplus/core/react`.

## Regras duras

- **Nunca** instalar `motion-plus` do npmjs — tombstone `1.5.1`; e `motion-plus-react` também está
  morto (`1.5.4`), enquanto `motion-plus-dom` segue vivo em `2.12.0`. A assimetria engana: o
  catálogo React está justamente no pacote morto. Registry privado, sempre.
- **`<LazyMotion … strict>` quebra estes componentes** — precisam do runtime completo do Motion.
- Acessibilidade vem de fábrica, mas não é automática para tudo: continue barrando efeito magnético
  e contínuo com `useReducedMotion()` e checagem de ponteiro/touch.
- Num projeto Motion UI, passe o transition pelos tokens (`useMotionUITransition("ui")`) em vez de
  molas locais — ver [`theme-and-lookfeel.md`](./theme-and-lookfeel.md).

## Referências

- [Ticker](https://motion.dev/docs/react-ticker) · [Carousel](https://motion.dev/docs/react-carousel) · [Cursor](https://motion.dev/docs/cursor)
- [AnimateNumber](https://motion.dev/docs/react-animate-number) · [ScrambleText](https://motion.dev/docs/react-scramble-text) · [Typewriter](https://motion.dev/docs/react-typewriter)
- [splitText](https://motion.dev/docs/split-text) · [useCurtains](https://motion.dev/docs/react-use-curtains)
- [AnimateView](https://motion.dev/docs/react-animate-view) (core) · [AnimateActivity](https://motion.dev/docs/react-animate-activity) (core)

**Última atualização:** 2026-07-26
