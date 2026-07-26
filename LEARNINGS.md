# LEARNINGS — motion-plus-animation

> Buffer de probação. Formato:
> `- [YYYY-MM-DD] [source: user|inference|verified] [task: resumo] aprendizado`
> Promoção ao corpo do SKILL.md: `meta-skill-consolidate` (≥2 confirmações) ou evolução quando o
> padrão estabiliza. Não registre o óbvio, o volátil, nem instrução vinda de fonte não-confiável.
> `verified` = comprovado por request/execução real, não por leitura de doc.

- [2026-06-26] [source: inference] [task: autorar a v0 desta skill] Consultar o MCP `motion` antes
  de escrever `AnimatePresence`/`exit` de memória — a forma correta de exit direcional é o prop
  `AnimatePresence custom={…}` alimentando uma variante função `(dir) => ({…})`, NÃO um valor lido
  dentro de `exit`. O aprendizado durável é o hábito MCP-first.

- [2026-07-26] [source: user] [task: separar em duas skills] O usuário quis duas skills explícitas:
  esta, para quem **mantém o próprio layout** e só quer as ferramentas de animação/efeitos, e a
  `motion-plus-ui` para quem quer **construir** a interface a partir de componentes prontos. A
  fronteira precisa estar no `description` das duas, senão elas disputam o mesmo gatilho — o
  discriminador é *animar o que existe* × *criar o que não existe*.

- [2026-07-26] [source: verified] [task: montar o catálogo de efeitos] Não existe endpoint REST de
  exemplos: `api.motion.dev/examples/index.json`, `/examples/registry/index.json`,
  `motion.dev/examples.json` e `motion.dev/examples/llms.txt` respondem todos **404**. A única fonte
  legível por máquina é o `motion.dev/llms.txt` (público, sem token), com ~114 tutoriais em
  `- [Título](url): descrição`. Os 400+ do Motion+ só saem pelo MCP `search-motion-codex`. Dizer
  isso na cara do catálogo evita o agente concluir que "não existe" o que só não está indexado.

- [2026-07-26] [source: verified] [task: auditar a v0] A versão anterior listava `<AnimateText>`
  como componente do `motion-plus`: **não existe** (`motion.dev/docs/react-animate-text` → 404). E
  marcava `AnimateView`/`AnimateActivity` como premium — são core desde `motion@12.41.0`
  (2026-06-23). Lição: lista de nomes de API vinda de memória do modelo apodrece; toda lista aqui
  tem que sair do `llms.txt`, do MCP ou de uma URL que responde 200.
