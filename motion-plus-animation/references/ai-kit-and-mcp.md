# O Motion AI Kit, o MCP `motion`, MotionScore e licenciamento

## O AI Kit é ferramenta para o agente — não é biblioteca de componentes

Os componentes premium são o pacote `motion-plus` ([`premium-components.md`](./premium-components.md));
o índice de efeitos prontos é o [`effects-catalog.md`](./effects-catalog.md). O **AI Kit** é outra
coisa: torna *o agente* especialista em Motion, para ele parar de chutar API a partir de treino
desatualizado.

| Peça | O que faz |
|---|---|
| **skill `/motion`** | Boas práticas escritas pelo time da Motion; detecta plataforma (React/JS/Vue) e libs de UI (Radix, Base UI). Instalada em `~/.claude/skills/motion/`. |
| **Contexto MCP** | Docs atuais completos como recursos MCP + **o source de todo exemplo premium** (400+) — a biblioteca inteira, muito além dos ~114 tutoriais públicos do `llms.txt`. |
| **MotionScore** | Análise estática + profiling em runtime, nota **S–F** (metodologia do *Web Animation Performance Tier List*) com correções específicas. Cobre CSS, Motion, GSAP e Anime.js. |
| **Geração de CSS** | Curvas `linear()` (spring e bounce) a partir de molas reais — sem runtime ([`springs-performance.md`](./springs-performance.md)). |
| **Editor de transição** | Extensão oficial da Motion (VS Code Marketplace / Open VSX): edita `duration`/`delay`/easing por AST com preview ao vivo; transições salvas sincronizam no perfil Motion+ e ficam acessíveis ao agente. |

Instalador editor-agnóstico: `npx motion-ai` — Claude Code, Cursor, Windsurf, Amp, OpenCode,
Gemini CLI, Copilot ou pasta custom; pergunta a chave e se é projeto ou global.

## Versão do MCP importa: **≥ 6.2.0**

| Versão | Data | O que mudou |
|---|---|---|
| **6.2.0** | 2026-07-23 | `search-motion-codex` passa a devolver **componentes e seções do Motion UI** (Motion+ / React) como source multi-arquivo pronto para colar |
| 6.1.0 | 2026-05-28 | MotionScore com profiling em runtime no `/motion` |
| 6.0.0 | 2026-05-27 | Unificação de todas as skills numa só `/motion` |

`scripts/ensure-setup.mjs` detecta a versão e faz o upgrade; manualmente:

```bash
claude mcp remove --scope user motion
claude mcp add --scope user motion --env TOKEN='${MOTION_API_KEY}' \
  -- npx -y "https://api.motion.dev/registry.tgz?package=motion-studio-mcp&version=6.2.0"
```

Aspas simples em `'${MOTION_API_KEY}'` para o shell **não** expandir: o Claude Code guarda o
placeholder literal em `~/.claude.json` e expande do próprio env ao subir o servidor. O valor nunca
toca o disco. O servidor lê a env **`TOKEN`** — o mapeamento explícito é obrigatório.

Verificar: `claude mcp get motion` (env mostra `TOKEN: ${MOTION_API_KEY}`) e `claude mcp list`
(→ `motion: … ✔ Connected`). Um `search-motion-codex` com resultado prova que o token expandiu.

## Ferramentas expostas (`mcp__motion__*`)

- **`search-motion-codex`** ({ platform: `js`|`react`|`vue`, searchTerm }) — **use antes de codar**
  qualquer animação/interação. Devolve docs atuais + exemplos canônicos + (≥6.2.0) source do
  o source multi-arquivo do Motion UI. Adapte ao **seu** markup e CSS; se vier importando
  `motion-plus`, mantenha os imports.
- **`generate-css-spring`** ({ bounce, duration }) — `"<dur> linear(…)"`.
- **`generate-css-bounce-easing`** ({ duration }) — bounce gravitacional.
- **`visualise-spring`** / **`visualise-cubic-bezier`** — conferir uma curva antes de aplicar.
- **`devtools-status`** / **`get-devtools-update`** — estado do devtools do MotionScore.

Recursos endereçados como `motion://docs/...` e `motion://examples/...`
(ex.: `motion://docs/react/use-reduced-motion`).

**Não confunda MCPs:** há pacotes "Motion MCP" não-oficiais que falam com o app de
calendário/tarefas do *usemotion.com* — nada a ver com animação. O de animação é `motion-studio-mcp`,
servido de `api.motion.dev/registry`.

## Regra de grounding

Para qualquer padrão não-trivial (acordeão, carrossel, drag, scroll, layout compartilhado, exit,
parallax), **consulte `search-motion-codex` antes** e construa a partir do exemplo devolvido, em vez
de escrever a API de memória — modelos fortes erram detalhes de `AnimatePresence`/`exit`/`useScroll`.

Ordem: **catálogo de efeitos → MCP → memória**. O catálogo local resolve na hora e sem rede; o MCP
cobre os 400+ do Motion+; a memória é o último recurso, e é onde o modelo inventa.

## Endpoints legíveis por máquina

| Endpoint | Auth | Conteúdo |
|---|---|---|
| `https://motion.dev/llms.txt` | **público** | A única fonte estruturada de exemplos: índice dos docs (React/JS/Vue/AI Kit), ~114 tutoriais com URL e descrição, magazine e troubleshooting. É o que `scripts/refresh-effects.mjs` consome. |
| MCP `search-motion-codex` | Bearer | A biblioteca completa (400+) com o source. Não há endpoint REST equivalente: `api.motion.dev/examples/*.json` responde 404. |

Pegadinha operacional: o Cloudflare devolve **403** para User-Agent padrão de script — mande um UA
de browser (é o que `refresh-effects.mjs` faz).

## Licenciamento

- **Motion+** é **pagamento único, acesso vitalício** (não é assinatura), com atualizações
  incluídas. Cobre: biblioteca premium, 400+ exemplos AI-ready, 110+ tutoriais, AI Kit, Motion UI,
  editor visual de transição e Discord privado. A lib `motion` base segue **grátis e open-source**.
- **Preço**: a página `/plus` publica `299 GBP` como `OneTime` no schema.org (leitura de
  2026-07-26). Renderiza via JS e varia por região — trate como referência, confirme no checkout.
- **Business**: por assento/ano, com licença multi-usuário, gestão e transferência de assentos e
  alertas de release no Slack. **Mais de uma pessoa usando exige o tier de time.**
- Tokens: `https://motion.dev/dashboard/tokens`.

## Referências

- [Get started with the Motion AI Kit](https://motion.dev/docs/ai-kit)
- [Install the Motion AI Kit](https://motion.dev/docs/ai-kit-install)
- [Docs & examples for your agent](https://motion.dev/docs/ai-kit-context)
- [MotionScore for Agents](https://motion.dev/docs/motionscore-code-audit)
- [Changelog](https://motion.dev/changelog) — filtro "Motion AI Kit"

**Última atualização:** 2026-07-26
