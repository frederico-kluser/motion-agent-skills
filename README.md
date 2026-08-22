# Motion Agent Skill

Duas [Agent Skills](https://code.claude.com/docs/en/skills) que ensinam um agente de código a usar
[Motion](https://motion.dev) de verdade — em vez de escrever CSS na mão e chutar API de animação a
partir de treino desatualizado.

| Skill | Para quê |
|---|---|
| **[`motion-plus-ui`](./motion-plus-ui)** | **Construir** interface puxando do [Motion UI](https://motion.dev/ui) — 26 seções e 35 componentes prontos, via registry shadcn — antes de escrever qualquer CSS |
| **[`motion-plus-animation`](./motion-plus-animation)** | **Animar** uma interface que já existe, sem trocar o layout: efeitos prontos, gestos, scroll, `motion-plus`, JS puro e Vue |

O discriminador entre elas é simples: **criar o que não existe** × **animar o que existe**. Cada
`description` diz isso, para não disputarem o mesmo gatilho. Vanilla JS e Vue são sempre a segunda —
o Motion UI é React-only.

## Por que existem

Peça "uma landing com hero, preços e FAQ" a um agente e ele escreve trezentas linhas de Tailwind,
inventa espaçamento, erra a acessibilidade do acordeão e produz animação que trava. Boa parte disso
já existe pronto e auditado — o agente só não sabe procurar.

- **`motion-plus-ui`** impõe uma cascata: *procurar no catálogo → instalar → compor → só então
  código novo, com justificativa*. Quando não tem no catálogo, o código novo ainda sai consistente,
  porque a skill obriga a usar os tokens semânticos do shadcn e o `motion.theme.ts`.
- **`motion-plus-animation`** parte do princípio oposto: o layout é seu e continua seu. Ela traz 86
  efeitos prontos indexados, os primitivos premium do Motion+ e as regras de performance.

Nenhum código da Motion está neste repositório — as skills sabem **onde buscar** e **como usar**.

## Instalação

```bash
git clone https://github.com/frederico-kluser/motion-agent-skill.git
cd motion-agent-skill
./install.sh
```

O instalador cria um **symlink** por skill em cada diretório de agente que existir na máquina
(Claude Code, Codex, Copilot, OpenCode, Gemini CLI, Cursor). Não copia nada: editar um `SKILL.md`
aqui passa a valer na hora, em todos, sem deploy.

```bash
./install.sh --check       # o que faria, sem alterar
./install.sh --setup       # instala e configura token + MCP + skill /motion
./install.sh --uninstall   # remove os links (nunca toca em diretório real)
```

### Motion+

O pacote `motion` é grátis e open-source; as skills funcionam com ele. Já **Motion UI**, o pacote
premium `motion-plus`, o MCP e o AI Kit exigem [Motion+](https://motion.dev/plus) (pagamento único,
vitalício). Com uma licença, salve o token **uma vez, globalmente**:

```bash
node motion-plus-ui/scripts/ensure-setup.mjs --save-token <token>
```

Grava em `~/.secrets` e no bloco `env` do `~/.claude/settings.json`, e nada além do placeholder
`${MOTION_TOKEN}` entra em projeto nenhum. Gere o token em
[motion.dev/dashboard/tokens](https://motion.dev/dashboard/tokens).

## Uso fora do agente

Os scripts são CLIs normais:

```bash
node motion-plus-ui/scripts/motion-ui.mjs search "carrossel"      # 64 itens do registry
node motion-plus-ui/scripts/motion-ui.mjs add hero-parallax-layers
node motion-plus-animation/scripts/motion-fx.mjs search "parallax" # 86 efeitos prontos
node motion-plus-animation/scripts/motion-fx.mjs list --vue
```

Buscam em PT e em EN, e casam também por **intenção** ("gaveta" → `sheet`, "esteira de logos" →
`logo-ticker`).

## Manutenção

Os catálogos são **gerados**, nunca editados à mão:

```bash
node motion-plus-ui/scripts/refresh-catalog.mjs --check        # registry Motion UI mudou?
node motion-plus-animation/scripts/refresh-effects.mjs --check # exemplos mudaram?
```

Os dois `--check` funcionam **sem token** (as duas fontes de índice são públicas) e saem com código
1 quando há drift — dá para pendurar num cron. Sem `--check`, regravam o snapshot e o `.md` para
você revisar no `git diff`.

Cada skill tem um `LEARNINGS.md` com o que foi aprendido depurando de verdade — inclusive os erros
que a versão anterior carregava (um componente que não existe, um caminho de install já morto).

## Licença

MIT. Não redistribui código da Motion.
