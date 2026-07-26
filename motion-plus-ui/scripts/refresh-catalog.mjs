#!/usr/bin/env node
/**
 * refresh-catalog.mjs — re-reads the live Motion UI registry and regenerates
 *   assets/motion-ui-index.json   (enriched snapshot: deps + files + premium flag)
 *   references/catalog.md         (the file the agent reads in step 1 of the cascade)
 *
 * The registry is the only machine-readable index of Motion UI — motion.dev/llms.txt
 * does NOT list /ui. Auth is a Bearer token; MOTION_TOKEN and MOTION_API_KEY are the
 * same secret (verified against the live endpoint), so either works.
 *
 * Usage:
 *   node scripts/refresh-catalog.mjs           # fetch + rewrite both files
 *   node scripts/refresh-catalog.mjs --check   # report drift, write nothing
 *
 * Output is meant to be reviewed as a `git diff` — never auto-commit it.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INTENTS } from './intents.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_URL = 'https://api.motion.dev/ui/registry/index.json';
const ITEM_URL = (n) => `https://api.motion.dev/ui/registry/${n}.json`;
const SNAPSHOT = join(ROOT, 'assets', 'motion-ui-index.json');
const CATALOG = join(ROOT, 'references', 'catalog.md');

const CHECK = process.argv.includes('--check');
// index.json is PUBLIC (200 without auth, byte-identical with it) — only the per-item
// payloads are 401-gated. So drift detection works anywhere; enrichment needs the token.
const token = (process.env.MOTION_TOKEN ?? process.env.MOTION_API_KEY ?? '').trim();
if (!token && !CHECK) {
  console.error('✗ MOTION_TOKEN (or MOTION_API_KEY) not set — per-item payloads are token-gated.');
  console.error('  `--check` works without it (the index is public).');
  process.exit(1);
}

const CATEGORY_LABEL = {
  'hero-sections': 'Hero', 'pricing-sections': 'Preços', 'testimonials': 'Depoimentos',
  'bento-grids': 'Bento', 'stats-sections': 'Métricas', 'navigation': 'Navegação',
  'cta-sections': 'CTA', 'footers': 'Rodapé', 'page-transitions': 'Transição de página',
  'faq-sections': 'FAQ', 'overlays': 'Overlays', 'buttons': 'Botões', 'lists': 'Listas',
  'loaders': 'Loaders',
};

const get = async (url) => {
  // Cloudflare 403s some default agent UAs; send a browser-ish one.
  const headers = { 'User-Agent': 'Mozilla/5.0 (motion-plus-ui skill)' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} — ${url.replace(/\/[^/]+$/, '/…')}`);
  return r.json();
};

const mapLimit = async (items, limit, fn) => {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
};

const index = await get(INDEX_URL);
if (CHECK && !token) {
  // Public index only: compare names, skip the per-item enrichment entirely.
  const prev = existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, 'utf8')) : { items: [] };
  reportDrift(prev.items.map((i) => i.name), index.items.map((i) => i.name), prev.fetchedAt, index.items.length);
}
const detailed = await mapLimit(index.items, 8, async (meta) => {
  const d = await get(ITEM_URL(meta.name));
  const dependencies = d.dependencies ?? [];
  return {
    name: meta.name,
    type: meta.type,
    category: meta.category ?? null,
    title: meta.title,
    description: meta.description,
    dependencies,
    registryDependencies: d.registryDependencies ?? [],
    premium: dependencies.some((x) => x.includes('@motionplus/')),
    baseUi: dependencies.includes('@base-ui/react'),
    files: (d.files ?? []).map((f) => f.target ?? f.path),
  };
});

const snapshot = {
  source: INDEX_URL,
  fetchedAt: new Date().toISOString().slice(0, 10),
  counts: {
    total: detailed.length,
    sections: detailed.filter((i) => i.type === 'registry:block').length,
    components: detailed.filter((i) => i.type === 'registry:component').length,
    premium: detailed.filter((i) => i.premium).length,
  },
  items: detailed,
};

if (CHECK) {
  const prev = existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, 'utf8')) : { items: [] };
  reportDrift(prev.items.map((i) => i.name), detailed.map((i) => i.name), prev.fetchedAt, detailed.length);
}

writeFileSync(SNAPSHOT, JSON.stringify(snapshot, null, 2) + '\n');
writeFileSync(CATALOG, renderCatalog(snapshot));
console.log(`✓ assets/motion-ui-index.json  (${detailed.length} itens)`);
console.log(`✓ references/catalog.md`);

/** Exits the process: 0 when the snapshot matches the live registry, 1 on drift. */
function reportDrift(before, after, fetchedAt, liveCount) {
  const b = new Set(before), a = new Set(after);
  const added = [...a].filter((n) => !b.has(n));
  const removed = [...b].filter((n) => !a.has(n));
  console.log(`live:     ${liveCount} itens`);
  console.log(`snapshot: ${before.length} itens (${fetchedAt ?? 'n/d'})`);
  if (added.length) console.log(`+ novos:   ${added.join(', ')}`);
  if (removed.length) console.log(`- sumiram: ${removed.join(', ')}`);
  if (!added.length && !removed.length) console.log('✓ sem drift');
  process.exit(added.length || removed.length ? 1 : 0);
}

// ── rendering ────────────────────────────────────────────────────────────────
function flags(i) {
  const f = [];
  if (i.premium) f.push('Motion+');
  if (i.baseUi) f.push('Base UI');
  return f.join(' · ') || '—';
}

function renderCatalog(snap) {
  const blocks = snap.items.filter((i) => i.type === 'registry:block');
  const comps = snap.items.filter((i) => i.type === 'registry:component' && !['ui-theme', 'velocity-preview-theme'].includes(i.name));
  const infra = snap.items.filter((i) => ['ui-theme', 'velocity-preview-theme', 'motion-theme'].includes(i.name));
  const byCat = new Map();
  for (const b of blocks) (byCat.get(b.category) ?? byCat.set(b.category, []).get(b.category)).push(b);

  const L = [];
  L.push('# Catálogo Motion UI — o que já existe pronto');
  L.push('');
  L.push('> **Gerado** por `scripts/refresh-catalog.mjs` a partir de `' + snap.source + '`.');
  L.push('> Não editar à mão. Atualizado em **' + snap.fetchedAt + '** — ' + snap.counts.total + ' itens: **' +
    snap.counts.sections + ' seções** + **' + (snap.counts.components - 2) + ' componentes** + infraestrutura.');
  L.push('> `Motion+` = puxa `@motionplus/core` (precisa do `.npmrc` com escopo). `Base UI` = primitivo acessível por baixo.');
  L.push('');
  L.push('Instalar qualquer item: `npx shadcn@latest add @motion/<name>`');
  L.push('');
  L.push('## Passo 1 da cascata — achar pela intenção');
  L.push('');
  L.push('| Quero… | Usar |');
  L.push('|---|---|');
  for (const [k, v] of INTENTS) L.push(`| ${k} | ${v} |`);
  L.push('');
  L.push('Nada bateu? Refine com `node scripts/motion-ui.mjs search "<termo>"` e consulte o');
  L.push('`mcp__motion__search-motion-codex` (MCP ≥ 6.2.0 devolve o source Motion UI completo)');
  L.push('**antes** de decidir que o catálogo não cobre o caso.');
  L.push('');
  L.push('## Seções (`registry:block`) — blocos de página inteiros');
  L.push('');
  for (const [cat, items] of [...byCat].sort((a, b) => a[0].localeCompare(b[0]))) {
    L.push(`### ${CATEGORY_LABEL[cat] ?? cat} — \`${cat}\``);
    L.push('');
    L.push('| `add @motion/…` | O que é | Deps |');
    L.push('|---|---|---|');
    for (const i of items.sort((a, b) => a.name.localeCompare(b.name))) {
      L.push(`| \`${i.name}\` | ${i.description} | ${flags(i)} |`);
    }
    L.push('');
  }
  L.push('## Componentes (`registry:component`) — peças para compor');
  L.push('');
  L.push('| `add @motion/…` | O que é | Deps |');
  L.push('|---|---|---|');
  for (const i of comps.sort((a, b) => a.name.localeCompare(b.name))) {
    L.push(`| \`${i.name}\` | ${i.description} | ${flags(i)} |`);
  }
  L.push('');
  L.push('## Infraestrutura — instalar uma vez, nunca reinstalar por cima');
  L.push('');
  L.push('| `add @motion/…` | O que é |');
  L.push('|---|---|');
  for (const i of infra.sort((a, b) => a.name.localeCompare(b.name))) {
    L.push(`| \`${i.name}\` | ${i.description} |`);
  }
  L.push('');
  L.push('**`motion-theme` sobrescreve `motion.theme.ts`.** Rodar só quando o arquivo não existe —');
  L.push('depois de customizado, é o único comando capaz de apagar a sua configuração.');
  L.push('');
  L.push('## Onde os arquivos caem');
  L.push('');
  L.push('Tudo em `components/motion-ui/**` (seções em `components/motion-ui/sections/<name>/`).');
  L.push('Itens compartilham subcomponentes — instalar `stats-counters` também traz');
  L.push('`components/motion-ui/animated-number/`, por exemplo. Isso é esperado: o shadcn CLI');
  L.push('**é dono** desses arquivos e os sobrescreve em cada `add`. Suas edições vão em *wrappers*.');
  L.push('');
  L.push('## Fora do catálogo (mas já pronto no `motion-plus/react`)');
  L.push('');
  L.push('Antes de escrever qualquer coisa nova, lembre que o pacote premium já entrega');
  L.push('`Ticker`, `Carousel`, `Cursor`, `AnimateNumber`, `AnimateText`, `ScrambleText`,');
  L.push('`Typewriter`, `splitText`, `AnimateView`, `AnimateActivity` e `useCurtains` —');
  L.push('ver `references/premium-components.md`.');
  L.push('');
  return L.join('\n');
}
