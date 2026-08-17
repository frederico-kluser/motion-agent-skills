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

- [2026-08-17] [source: verified] [task: animar deck reveal.js] `animate(el, { y: 0 })` do
  `animate` imperativo **não roda** quando o `y` atual do elemento veio de um `transform` inline:
  o Motion lê o valor de partida do computed style e de um `matrix(…)` não consegue extrair `y`,
  então assume 0, a animação vira 0 → 0 e nada acontece — sem erro, sem warning, sem WAAPI
  (`el.getAnimations().length === 0`). É por isso que o exemplo oficial `split-text` usa
  `{ opacity: [0, 1], y: [10, 0] }`: a forma `[de, até]` não depende de ler o DOM. Regra:
  **no `animate` imperativo sobre transform, sempre declare os dois extremos.**
  Corolário do mesmo caso: `animate(..., { duration: 0 })` não escreve nada — para pôr o elemento
  no estado de partida, escreva `el.style.transform` na mão.

- [2026-08-17] [source: verified] [task: animar deck reveal.js] Correção parcial do aprendizado de
  2026-07-26: `AnimateText` **existe** e é exportado por `motion-plus/react@2.12.0` (visto no
  `dist/react-entry.d.ts`), mas continua fora da documentação e o MCP não o conhece. Na prática é
  inutilizável quando o disparo vem de fora: ele renderiza um `motion.create(React.Fragment)` e
  as variants das letras não recebem o label propagado por um `motion.span` pai — as letras ficam
  com `transform: none`. Além disso `AnimateTextProps` não declara `transition`/`initial`/`animate`
  embora o `...props` os repasse, então TypeScript reclama. Use `splitText`.
