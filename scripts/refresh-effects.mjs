#!/usr/bin/env node
/**
 * refresh-effects.mjs — regenerates the ready-made effects catalog from motion.dev/llms.txt.
 *
 *   assets/motion-effects-index.json   snapshot (plataforma, categoria, url, descrição)
 *   references/effects-catalog.md      o índice que o agente lê antes de escrever animação
 *
 * llms.txt é **público** (sem token) e é o único índice legível por máquina dos exemplos:
 * não existe `api.motion.dev/examples/*.json` (todos 404). Ele lista os ~114 tutoriais
 * públicos; a biblioteca completa do Motion+ (400+) só sai pelo MCP `search-motion-codex`.
 *
 * Uso:
 *   node scripts/refresh-effects.mjs           # rebaixa e regrava os dois arquivos
 *   node scripts/refresh-effects.mjs --check   # relata drift, não escreve (sai 1 se mudou)
 *
 * Saída é para revisar em `git diff` — nunca commite sozinho.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LLMS = 'https://motion.dev/llms.txt';
const SNAPSHOT = join(ROOT, 'assets', 'motion-effects-index.json');
const CATALOG = join(ROOT, 'references', 'effects-catalog.md');
const CHECK = process.argv.includes('--check');

/**
 * Categoria por palavra-chave, na ordem — a primeira que casar ganha, então o que é mais
 * específico vem antes. Casa contra "slug + título + descrição".
 */
const CATEGORIES = [
  ['Entrada e saída (mount/unmount)', /enter-animation|exit-animation|animate-presence|infinite-loading|notifications-(stack|list)/],
  // \bscroll, senão "overscroll" (do iOS slider) rouba o exemplo da categoria de gestos.
  ['Scroll', /\bscroll|parallax|sticky|pinning|velocity-linked/],
  ['Texto', /split-text|typewriter|text-reveal|fill-text|scramble|characters-remaining|html-content/],
  ['Layout compartilhado / morph', /layout|app-store|app-folder|lightbox|expand|shared/],
  ['View transitions / página', /view|page-wipe|curtain/],
  ['Gestos e drag', /drag|gesture|hover|press|tap|swipe|hold-to-confirm|reorder|todo-list|slider|image-reveal/],
  ['Cursor e ponteiro', /cursor|pointer|magnetic|follow/],
  ['Carrossel, ticker e cards', /carousel|ticker|coverflow|card-stack|tilt/],
  ['Loading e progresso', /loading|spinner|progress|ripple|skeleton|multi-state-badge/],
  ['SVG e path', /svg|path|draw|morph/],
  ['3D e transformações', /cube|three|rotate|planes|bobble/],
  ['Cor e gradiente', /color|gradient|spotlight|highlight|apple-intelligence/],
  ['Sobreposições (modal, tabs, acordeão)', /modal|dialog|accordion|tabs|tab-select|command-palette/],
  ['Springs e easing', /spring|bounce|easing|stagger|keyframe|transition|variants|options/],
];

const PLATFORM = { react: 'React', js: 'JS', vue: 'Vue' };

const res = await fetch(LLMS, { headers: { 'User-Agent': 'Mozilla/5.0 (motion-plus-animation skill)' } });
if (!res.ok) { console.error(`✗ ${LLMS} → ${res.status}`); process.exit(1); }
const txt = await res.text();

const items = [...txt.matchAll(/^- \[([^\]]+)\]\(https:\/\/motion\.dev\/examples\/([a-z0-9-]+)\):\s*(.*)$/gm)]
  .map(([, title, slug, description]) => {
    const platform = slug.split('-')[0];
    const base = slug.replace(/^(react|js|vue)-/, '');
    const hay = `${slug} ${title} ${description}`.toLowerCase();
    return {
      slug, base, title, description,
      platform: PLATFORM[platform] ?? platform,
      url: `https://motion.dev/examples/${slug}`,
      category: CATEGORIES.find(([, re]) => re.test(hay))?.[0] ?? 'Outros',
      // O llms.txt marca o premium na própria descrição ("Motion+ Carousel", "from Motion+").
      premium: /motion\+/i.test(description),
    };
  });

if (!items.length) { console.error('✗ nenhum exemplo casou — o formato do llms.txt mudou.'); process.exit(1); }

// Uma "effect family" agrupa as variantes por plataforma do mesmo efeito.
const families = new Map();
for (const i of items) {
  const f = families.get(i.base) ?? families.set(i.base, { base: i.base, title: i.title, description: i.description, category: i.category, premium: false, platforms: {} }).get(i.base);
  f.platforms[i.platform] = i.url;
  f.premium ||= i.premium;
  if (i.platform === 'React') { f.title = i.title; f.description = i.description; }
}

const snapshot = {
  source: LLMS,
  fetchedAt: new Date().toISOString().slice(0, 10),
  note: 'Índice público (~114 exemplos). A biblioteca completa do Motion+ (400+) só pelo MCP search-motion-codex.',
  counts: { examples: items.length, families: families.size, premium: items.filter((i) => i.premium).length },
  items,
};

if (CHECK) {
  const prev = existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, 'utf8')) : { items: [] };
  const b = new Set(prev.items.map((i) => i.slug)), a = new Set(items.map((i) => i.slug));
  const added = [...a].filter((n) => !b.has(n)), removed = [...b].filter((n) => !a.has(n));
  console.log(`live:     ${items.length} exemplos (${families.size} efeitos)`);
  console.log(`snapshot: ${prev.items.length} exemplos (${prev.fetchedAt ?? 'n/d'})`);
  if (added.length) console.log(`+ novos:   ${added.join(', ')}`);
  if (removed.length) console.log(`- sumiram: ${removed.join(', ')}`);
  if (!added.length && !removed.length) console.log('✓ sem drift');
  process.exit(added.length || removed.length ? 1 : 0);
}

writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2) + '\n');
writeFileSync(CATALOG, render(snapshot, families));
console.log(`✓ assets/motion-effects-index.json  (${items.length} exemplos, ${families.size} efeitos)`);
console.log('✓ references/effects-catalog.md');

function render(snap, fams) {
  const byCat = new Map();
  for (const f of fams.values()) (byCat.get(f.category) ?? byCat.set(f.category, []).get(f.category)).push(f);
  const order = [...CATEGORIES.map(([c]) => c), 'Outros'].filter((c) => byCat.has(c));

  const L = [];
  L.push('# Catálogo de efeitos prontos');
  L.push('');
  L.push(`> **Gerado** por \`scripts/refresh-effects.mjs\` a partir de \`${snap.source}\` (público, sem token).`);
  L.push(`> Não editar à mão. Atualizado em **${snap.fetchedAt}** — ${snap.counts.examples} exemplos`);
  L.push(`> agrupados em ${snap.counts.families} efeitos, nas plataformas React / JS / Vue.`);
  L.push('>');
  L.push('> **Este índice é o público.** A biblioteca do Motion+ tem 400+ exemplos e o único acesso');
  L.push('> programático é o MCP: `mcp__motion__search-motion-codex`. Se nada aqui bater, pergunte a ele');
  L.push('> **antes** de escrever do zero.');
  L.push('');
  L.push('Como usar: ache o efeito → abra pelo MCP ou pela URL → **adapte ao markup e ao CSS do projeto**.');
  L.push('Esta skill não troca o seu layout; ela anima o que já existe.');
  L.push('');
  for (const cat of order) {
    L.push(`## ${cat}`);
    L.push('');
    L.push('| Efeito | O que faz | Onde |');
    L.push('|---|---|---|');
    for (const f of byCat.get(cat).sort((a, b) => a.base.localeCompare(b.base))) {
      const plats = Object.entries(f.platforms).map(([p, u]) => `[${p}](${u})`).join(' · ');
      L.push(`| \`${f.base}\`${f.premium ? ' ★' : ''} | ${f.description} | ${plats} |`);
    }
    L.push('');
  }
  L.push('★ = usa API exclusiva do Motion+ (`splitText`, `Carousel`, `Cursor`, …) — ver');
  L.push('`references/premium-components.md`.');
  L.push('');
  return L.join('\n');
}
