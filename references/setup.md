# Setup: token, MCP, `/motion` e o pacote premium

> Caminho rápido: `node scripts/ensure-setup.mjs` (idempotente, com `--check`).
> Esta skill **não** roda `shadcn init`, não instala Tailwind e não escreve tema — o layout do
> projeto é do projeto.

## 1. O token: um segredo, dois nomes, sempre global

`MOTION_TOKEN` é o nome **canônico** na documentação da Motion; `MOTION_API_KEY` é o nome herdado
do instalador do AI Kit. **Mesmo valor.**

| Onde | O quê | Serve para |
|---|---|---|
| `~/.secrets` | `export MOTION_API_KEY=…` + `export MOTION_TOKEN="$MOTION_API_KEY"` | todo shell (via `~/.zshenv`) |
| `~/.claude/settings.json` → `env` | `MOTION_API_KEY` e `MOTION_TOKEN` (literais) | toda sessão do Claude Code |

**Resolução, na ordem:** `$MOTION_TOKEN` → `$MOTION_API_KEY` → `~/.secrets` / `settings.json`.
Não achou? Ele ainda não foi salvo — salve **globalmente**, nunca inline:

```bash
node scripts/ensure-setup.mjs --save-token <token>
source ~/.secrets
```

Gerar/rotacionar em `https://motion.dev/dashboard/tokens` (exige Motion+). No `~/.secrets` o
`MOTION_TOKEN` **deriva** do `MOTION_API_KEY`, então rotacionar é mudar um valor só ali (mais o
literal do `settings.json`, que não faz expansão de shell).

Cuidado com a homonímia: existe um `MOTION_API_KEY` do **usemotion.com** (app de calendário), sem
relação com animação.

## 2. O `motion` base — grátis, sem token

```bash
npm install motion     # depois importe de "motion/react" (ou "motion" no JS puro)
```

Se o projeto tem `framer-motion`, troque: Motion v12 é **API-compatível**, muda o pacote e o caminho
do import, nada mais. Next.js App Router precisa de `"use client"` nos arquivos animados, ou do
import por `motion/react-client` para entradas estáticas.

## 3. O MCP `motion` — versão importa

Registre **uma vez em escopo de usuário**, para as ferramentas `mcp__motion__*` aparecerem em todo
projeto:

```bash
claude mcp add --scope user motion --env TOKEN='${MOTION_API_KEY}' \
  -- npx -y "https://api.motion.dev/registry.tgz?package=motion-studio-mcp&version=6.2.0"
```

- Aspas simples em `'${MOTION_API_KEY}'` para o shell **não** expandir: o Claude Code guarda o
  placeholder literal e expande do próprio env ao subir o servidor. O valor nunca toca o disco.
- O servidor lê a env **`TOKEN`** — o mapeamento explícito é obrigatório.
- Verificar: `claude mcp get motion` e `claude mcp list` (→ `motion: … ✔ Connected`).

**Pegadinha:** a CLI escreve em `~/.claude/.claude.json`; o `~/.claude.json` da raiz é **legado** em
instalações antigas e fica congelado. Script que inspeciona estado lendo o arquivo da raiz vê a
versão velha para sempre.

## 4. A skill `/motion` do AI Kit

```bash
npx motion-ai
```

Instalador editor-agnóstico (Claude Code, Cursor, Windsurf, Amp, OpenCode, Gemini CLI, Copilot).
Pergunta a chave e se é projeto ou global. Precisa de token com direito a AI Kit; sem isso, as
ferramentas do MCP ainda cobrem auditoria e geração de springs.

## 5. `motion-plus` (premium) — registry privado

Só quando o código usar Ticker/Carousel/Cursor/AnimateNumber/ScrambleText/Typewriter/splitText/
useCurtains. `node scripts/ensure-setup.mjs --with-premium` faz a fiação; manualmente:

`.npmrc` na **raiz do projeto** (raiz do workspace, em monorepo):

```
@motionplus:registry=https://api.motion.dev/npm/
//api.motion.dev/npm/:_authToken=${MOTION_TOKEN}
```

`package.json` — o alias mantém os imports documentados funcionando:

```json
{ "dependencies": { "motion-plus": "npm:@motionplus/core@^2.12.0" } }
```

Os dois arquivos são seguros de commitar: referenciam a variável, não o valor.

### Por gerenciador de pacote

| PM | O que muda |
|---|---|
| **npm** | Só o `.npmrc`. **Não** lê `.env` — exporte a var ou use `npx dotenv-cli -- npm install`. |
| **pnpm** | **pnpm 11+ recusa expandir `${MOTION_TOKEN}`** num `.npmrc` de projeto ("Ignored project-level auth setting") e manda credencial nenhuma → 401. Antes do install: `pnpm config set "//api.motion.dev/npm/:_authToken" "$MOTION_TOKEN"`. |
| **Bun** | Só o `.npmrc`; o Bun **carrega `.env` sozinho** — `MOTION_TOKEN=…` no `.env` (e `.env` no `.gitignore`) basta. |
| **Yarn 1** | Ignora a linha de scoped registry do `.npmrc`. Adicione um `.yarnrc`: `"@motionplus:registry" "https://api.motion.dev/npm/"` — o token continua vindo do `.npmrc`. |
| **Yarn 2+** | `.yarnrc.yml`: `npmScopes: { motionplus: { npmRegistryServer: "https://api.motion.dev/npm", npmAuthToken: "${MOTION_TOKEN}" } }`. |

### CI e deploy

```yaml
- run: npm ci
  env:
    MOTION_TOKEN: ${{ secrets.MOTION_TOKEN }}
```

Vercel/Netlify/Cloudflare: mesma variável nas configurações de ambiente — o passo de install roda lá.

### O npmjs público é armadilha

**Nunca** `npm install motion-plus` do npmjs. É um tombstone da própria Motion: `latest` congelado em
`1.5.1` (último publish 2025-07-23), deprecation aplicada às 29 versões num sweep em 2025-10-13. E a
depreciação **não é uniforme**:

| Pacote público | Estado |
|---|---|
| `motion-plus` | ☠️ morto em `1.5.1` |
| `motion-plus-react` | ☠️ morto em `1.5.4` — **o catálogo React vive aqui** |
| `motion-plus-dom` | ✅ vivo, `2.12.0` — só primitivos DOM |

Instalar "o que está vivo no npmjs" entrega justamente a parte sem os componentes React.

### Migrar do caminho antigo (`registry.tgz`)

1. troque a dependência pelo alias `npm:@motionplus/core@^2.12.0`;
2. adicione o `.npmrc` (e `.yarnrc`/`.yarnrc.yml` se for Yarn);
3. apague a entrada de `motion-plus` do lockfile (ou reinstale) para re-resolver.

O endpoint antigo continua funcionando. **Se o token já foi commitado alguma vez** (em
`package.json`, lockfile ou URL), trate como comprometido e regenere.

## 6. Troubleshooting

| Sintoma | Causa e conserto |
|---|---|
| `404` do `registry.npmjs.org` para `@motionplus/…` | O `.npmrc` não foi lido: confira que está na raiz do projeto/workspace e que `MOTION_TOKEN` está exportado. |
| npm: `Failed to replace env in config` | `MOTION_TOKEN` vazio. O npm reclama em **todo** comando, mesmo offline — time e CI precisam da variável. |
| pnpm 401 + "Ignored project-level auth setting" | pnpm 11+. Use o `pnpm config set` da tabela. |
| MCP não conecta / `search-motion-codex` vazio | Token não expandiu. `claude mcp get motion` deve mostrar `TOKEN: ${MOTION_API_KEY}`; confira que a env existe na sessão que sobe o servidor. |
| MCP "atualiza" toda execução | Detecção lendo `~/.claude.json` (legado) em vez de `~/.claude/.claude.json`. |
| `/motion` não instala (`isAIKit=false`) | O token não tem direito a AI Kit. As ferramentas do MCP seguem funcionando. |

## Referências

- [Instalar Motion+ para React](https://motion.dev/docs/react-motion-plus-installation)
- [Get started with the Motion AI Kit](https://motion.dev/docs/ai-kit) · [Install](https://motion.dev/docs/ai-kit-install)
- [Motion for React — instalação](https://motion.dev/docs/react-installation)
- [Upgrade guide](https://motion.dev/docs/react-upgrade-guide)

**Última atualização:** 2026-07-26
