# motion-plus-ui

Agent Skill que faz um agente de código **construir interface puxando do [Motion UI](https://motion.dev/ui)
primeiro** — em vez de escrever CSS, posicionar elementos na mão e reinventar componentes que já
existem prontos e animados.

Sucessora da skill `motion-plus-animation`, que só cobria animação e foi escrita antes do Motion UI
existir (lançado em 2026-07-23).

## O problema

Peça "uma landing com hero, preços e FAQ" para um agente e ele escreve trezentas linhas de
Tailwind/CSS, inventa espaçamento, erra acessibilidade de acordeão e produz animação que trava. Tudo
isso já existe, pronto e auditado, num registry que a Motion publica.

## O que a skill faz

Impõe uma **cascata obrigatória** antes de qualquer JSX de interface:

1. **procurar** no catálogo (26 seções + 35 componentes) e no MCP;
2. **instalar** com `npx shadcn@latest add @motion/<name>`;
3. **compor** a partir dos componentes quando não há seção pronta;
4. **só então** escrever código novo — usando os tokens semânticos do shadcn para o visual e o
   `motion.theme.ts` para o movimento, para o resultado ser indistinguível do resto;
5. **justificar** em uma linha por que o passo 4 foi necessário.

## Instalação

O repositório **é** a skill. Aponte um symlink de cada agente para cá — editar aqui reflete em todos,
sem deploy:

```bash
for d in ~/.claude/skills ~/.claude-secundaria/skills ~/.agents/skills ~/.codex/skills ~/.copilot/skills; do
  [ -d "$d" ] && ln -sfn "$PWD" "$d/motion-plus-ui"
done
```

Depois, uma vez por máquina/projeto:

```bash
node scripts/ensure-setup.mjs           # configura o que falta (idempotente)
node scripts/ensure-setup.mjs --check   # só relata
```

**Requer Motion+**: exporte o token (`MOTION_TOKEN`, ou `MOTION_API_KEY` como nesta máquina) obtido
em [motion.dev/dashboard/tokens](https://motion.dev/dashboard/tokens).

## Uso direto (fora do agente)

```bash
node scripts/motion-ui.mjs search "carrossel"      # PT ou EN, casa nome/descrição/intenção
node scripts/motion-ui.mjs show stats-counters     # deps, arquivos, comando
node scripts/motion-ui.mjs add hero-parallax-layers
node scripts/refresh-catalog.mjs --check           # catálogo mudou? (índice é público)
```

## Estrutura

| Caminho | O que é |
|---|---|
| `SKILL.md` | A cascata, as regras duras, as armadilhas |
| `references/catalog.md` | Os 64 itens do registry + busca por intenção (**gerado**) |
| `references/theme-and-lookfeel.md` | Como escrever código novo que pareça Motion UI |
| `references/motion-ui-setup.md` | Registry `@motion`, npm `@motionplus`, PMs, CI, troubleshooting |
| `references/premium-components.md` | O pacote `motion-plus` |
| `references/core-api.md` · `springs-performance.md` | Motion for React |
| `references/ai-kit-and-mcp.md` | MCP ≥ 6.2.0, MotionScore, endpoints, licença |
| `assets/motion-ui-index.json` | Snapshot do registry (lookup offline) |
| `scripts/` | `ensure-setup` · `motion-ui` · `refresh-catalog` · `intents` |

`references/catalog.md` e `assets/motion-ui-index.json` são **gerados** por
`scripts/refresh-catalog.mjs` — não edite à mão. A tabela de intenções (PT/EN) fica em
`scripts/intents.mjs`, que é onde se acrescenta um termo que não achou nada.

## Licença

MIT. O código dos componentes Motion UI **não** está aqui: é baixado do registry da Motion com o
token de quem tem Motion+.
