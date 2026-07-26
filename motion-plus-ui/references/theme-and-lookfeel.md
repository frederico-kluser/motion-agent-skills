# Look & feel: os dois vocabulários que você é obrigado a reusar

> Este é o arquivo do **passo 4 da cascata**. Quando o catálogo não cobre o caso e você
> precisa escrever componente novo, ele só "parece Motion UI" se falar estes dois vocabulários:
> **cor/tipografia = tokens semânticos do shadcn** · **movimento = tokens do `motion.theme.ts`**.
> Qualquer literal (hex, `px` de mola, `cubic-bezier` solto) é o que quebra a consistência.

## A regra de ouro, na própria fonte

O header do `velocity-preview-theme.css` da Motion diz, sobre o source dos componentes:

> *"A section's own component source must never read a hex literal or a bespoke token name from
> here — it reads ONLY the shadcn vocabulary (`bg-background`, `text-foreground`, `bg-primary`,
> `border-border`, `rounded-lg`, `font-sans`, …)"*

E define o teste de pronto:

> *"Swap this import for nothing (stock Tailwind defaults) or for shadcn-zinc-reference.css and
> every section must still read acceptably."*

**Seu componente novo tem que passar nesse mesmo teste.** Se ele fica feio ao trocar o tema, ele
está lendo algo que não devia.

O componente é *theme-dumb*; o tema é *theme-smart*.

---

## 1. Vocabulário visual — tokens semânticos shadcn

Não existe CSS empacotado para importar, nem plugin/preset Tailwind da Motion. O visual inteiro sai
destas classes. Use **só** elas:

| Papel | Classes |
|---|---|
| Superfície da página | `bg-background` · `text-foreground` |
| Cartão / painel | `bg-card` · `text-card-foreground` |
| Popover / menu | `bg-popover` · `text-popover-foreground` |
| Silenciado (poço, legenda) | `bg-muted` · `text-muted-foreground` |
| Marca / ação primária | `bg-primary` · `text-primary` · `text-primary-foreground` |
| Secundário | `bg-secondary` · `text-secondary-foreground` |
| Hover / selecionado | `bg-accent` · `text-accent-foreground` · `hover:bg-accent` |
| Bordas e campos | `border-border` · `border-input` · `divide-border` |
| Foco | `ring-ring` · `focus-visible:ring-ring` · `outline-ring` · `ring-offset-background` |
| Erro | `bg-destructive` · `text-destructive` · `text-destructive-foreground` · `aria-invalid:border-destructive` |
| Gráficos | `bg-chart-1` … `bg-chart-5` |
| Sidebar | `bg-sidebar` · `text-sidebar-foreground` · `border-sidebar-border` |
| Raio | `rounded-sm|md|lg|xl` (derivados de `--radius`) |
| Tipo | `font-sans` · `font-mono` · `font-medium` · `font-semibold` |
| Sombra | `shadow-sm` · `shadow-md` |
| Estado | `data-[state=open]:bg-accent` · `placeholder:text-muted-foreground` |

**Nunca**: `bg-[#0d1111]`, `text-zinc-400`, `border-gray-200`, `rounded-[12px]`. Um literal desses e
o componente para de responder ao tema do projeto.

### Tiques tipográficos que dão a cara do Motion UI

Aparecem em quase todo o catálogo — são de graça e fazem diferença:

- `text-balance` em títulos, `text-pretty` em parágrafos (viúvas/órfãs).
- `tabular-nums` em qualquer número que muda (contadores, preços, deltas) — senão a largura pula.
- `font-mono` para valores "de máquina": timestamps, deltas, contagens, terminal.
- `antialiased` no root do bloco.
- `sr-only` para o texto que só o leitor de tela precisa (aparece 35× no catálogo — acessibilidade
  não é opcional aqui).
- `shrink-0` em ícones dentro de flex; `overflow-hidden` no container que faz morph de altura.

### O tema "Velocity" (a cara literal do motion.dev/ui) — opcional

`@motion/velocity-preview-theme` é o tema de **preview** que envolve todas as demos do site. Instale
**só** se quer a identidade monocromática do motion.dev; pule se o projeto tem tema shadcn próprio
(esse é o caminho pretendido — o kit é white-label).

O que ele define, para referência ao construir algo "no mesmo espírito":

- **Monocromático por decisão de produto.** "Ink on paper": fundo claro/tinta escura no light,
  invertido no dark. **Não existe cor de marca** — o `--primary` é tinta (`#e8eeee` no dark,
  `#1c1a18` no light). Cor de marca é assunto do tema do comprador.
- Baseline dark: `--background: #0d1111`, `--foreground: #ededec` (contraste 16.22:1),
  `--muted-foreground: #8b9391` (6.04:1 no background), `--destructive: #ff6467`,
  `--success: #4ade80`.
- Superfícies elevadas derivam das **mesmas duas âncoras**, para todos os cinzas terem a mesma
  temperatura: `--card` = `color-mix(in srgb, var(--foreground) 4%, var(--background))`,
  `--muted` 7%, `--accent` 6%, `--border` 13%.
- **`--radius: 0rem`** — "sharp corners are the Velocity brand — the whole kit ships square".
  Um projeto que instala uma seção mantém o **próprio** `--radius`; a rampa `rounded-*` deriva do
  que cascatear.
- Tipo: **TASA Orbiter** (`--font-sans`, a tipografia do motion.dev) + **Geist Mono**
  (`--font-mono`), via `@font-face` direto (não `@import` do Google Fonts — quebraria o PostCSS por
  vir depois do Tailwind).
- `--velocity-demo-min-h*` só existe dentro do preview: numa instalação real não resolve e a seção
  cai para altura natural. **Não replique essas vars.**

---

## 2. Vocabulário de movimento — `motion.theme.ts`

Arquivo **do projeto**, na raiz. `defineTheme` faz merge parcial sobre os defaults, então edite só o
que quer mudar:

```ts
import { defineTheme } from "@/components/motion-ui/ui-theme"

export default defineTheme({
  transitions: {
    snap:    { stiffness: 1218, damping: 70 },
    ui:      { stiffness: 305,  damping: 33 },
    gentle:  { stiffness: 110,  damping: 20 },
    lively:  { stiffness: 622,  damping: 17 },
    ambient: { stiffness: 43,   damping: 13 },
  },
  stagger: { tight: 0.04, base: 0.08, relaxed: 0.15 },  // segundos entre filhos
  travel:  { hover: 4, enter: 24, section: 48 },        // pixels de deslocamento
  inView:  { amount: 0.4, once: true },                 // quanto precisa aparecer p/ disparar
  reducedMotion: "calm",                                 // "calm" | "off"
})
```

### As cinco transições, por propósito (não por número)

| Token | Para quê |
|---|---|
| **`snap`** | Feedback imediato: toggle, aba, hover, chevron girando. |
| **`ui`** | O padrão. Menus, cards, reveals, a maioria das coisas. |
| **`gentle`** | Superfícies grandes: seções, sheets, curtains. |
| **`lively`** | Comemorativo: confetti, badge de sucesso, contador. |
| **`ambient`** | Fundo contínuo: pulso, varredura, brilho. O `duration` é o **ciclo** — costuma vir com `repeat: Infinity`. |

Escolha pelo **papel na interface**, nunca pelo "número que parece bom".

Cada token carrega **dois canais** de propósito: a física (`stiffness`/`damping`) move transform e
layout; `duration` + `ease` acompanham os fades (opacity/cor) para os dois pousarem juntos.

### Consumir no código novo

```tsx
"use client"
import { motion } from "motion/react"
import { useMotionUITransition, useMotionUITheme } from "@/components/motion-ui/ui-theme"

export function Callout({ children }) {
  const transition = useMotionUITransition("ui")     // ← o token, nunca números soltos
  const { travel, inView, stagger } = useMotionUITheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: travel.enter }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={transition}
      className="rounded-lg border border-border bg-card p-6 text-card-foreground"
    >
      {children}
    </motion.div>
  )
}
```

Ajustar um único aspecto sem perder o token: espalhe e sobrescreva —
`transition={{ ...transition, delay: stagger.base }}`.

### API completa de `@/components/motion-ui/ui-theme`

| Export | Para quê |
|---|---|
| `defineTheme(partial)` | Monta o tema do projeto (merge sobre `defaultTheme`). |
| `MotionUIThemeProvider` | Monta **uma vez** na raiz; sem ele tudo cai nos defaults. |
| `useMotionUITransition(name)` | O transition resolvido, pronto pro prop `transition`. |
| `useMotionUITheme()` | O tema inteiro: `transitions`, `stagger`, `travel`, `inView`, `reducedMotion`. |
| `transitionToLinear(token)` | Converte o token em `linear()` para CSS puro. |
| `themeToCssVars(theme)` / `cssVarsToStyleString(vars)` | Emite `--motion-ui-transition-*` para usar em CSS. |
| `resolveReducedMotion(...)` | A estratégia efetiva ("calm"/"off") já cruzada com a preferência do SO. |
| `defaultTheme` | Os defaults, para comparar/derivar. |

### Reduced motion

`reducedMotion: "calm"` remove o **travel** e mantém os fades — o conteúdo continua aparecendo.
`"off"` desliga a animação. Isso cobre o que o Motion UI controla; efeitos contínuos ou ligados a
scroll que **você** escrever ainda precisam do gate manual `useReducedMotion()` — ver
[`springs-performance.md`](./springs-performance.md).

---

## 3. Comportamento: primitivo headless por baixo

O catálogo não reinventa acessibilidade: `@base-ui/react` para Dialog e Accordion, `<dialog>` nativo
para o Sheet. Faça igual — **primitivo headless cuida de foco/teclado/ARIA, Motion cuida da
coreografia**. Escrever um dropdown do zero é regredir em duas frentes.

## 4. Tailwind: divisão de trabalho

Não existe plugin nem preset da Motion. A regra oficial:

- **classe Tailwind** = estilo estático e responsivo, via `className`;
- **prop do Motion** (`animate`, `layout`, `whileHover`, `whileTap`) = animação.

Por quê: *"Motion animates by applying inline styles, or via native browser animations — both of
which override Tailwind CSS classes"*. Tentar animar por troca de classe briga com o runtime.

O único ponto sancionado de config é um `@theme` com easings CSS geradas
(`--ease-spring-snappy: linear(0, 0.2375, …)`) para animação **sem** runtime — gere com
`mcp__motion__generate-css-spring` ou `transitionToLinear`.

## Referências

- [Introducing Motion UI](https://motion.dev/magazine/introducing-motion-ui) — 2026-07-23
- [Guia de instalação](https://motion.dev/ui/install) — seção "Update your motion theme"
- [Motion + Tailwind CSS](https://motion.dev/docs/react-tailwind)
- [Base UI & Motion](https://motion.dev/docs/base-ui)
- [shadcn — theming](https://ui.shadcn.com/docs/theming)

**Última atualização:** 2026-07-26
