# motion-plus-animation

Agent Skill que ensina um agente de código a **animar uma interface que já existe** com Motion e
Motion+ — sem trocar o layout, o CSS ou o design system do projeto.

Irmã da [`motion-plus-ui`](../motion-plus-ui), que resolve o problema oposto: **construir** a
interface a partir do catálogo pronto do Motion UI.

## Qual das duas

| Você quer… | Skill |
|---|---|
| animar o que já está na tela | **esta** |
| manter seu design system e só usar as ferramentas de animação | **esta** |
| Vanilla JS ou Vue | **esta** (Motion UI é React-only) |
| montar seções/telas a partir de componentes prontos | `motion-plus-ui` |

As duas dividem o mesmo token, o mesmo MCP e o mesmo pacote `motion-plus`. A diferença é o que entra
no repo: lá, **source de componente**; aqui, **só animação no seu próprio markup**.

## O que a skill faz

- **Catálogo de efeitos prontos** (86 efeitos, 114 exemplos em React/JS/Vue) para achar antes de
  escrever — gerado do `llms.txt` público. Quando não bate, manda perguntar ao MCP, que cobre os
  400+ exemplos do Motion+.
- **Regras duras** de performance (só `transform`/`opacity`/`filter`), transição por tipo de valor,
  MotionValue e reduced motion.
- **Os primitivos premium** (`Ticker`, `Carousel`, `Cursor`, `AnimateNumber`, `ScrambleText`,
  `Typewriter`, `splitText`, `useCurtains`) com a fiação do registry privado.
- **Fora do React**: `motion` (JS puro, incluindo Webflow/WordPress/Squarespace) e `motion-v` (Vue,
  com a diretiva `v-motion`).

## Instalação

Pelo instalador na raiz do repositório, que liga esta skill (e a irmã) em todos os agentes:

```bash
../install.sh            # ou ./install.sh a partir da raiz
../install.sh --setup    # + token, MCP e a skill /motion
```

Depois, por projeto:

```bash
node scripts/ensure-setup.mjs --save-token <token>   # só se ainda não estiver no ambiente
node scripts/ensure-setup.mjs                        # token + MCP 6.2.0 + /motion + motion
node scripts/ensure-setup.mjs --with-premium         # + motion-plus (registry privado)
```

O pacote `motion` é grátis e não precisa de token. Motion+ (premium, MCP e AI Kit) precisa —
gere em [motion.dev/dashboard/tokens](https://motion.dev/dashboard/tokens).

## Uso direto (fora do agente)

```bash
node scripts/motion-fx.mjs search "revelar ao rolar"
node scripts/motion-fx.mjs show parallax
node scripts/motion-fx.mjs list --vue
node scripts/refresh-effects.mjs --check     # o catálogo mudou?
```

## Estrutura

| Caminho | O que é |
|---|---|
| `SKILL.md` | Workflow, regras duras, armadilhas, fronteira com a `motion-plus-ui` |
| `references/effects-catalog.md` | 86 efeitos por categoria e plataforma (**gerado**) |
| `references/premium-components.md` | O pacote `motion-plus` |
| `references/core-api.md` | Motion for React |
| `references/vanilla-and-vue.md` | `motion` (JS) e `motion-v` (Vue) |
| `references/springs-performance.md` | Springs, `linear()`, MotionValue, reduced motion |
| `references/setup.md` | Token, MCP, registry privado, PMs, CI, troubleshooting |
| `references/ai-kit-and-mcp.md` | MCP ≥ 6.2.0, MotionScore, licença |
| `assets/motion-effects-index.json` | Snapshot do índice (lookup offline) |

`effects-catalog.md` e `motion-effects-index.json` são **gerados** por `scripts/refresh-effects.mjs`
— não edite à mão. A tabela de intenções (PT/EN) vive em `scripts/motion-fx.mjs`, que é onde se
acrescenta um termo que não achou nada.

## Licença

MIT. O código dos exemplos e do pacote premium **não** está aqui: vem da Motion, com o token de quem
tem Motion+.
