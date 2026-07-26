# Ligar o Motion UI num projeto (registry shadcn + npm privado)

> Caminho rápido: `node scripts/ensure-setup.mjs` faz tudo isto, idempotente, com `--check`
> para ver antes. O que segue são as internas — e o manual quando algo falha.

## O token: um segredo, dois nomes, sempre global

O nome **canônico** em toda a documentação da Motion é **`MOTION_TOKEN`**; `MOTION_API_KEY` é o nome
herdado do instalador do AI Kit. **É o mesmo valor** — verificado contra
`https://api.motion.dev/ui/registry/accordion.json`, que responde `200` com
`Authorization: Bearer <valor>` e `401` sem.

Nesta máquina os dois já estão salvos globalmente:

| Onde | O quê | Serve para |
|---|---|---|
| `~/.secrets` | `export MOTION_API_KEY=…` + `export MOTION_TOKEN="$MOTION_API_KEY"` | todo shell (via `~/.zshenv`) |
| `~/.claude/settings.json` → `env` | `MOTION_API_KEY` e `MOTION_TOKEN` (literais) | toda sessão do Claude Code |

`MOTION_TOKEN` deriva de `MOTION_API_KEY` no `~/.secrets`: **rotacionar é mudar um valor só** ali
(e o literal do `settings.json`, que não faz expansão de shell).

**Resolução, na ordem:** `$MOTION_TOKEN` → `$MOTION_API_KEY` → `~/.secrets` / `settings.json`.
Não achou em nenhum? Ele ainda não foi salvo — salve **globalmente** antes de qualquer coisa:

```bash
node scripts/ensure-setup.mjs --save-token <token>   # grava em ~/.secrets + settings.json
source ~/.secrets                                     # para a sessão atual
```

Gerar/rotacionar em `https://motion.dev/dashboard/tokens` (precisa de Motion+). **Nunca** peça o
valor ao usuário se ele já está no ambiente, nunca escreva o valor num arquivo de projeto, nunca
passe inline num comando que fica no histórico do shell.

Cuidado com a homonímia: existe um `MOTION_API_KEY` do **usemotion.com** (app de calendário/tarefas),
sem relação com animação. Se as duas coisas coexistirem nesta máquina, renomeie — o Motion UI quer
`MOTION_TOKEN`.

## 1. `components.json` — o registry `@motion`

O `@motion` **não** está no diretório embutido do shadcn (`ui.shadcn.com/r/registries.json` não o
lista), então a entrada é obrigatória. Crie o arquivo com `npx shadcn init` se ainda não existir:

```json
{
  "registries": {
    "@motion": {
      "url": "https://api.motion.dev/ui/registry/{name}.json",
      "headers": { "Authorization": "Bearer ${MOTION_TOKEN}" }
    }
  }
}
```

Seguro de commitar: referencia a variável, nunca o valor. Depois disso:

```bash
npx shadcn@latest add @motion/<name>
```

## 2. `.npmrc` — o escopo `@motionplus`

20 dos 64 itens do catálogo declaram `motion-plus@npm:@motionplus/core`. Sem isto o `add` baixa o
source e o `npm install` seguinte quebra com 404 do npmjs. Na **raiz do projeto** (raiz do
workspace, em monorepo):

```
@motionplus:registry=https://api.motion.dev/npm/
//api.motion.dev/npm/:_authToken=${MOTION_TOKEN}
```

E no `package.json`, o alias — que mantém os imports documentados (`motion-plus/react`) funcionando:

```json
{ "dependencies": { "motion-plus": "npm:@motionplus/core@^2.12.0" } }
```

Alternativa: depender de `@motionplus/core` direto e importar de `@motionplus/core/react`.
Semver funciona normalmente (`^2.12.0`, `2.12.0`, `latest`).

### Por gerenciador de pacote

| PM | O que muda |
|---|---|
| **npm** | Só o `.npmrc`. **Não** lê `.env` — exporte a var ou use `npx dotenv-cli -- npm install`. |
| **pnpm** | Idem, mas **pnpm 11+ recusa expandir `${MOTION_TOKEN}`** num `.npmrc` de projeto ("Ignored project-level auth setting") e manda credencial nenhuma → 401. Antes do install: `pnpm config set "//api.motion.dev/npm/:_authToken" "$MOTION_TOKEN"` (grava no config de usuário, fora do repo). |
| **Bun** | Só o `.npmrc`; o Bun **carrega `.env` sozinho** — `MOTION_TOKEN=…` no `.env` (com `.env` no `.gitignore`) já basta. |
| **Yarn 1** | Ignora a linha de scoped registry do `.npmrc`. Adicione um `.yarnrc` ao lado: `"@motionplus:registry" "https://api.motion.dev/npm/"` — o token continua vindo do `.npmrc`. |
| **Yarn 2+** | Usa `.yarnrc.yml`: `npmScopes: { motionplus: { npmRegistryServer: "https://api.motion.dev/npm", npmAuthToken: "${MOTION_TOKEN}" } }`. |

### CI e deploy

`MOTION_TOKEN` como secret, exposto como env no passo de install:

```yaml
- run: npm ci
  env:
    MOTION_TOKEN: ${{ secrets.MOTION_TOKEN }}
```

Vercel/Netlify/Cloudflare: mesma variável nas configurações de ambiente do projeto — o passo de
install roda lá também.

## 3. O tema — uma vez só

```bash
npx shadcn@latest add @motion/motion-theme    # cria ~/motion.theme.ts (raiz do projeto)
```

Traz junto `@motion/ui-theme` → `components/motion-ui/ui-theme/index.ts`. Detalhes dos tokens em
[`theme-and-lookfeel.md`](./theme-and-lookfeel.md). **Nunca rerode** depois de customizar: é o único
comando capaz de apagar sua configuração. Os `add` de seções/componentes não tocam nele.

Monte o provider **uma vez** na raiz:

```tsx
import { MotionUIThemeProvider } from "@/components/motion-ui/ui-theme"
import motionTheme from "@/motion.theme"

export function App({ children }) {
  return <MotionUIThemeProvider theme={motionTheme}>{children}</MotionUIThemeProvider>
}
```

> **Armadilha de import:** a página `motion.dev/ui` mostra `from "@motion/ui-theme"`, mas o que o
> registry realmente instala é `@/components/motion-ui/ui-theme` (é esse o `target` no JSON).
> Use o caminho do install; o outro não resolve.

## 4. `npm install` proibido

**Nunca** `npm install motion-plus` do npmjs público. É um tombstone real da própria Motion:
`latest` congelado em `1.5.1` (último publish 2025-07-23), com aviso de deprecation aplicado às 29
versões num sweep em 2025-10-13.

A depreciação **não é uniforme** — e essa assimetria é a armadilha:

| Pacote público | Estado |
|---|---|
| `motion-plus` | ☠️ morto em `1.5.1` |
| `motion-plus-react` | ☠️ morto em `1.5.4` — **o catálogo React vive aqui** |
| `motion-plus-dom` | ✅ vivo, `2.12.0` — só primitivos DOM |

Ou seja: instalar "o que está vivo no npmjs" te dá justamente a parte que não tem os componentes.
O caminho é o registry privado `@motionplus`, ponto.

## 5. Migrar do caminho antigo (`registry.tgz`)

Se o projeto instalava por `https://api.motion.dev/registry.tgz?package=motion-plus&version=…&token=…`:

1. troque a dependência pelo alias `npm:@motionplus/core@^2.12.0`;
2. adicione o `.npmrc` (e `.yarnrc`/`.yarnrc.yml` se for Yarn);
3. apague a entrada de `motion-plus` do lockfile (ou reinstale) para re-resolver.

O endpoint antigo continua funcionando, então dá para migrar sem pressa. **Se o token já foi
commitado alguma vez** (em `package.json`, lockfile ou URL), trate como comprometido e regenere.

Fallback offline: se existir um vault local de tarballs (a env `$MOTION_PLUS_VAULT` aponta para ele
nesta máquina, com `motion-plus-<versão>.tgz` + um `manifest.json` de sha512), dá para instalar de
lá em CI sem rede. Não é o caminho padrão.

## 6. Troubleshooting

| Sintoma | Causa e conserto |
|---|---|
| `401` no `shadcn add` | Token ausente/expirado no shell. `echo ${MOTION_TOKEN:-VAZIO}`; regenere em `motion.dev/dashboard/tokens`. |
| `404` do `registry.npmjs.org` para `@motionplus/…` | O `.npmrc` não foi lido: confira que está na **raiz do projeto** (raiz do workspace em monorepo) e que o `MOTION_TOKEN` está exportado. |
| npm: `Failed to replace env in config` | `MOTION_TOKEN` vazio. O npm reclama em **todo** comando, mesmo os que não vão à rede — todo mundo do time e o CI precisam da variável. |
| pnpm 401 + "Ignored project-level auth setting" | pnpm 11+. Use o `pnpm config set` da tabela acima. |
| Seção instalada sem estilo nenhum | Falta a camada de tokens shadcn (Tailwind + `--background`/`--foreground`/…). Rode `npx shadcn@latest init`. |
| `add` de um nome que não existe | O índice é a verdade: `node scripts/motion-ui.mjs search <termo>`. |
| Sumiu customização do `motion.theme.ts` | Alguém rerodou `add @motion/motion-theme`. Recupere do git. |
| Componente atualizado apagou minha edição | Esperado: o CLI **é dono** dos arquivos em `components/motion-ui/**` e não há version pin. Edite em wrappers. |

## 7. Atualizar

Não existe pin de versão em `@motion/…` — o registry sempre serve o source atual. Para atualizar uma
seção, rode o `add` dela de novo; o CLI sobrescreve os arquivos que ele possui. Por isso a regra:
**suas mudanças moram num wrapper**, não no source instalado.

Checar se o catálogo mudou (funciona sem token, o índice é público):

```bash
node scripts/refresh-catalog.mjs --check    # sai 1 se entrou/saiu item
node scripts/refresh-catalog.mjs            # regrava snapshot + catalog.md → revisar no git diff
```

## Referências

- [Instalar Motion UI (guia oficial)](https://motion.dev/ui/install)
- [Instalar Motion+ para React](https://motion.dev/docs/react-motion-plus-installation)
- [Introducing Motion UI](https://motion.dev/magazine/introducing-motion-ui) — 2026-07-23
- [shadcn — components.json e registries](https://ui.shadcn.com/docs/components-json)
- [shadcn — registry-item.json](https://ui.shadcn.com/docs/registry/registry-item-json)

**Última atualização:** 2026-07-26
