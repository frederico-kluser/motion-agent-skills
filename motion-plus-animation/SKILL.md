---
name: motion-plus-animation
description: >-
  Animar uma interface que JÁ EXISTE com Motion e Motion+, sem trocar o layout, o CSS nem o
  design system do projeto. Use ao adicionar ou ajustar animação, transição, gesto ou efeito
  pronto: entrada/saída, reveal ao rolar, parallax, drag, swipe, hover, layout compartilhado
  (shared element), transição de página/rota, texto letra a letra, contador, ticker/marquee,
  carrossel, cursor custom, spinner/skeleton, desenho e morph de SVG; ao gerar spring ou easing
  CSS `linear()`; ao migrar de `framer-motion`; ao auditar jank e performance de animação
  (MotionScore). Cobre `motion/react`, `motion` (vanilla JS) e `motion-v` (Vue), o pacote premium
  `motion-plus` (Ticker, Carousel, Cursor, AnimateNumber, ScrambleText, Typewriter, splitText,
  useCurtains) e o catálogo de efeitos prontos. NÃO instala componente de UI e NÃO exige
  Tailwind/shadcn — para CONSTRUIR interface a partir de componentes prontos, use `motion-plus-ui`.
  NUNCA importe `framer-motion`; NUNCA instale `motion-plus` do npmjs (tombstone 1.5.1).
license: MIT
metadata:
  version: "1.0.0"
  requires: "Node/npx; MOTION_TOKEN (ou MOTION_API_KEY) para Motion+, MCP e AI Kit. O `motion` base é grátis."
  last-reviewed: "2026-07-26"
---

# Animar o que já existe — Motion + Motion+, sem mexer no seu layout

> Esta skill parte do princípio de que **o layout é seu e continua seu**. Ela não instala seção
> pronta, não troca seu CSS, não pede Tailwind nem shadcn. Ela traz o vocabulário de animação da
> Motion, o pacote premium `motion-plus` e um catálogo de **efeitos já resolvidos** para adaptar ao
> markup que você já tem.

## Qual skill usar

| Situação | Skill |
|---|---|
| "Anima esse botão / essa lista / esse header" | **esta** |
| "Quero um reveal ao rolar / parallax / transição de página" | **esta** |
| "Mantenho meu design system, só quero as ferramentas de animação da Motion" | **esta** |
| Vanilla JS ou Vue | **esta** (Motion UI é React-only) |
| "Cria uma landing com hero, preços e FAQ" | `motion-plus-ui` |
| "Preciso de um acordeão / carrossel / command palette **pronto**" | `motion-plus-ui` |

As duas dividem o mesmo token, o mesmo MCP e o mesmo pacote `motion-plus`. A diferença é o que
entra no seu repo: lá, **source de componente**; aqui, **só animação no seu próprio markup**.

## Setup

O token é um segredo global — **nunca peça ao usuário se já está no ambiente, nunca inline num
comando**. Ordem: `$MOTION_TOKEN` → `$MOTION_API_KEY` → `~/.secrets` / `env` do
`~/.claude/settings.json`. Não achou em lugar nenhum? Salve primeiro:

```bash
node ~/.claude/skills/motion-plus-animation/scripts/ensure-setup.mjs --save-token <token>
source ~/.secrets
```

Depois, idempotente:

```bash
node ~/.claude/skills/motion-plus-animation/scripts/ensure-setup.mjs                  # token + MCP 6.2.0 + /motion + motion
node ~/.claude/skills/motion-plus-animation/scripts/ensure-setup.mjs --check          # só relata
node ~/.claude/skills/motion-plus-animation/scripts/ensure-setup.mjs --with-premium   # + motion-plus
```

O `motion` base é grátis e não precisa de token. `motion-plus` só quando o código usar
Ticker/Carousel/Cursor/AnimateNumber/ScrambleText/Typewriter/splitText/useCurtains — aí entra o
registry privado (detalhes em `references/setup.md`).

## Workflow

**1. Procure o efeito antes de escrever.** Quase tudo que se pede já foi resolvido:

```bash
node ~/.claude/skills/motion-plus-animation/scripts/motion-fx.mjs search "<o que foi pedido>"
node ~/.claude/skills/motion-plus-animation/scripts/motion-fx.mjs show <efeito>
```

86 efeitos indexados (React/JS/Vue) em `references/effects-catalog.md`. Se nada bater, pergunte ao
MCP — ele cobre os **400+** exemplos do Motion+, que não estão no índice público:

```
mcp__motion__search-motion-codex { platform: "react", searchTerm: "…" }
```

**2. Use o componente premium quando existir.** Ticker, Carousel, Cursor, AnimateNumber,
ScrambleText, Typewriter, splitText, useCurtains resolvem acessibilidade, RTL, reduced-motion e
interrupção — coisas que uma versão à mão erra. Ver `references/premium-components.md`.

**3. Adapte, não copie.** Pegue o exemplo e traga para **o seu markup, as suas classes, os seus
nomes**. O que se aproveita é a mecânica (quais valores animam, qual transição, como o gesto é
lido), não o HTML nem o CSS do exemplo.

**4. Escreva a animação.** Regras duras abaixo. Se for CSS puro sem runtime, gere a curva com
`mcp__motion__generate-css-spring` e cole o `linear()`.

**5. Audite.** `/motion audit <dir>` (MotionScore S–F) e conserte o que provoca layout/paint ou
ignora reduced motion.

## Regras duras

1. **Importe de `motion/react`** — nunca `framer-motion`. Se o projeto ainda usa, troque o pacote e
   o caminho do import: Motion v12 é compatível, não há breaking change. Next.js App Router:
   `"use client"` ou `motion/react-client`.
2. **Anime só `transform`, `opacity` e `filter`.** Nunca `top`/`left`/`width`/`height`/`margin`/
   `padding` — isso força layout a cada frame. Para mudança de caixa, use o prop `layout` (Motion
   faz FLIP com correção de escala).
3. **Escolha a transição pelo tipo de valor.** Movimento físico (`x`, `scale`, `rotate`) → **spring**;
   valor visual (`opacity`, `color`) → tween. Prefira o spring por duração
   (`{ type: "spring", visualDuration, bounce }`) a stiffness/damping na mão.
4. **Nomeie as molas uma vez e reuse.** Um módulo de transições no projeto, importado por todo
   mundo — não espalhe curvas ad-hoc por componente.
5. **Nunca leia um MotionValue no render.** `value.get()` no corpo do componente é bug. Derive com
   `useTransform`/`useMotionTemplate` e ligue via `style`. Use a forma de range ou a sem-argumento;
   a forma `useTransform(value, v => …)` está depreciada.
6. **Respeite reduced motion.** `<MotionConfig reducedMotion="user">` cobre `animate`/`whileInView`/
   `exit`; efeito contínuo, autoplay ou ligado a scroll precisa de gate manual com
   `useReducedMotion()`. O estado reduzido mostra **100%** do conteúdo.
7. **Não reinvente o premium.** Ticker, Carousel, Cursor, AnimateNumber, ScrambleText, Typewriter,
   splitText já existem — ver regra 2 do workflow.
8. **Anime o texto real**, nunca um duplicado decorativo. `splitText` aplica o ARIA correto para o
   leitor de tela e o SEO não sofrerem.
9. **Nunca `npm install motion-plus` do npmjs** — tombstone `1.5.1`, e `motion-plus-react` também
   está morto. Só o registry privado `@motionplus` (`--with-premium` faz a fiação).
10. **O token nunca entra no repo nem no chat.** No projeto só o placeholder `${MOTION_TOKEN}`.
11. **Não deixe `will-change` fixo** — mantém uma camada de GPU viva para sempre. Motion gerencia.

## Armadilhas que já custaram tempo

- **`exit` dinâmico precisa do prop `custom`** no `<AnimatePresence>`, alimentando uma variante
  função `(dir) => ({…})` — não um valor lido dentro de `exit`.
- **`AnimatePresence mode="wait"` serializa** entrada e saída; para troca rápida de key, `popLayout`.
- **`overflow-x: hidden` num ancestral quebra `position: sticky`** (base do pinning de scroll) —
  use `overflow-x: clip`.
- **Reveal de texto com máscara corta descendentes e acentos** (g, ç, á) — dê padding na caixa do clip.
- **`<LazyMotion … strict>` é incompatível com `motion-plus`** — os componentes premium precisam do
  runtime completo.
- **`AnimateText` não existe** (404 na doc). Para revelar texto: `splitText` (Motion+) ou os
  exemplos `split-text*` do catálogo.
- **`AnimateView` e `AnimateActivity` já são grátis** — core desde `motion@12.41.0`. Não procure no
  Motion+.
- **Motion escreve estilo inline**, então ele **sobrepõe classe do Tailwind/CSS**. Estilo estático
  vem da sua classe; o que anima vem do prop do Motion. Não tente animar trocando classe.

## Referências

- `references/effects-catalog.md` — **comece aqui**: 86 efeitos prontos por categoria (React/JS/Vue).
- `references/premium-components.md` — `motion-plus`: Ticker, Carousel, Cursor, AnimateNumber,
  ScrambleText, Typewriter, splitText, useCurtains.
- `references/core-api.md` — Motion for React: elementos, props, transições, componentes, hooks.
- `references/springs-performance.md` — springs, `linear()` CSS, MotionValue, reduced motion.
- `references/vanilla-and-vue.md` — as mesmas capacidades fora do React (`motion`, `motion-v`).
- `references/setup.md` — token, MCP, `/motion`, registry privado, gerenciadores de pacote, CI.
- `references/ai-kit-and-mcp.md` — MCP 6.2.0, MotionScore, endpoints, licença.
- `scripts/motion-fx.mjs` — `list` / `search` / `show` / `categories`.
- `scripts/ensure-setup.mjs` — bootstrap idempotente (`--save-token`, `--with-premium`).
- `scripts/refresh-effects.mjs` — regerar o catálogo do `llms.txt` (`--check` detecta drift).

## <evolution>

Skill portátil — não pertence a nenhum projeto. Aprendizado durável novo (armadilha, mudança de API,
efeito novo) vai para `LEARNINGS.md` (`- [YYYY-MM-DD] [source] [task] aprendizado`), promove ao corpo
quando confirmado (≥2 vezes) e sobe `metadata.version`. Catálogo mudou?
`node scripts/refresh-effects.mjs` e revise o `git diff` — nunca commite sozinho. Fatos de API vêm do
MCP, não da memória.
