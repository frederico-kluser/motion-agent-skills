---
name: motion-plus-ui
description: >-
  Construir QUALQUER interface web em React puxando primeiro do Motion UI (motion.dev/ui) — o
  registry shadcn com 26 seções e 35 componentes prontos, animados e auditados — em vez de escrever
  CSS, posicionar elementos ou inventar componente. Use ao criar ou alterar tela, página, landing,
  seção, layout, componente de UI, formulário, navegação, modal, tabela, card, botão ou estado
  vazio/carregando; ao montar projeto novo; ao animar (Motion / motion-plus / framer-motion); ao
  gerar spring ou easing CSS; ao auditar performance de animação. Cobre a cascata obrigatória
  (catálogo → instalar → compor → só então código novo), o catálogo completo, o registry `@motion`
  + npm privado `@motionplus`, os tokens de look & feel (motion.theme.ts + tokens semânticos
  shadcn), o pacote premium `motion-plus` e o Motion AI Kit (MCP ≥ 6.2.0). NUNCA importe
  `framer-motion`; NUNCA instale `motion-plus` do npmjs (tombstone 1.5.1); NUNCA escreva CSS de
  layout antes de consultar o catálogo.
license: MIT
metadata:
  version: "1.0.0"
  requires: "Node/npx; MOTION_TOKEN (ou MOTION_API_KEY) no ambiente; Motion+ para registry, premium e AI Kit."
  last-reviewed: "2026-07-26"
---

# Motion UI primeiro, CSS por último

> **Motion UI** (lançado 2026-07-23) é um **registry shadcn token-gated** com 26 seções de página e
> 35 componentes React, animados pelo time da Motion e auditados com MotionScore. Não é pacote npm,
> não é galeria de copiar-colar. Instalar é `npx shadcn@latest add @motion/<name>` e o source vai
> pro seu repo. Está incluso no Motion+.
>
> A razão desta skill existir: sem ela o agente escreve CSS, posiciona `div` na mão e reinventa
> acordeão. **Com ela, escrever componente do zero é o último recurso, não o primeiro reflexo.**

## Quando usar

Qualquer tarefa de **interface** em React — criar página/seção/componente, mexer em layout,
espaçamento, estados, navegação, feedback — e qualquer tarefa de **animação** em web.

**Não serve para:** projeto que não é React (Motion UI é React-only; Vue/vanilla ficam com
`motion`/`motion-plus` — ver `references/premium-components.md`), backend, ou o app de
calendário do *usemotion.com* (produto sem relação; ignore qualquer "Motion MCP" que fale de agenda).

## Setup — rode primeiro (idempotente)

```bash
node ~/.claude/skills/motion-plus-ui/scripts/ensure-setup.mjs           # configura o que falta
node ~/.claude/skills/motion-plus-ui/scripts/ensure-setup.mjs --check   # só relata, não muda nada
```

Garante, em ordem: token no ambiente · MCP `motion` em escopo de usuário **pinado em 6.2.0** (é a
versão que traz Motion UI no `search-motion-codex`; 6.1.0 não conhece) · skill `/motion` do AI Kit ·
e, no projeto: `motion`, Tailwind+shadcn (`shadcn init` quando falta — sem a camada de tokens as
seções renderizam sem estilo), `components.json` com o registry `@motion`, `.npmrc` do escopo
`@motionplus`, `motion.theme.ts` e o aviso se o provider não estiver montado.

Detalhes e troubleshooting: `references/motion-ui-setup.md`.

## A cascata — obrigatória, nesta ordem

Antes de escrever **qualquer** JSX de interface:

**1. Procurar.** Sempre, mesmo achando que sabe fazer:

```bash
node ~/.claude/skills/motion-plus-ui/scripts/motion-ui.mjs search "<o que o usuário pediu>"
node ~/.claude/skills/motion-plus-ui/scripts/motion-ui.mjs show <name>
```

Em paralelo, `mcp__motion__search-motion-codex` (platform `react`) — no MCP ≥ 6.2.0 ele devolve o
source do Motion UI completo. Índice humano: `references/catalog.md`.

**2. Instalar.** Achou? `npx shadcn@latest add @motion/<name>` (ou `motion-ui.mjs add <name>`, que
valida o nome antes). **Não reimplemente o que o registry entrega.**

**3. Compor.** Não existe a seção pronta? Monte a partir dos 35 componentes + primitivos Base UI.
Quase toda tela nasce de combinação — `overlay` + `sheet`, `card-stack` + `carousel-controls`,
`stagger-reveal` + conteúdo próprio.

**4. Só então, código novo.** Obrigatoriamente:
   - visual por **classes semânticas shadcn** (`bg-background`, `text-muted-foreground`,
     `border-border`, `rounded-lg`, `font-sans`) — nunca hex, nunca `text-zinc-*`, nunca `px` cravado;
   - movimento por **token do tema**: `useMotionUITransition("snap"|"ui"|"gentle"|"lively"|"ambient")`
     — nunca `stiffness`/`damping` escritos na mão;
   - comportamento por **primitivo headless** (Base UI / `<dialog>` nativo), não do zero.

   A régua completa está em `references/theme-and-lookfeel.md`.

**5. Justificar.** Ao usar o passo 4, escreva **uma linha** na resposta dizendo o que faltou no
catálogo e por quê. Sem essa linha, o passo 4 não aconteceu — volte ao passo 1.

## Regras duras

1. **Não escreva à mão o que o catálogo tem.** Acordeão, carrossel/coverflow, command palette ⌘K,
   sheet/drawer, overlay/modal, toast, skeleton, tabs, ticker/marquee, contador animado, confetti,
   tilt card, swipe actions, progress bar, sparkline, mega menu, transição de página, hero, pricing,
   FAQ, footer, bento, testimonials — **tudo isso já existe**. Conferir custa um comando.
2. **CSS de layout é sinal de erro.** Se está escrevendo `position`, `grid-template`, `flex` na mão
   para montar uma seção inteira, parou na etapa errada da cascata. (Os `styles.css` que as próprias
   seções trazem são delas — não conte como seu.)
3. **Nunca importe `framer-motion`** — só `motion/react`. Em Next.js App Router, `"use client"` ou
   `motion/react-client`.
4. **Nunca `npm install motion-plus` do npmjs** — tombstone `1.5.1`. E `motion-plus-react` também
   está morto: só o registry privado `@motionplus` serve. Alias:
   `"motion-plus": "npm:@motionplus/core@^2.12.0"`.
5. **Nunca rerode `add @motion/motion-theme`** depois de customizar — é o único comando que
   sobrescreve o `motion.theme.ts`.
6. **Edite em wrapper, nunca no source instalado.** Não há version pin: o CLI é dono dos arquivos em
   `components/motion-ui/**` e sobrescreve a cada `add`.
7. **O token nunca entra no repo.** Só os placeholders `${MOTION_TOKEN}` / `${MOTION_API_KEY}`.
   `components.json` e `.npmrc` são seguros de commitar justamente por isso.
8. **Anime só `transform`, `opacity`, `filter`.** Nada de `top`/`left`/`width`/`height`/`margin` —
   para mudança de caixa, use o prop `layout`.
9. **Monte `<MotionUIThemeProvider>` uma vez** na raiz, senão tudo cai nos defaults.
10. **`<LazyMotion strict>` é incompatível** com os componentes premium.
11. **Respeite reduced motion.** `reducedMotion: "calm"` no tema cobre as seções; efeito contínuo ou
    ligado a scroll que você escrever ainda precisa de `useReducedMotion()`. O estado reduzido mostra
    100% do conteúdo.

## Armadilhas que já custaram tempo

- **Import do tema**: a página `motion.dev/ui` mostra `from "@motion/ui-theme"`, mas o que instala é
  `@/components/motion-ui/ui-theme`. Use o caminho do install.
- **pnpm 11+** recusa expandir `${MOTION_TOKEN}` num `.npmrc` de projeto → 401. Use
  `pnpm config set "//api.motion.dev/npm/:_authToken" "$MOTION_TOKEN"`.
- **npm com `MOTION_TOKEN` vazio** falha com `Failed to replace env in config` em *todo* comando,
  mesmo offline. Todo mundo do time e o CI precisam da variável.
- **404 do npmjs para `@motionplus/…`** = o `.npmrc` não está na raiz do projeto (ou do workspace).
- **`AnimateText` não existe** (404 na doc). Para revelar texto: `@motion/split-reveal`,
  `@motion/stagger-reveal` ou `splitText` no DOM.
- **`AnimateView`/`AnimateActivity` já são grátis** (core desde `motion@12.41.0`) — não procure no
  Motion+.
- **`exit` dinâmico precisa do prop `custom`** no `<AnimatePresence>`, alimentando uma variante
  função `(dir) => ({…})` — não um valor lido dentro de `exit`.
- **`overflow-x: hidden` num ancestral quebra `position: sticky`** (que o pinning de scroll usa) —
  use `overflow-x: clip`.
- **`mask-wipe` é React 19 canary only.**

## Referências

- `references/catalog.md` — **comece aqui**: os 64 itens, busca por intenção, comando de instalação.
- `references/theme-and-lookfeel.md` — a régua do passo 4: tokens shadcn + `motion.theme.ts`.
- `references/motion-ui-setup.md` — registry `@motion`, `.npmrc` `@motionplus`, PMs, CI, 401/404.
- `references/premium-components.md` — `motion-plus`: Ticker, Carousel, Cursor, AnimateNumber,
  ScrambleText, Typewriter, splitText, useCurtains.
- `references/core-api.md` — Motion for React: elementos, props, transições, hooks.
- `references/springs-performance.md` — springs, `linear()` CSS, MotionValue, reduced motion.
- `references/ai-kit-and-mcp.md` — MCP 6.2.0, MotionScore, endpoints legíveis por máquina, licença.
- `scripts/motion-ui.mjs` — `list` / `search` / `show` / `add`.
- `scripts/ensure-setup.mjs` — bootstrap idempotente.
- `scripts/refresh-catalog.mjs` — reler o registry e regerar o catálogo (`--check` detecta drift).

## <evolution>

Skill portátil — não pertence a nenhum projeto. Quando algo durável generalizar (armadilha nova,
mudança de API, item novo no catálogo), acrescente em `LEARNINGS.md`
(`- [YYYY-MM-DD] [source] [task] aprendizado`), promova ao corpo quando confirmado (≥2 vezes) e suba
`metadata.version`. Catálogo mudou? `node scripts/refresh-catalog.mjs` e revise o `git diff` — nunca
commite sozinho. Fatos de API vêm do MCP e do registry, não da memória.
