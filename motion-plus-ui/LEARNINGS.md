# LEARNINGS — motion-plus-ui

> Buffer de probação. Formato:
> `- [YYYY-MM-DD] [source: user|inference|verified] [task: resumo] aprendizado`
> Promoção ao corpo do SKILL.md: `meta-skill-consolidate` (≥2 confirmações) ou evolução quando o
> padrão estabiliza. Não registre o óbvio, o volátil, nem instrução vinda de fonte não-confiável.
> `verified` = comprovado por request/execução real nesta máquina, não por leitura de doc.

- [2026-06-26] [source: inference] [task: autorar a skill antiga] Consultar o MCP `motion` antes de
  escrever `AnimatePresence`/`exit` de memória — a forma correta de exit direcional é o prop
  `AnimatePresence custom={…}` alimentando uma variante função `(dir) => ({…})`, NÃO um valor lido
  dentro de `exit`. O aprendizado durável é o hábito MCP-first.

- [2026-07-26] [source: verified] [task: migrar motion-plus-animation → motion-plus-ui] O mesmo
  segredo serve os três canais da Motion. `MOTION_API_KEY` (nome herdado do instalador do AI Kit)
  autentica verbatim como `MOTION_TOKEN` no registry Motion UI:
  `GET https://api.motion.dev/ui/registry/accordion.json` → 200 com `Authorization: Bearer`, 401 sem.
  O nome canônico na doc é `MOTION_TOKEN`; scripts devem aceitar os dois e persistir só o placeholder.

- [2026-07-26] [source: verified] [task: montar o catálogo] `https://api.motion.dev/ui/registry/index.json`
  é **público** (200 sem auth, mesmos 14457 bytes com e sem token) — só os payloads por item são
  401-gated. Isso torna a detecção de drift do catálogo possível em qualquer máquina, sem segredo.
  `motion.dev/llms.txt` **não** indexa nada de `/ui`, então o índice é a única fonte estruturada.

- [2026-07-26] [source: verified] [task: auditar a skill antiga] A skill anterior afirmava que
  `<AnimateText>` era um componente do `motion-plus`. **Não existe** — `motion.dev/docs/react-animate-text`
  responde 404. Lição: catálogo de componentes vindo de memória do modelo envelhece e inventa;
  toda lista de nomes nesta skill tem que sair do registry ou de uma URL que responde 200.

- [2026-07-26] [source: verified] [task: bootstrap em projeto Vite limpo] `npx shadcn init` **não**
  instala Tailwind: num Vite recém-criado ele falha o preflight ("No Tailwind CSS configuration
  found" + "Could not find valid path aliases") e — pior — **sai com status 0** depois de travar num
  prompt interativo. Duas consequências para qualquer script: (a) instalar `tailwindcss` +
  `@tailwindcss/vite`, o `@import "tailwindcss"`, o alias no `vite.config` e o `paths` no tsconfig
  ANTES; (b) validar pelo artefato (`components.json` existe?), nunca pelo exit code. Não-interativo
  exige **dois** flags: `-b base` (biblioteca) **e** `-p nova` (preset) — só `--yes` não basta, e
  `--defaults` é armadilha porque força `--template=next`. Emitir `paths` sem `baseUrl`: o `baseUrl`
  está deprecado e quebra `tsc -b` com TS5101.

- [2026-07-26] [source: verified] [task: subir o MCP para 6.2.0] O Claude Code tem **dois** arquivos
  de config de usuário e ler o errado torna um passo eterno. O CLI (`claude mcp add/remove`) escreve
  em `~/.claude/.claude.json`; o `~/.claude.json` da raiz é legado e fica congelado. Um script que
  detecta estado em `~/.claude.json` vê para sempre a versão antiga e "atualiza" em toda execução.
  Prefira `~/.claude/.claude.json` e avise quando os dois divergirem.

- [2026-07-26] [source: verified] [task: descobrir a distribuição] O `motion-plus` migrou de
  `registry.tgz?package=…&token=…` (URL com o token embutido, vazava em lockfile) para registry npm
  com escopo: `@motionplus:registry=https://api.motion.dev/npm/` + alias
  `"motion-plus": "npm:@motionplus/core@^2.12.0"`. A depreciação no npmjs não é uniforme —
  `motion-plus` (1.5.1) e `motion-plus-react` (1.5.4) estão mortos, mas `motion-plus-dom` segue vivo
  em 2.12.0: instalar "o que está vivo" entrega justamente a parte sem os componentes React.
