#!/usr/bin/env node
/**
 * motion-ui.mjs — step 1 and 2 of the cascade, in one command.
 *
 *   list [--sections|--components|--premium|--json]   tudo que existe
 *   search <termos…>                                  acha pelo que a pessoa pediu
 *   show <name>                                       detalhe: deps, arquivos, comando
 *   add <name…> [-- <flags do shadcn>]                instala, validando o nome antes
 *
 * Reads the offline snapshot in `assets/motion-ui-index.json` (zero latency, works
 * without network). `--refresh` on any command re-reads the live registry first.
 *
 * `add` exists so the agent can never `shadcn add @motion/<nome-inventado>`: the name
 * is checked against the index, and MOTION_TOKEN is injected into the child env from
 * whichever of MOTION_TOKEN / MOTION_API_KEY is set (same secret).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { INTENTS } from './intents.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT = join(ROOT, 'assets', 'motion-ui-index.json');

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (f) => argv.includes(f);
const rest = argv.slice(1).filter((a) => !a.startsWith('--'));

if (!cmd || flag('--help') || flag('-h') || cmd === 'help') usage(0);

if (flag('--refresh')) {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'refresh-catalog.mjs')], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!existsSync(SNAPSHOT)) {
  console.error('✗ assets/motion-ui-index.json ausente — rode: node scripts/refresh-catalog.mjs');
  process.exit(1);
}
const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
const items = snap.items;
const byName = new Map(items.map((i) => [i.name, i]));
const INFRA = new Set(['ui-theme', 'motion-theme', 'velocity-preview-theme']);

const tag = (i) => [i.premium ? 'Motion+' : null, i.baseUi ? 'BaseUI' : null].filter(Boolean).join(',');
const kind = (i) => (i.type === 'registry:block' ? 'seção' : INFRA.has(i.name) ? 'infra' : 'comp');
const line = (i) => `${i.name.padEnd(26)} ${kind(i).padEnd(6)} ${(i.category ?? '').padEnd(18)} ${tag(i).padEnd(14)} ${i.description}`;

switch (cmd) {
  case 'list': {
    let sel = items;
    if (flag('--sections')) sel = sel.filter((i) => i.type === 'registry:block');
    if (flag('--components')) sel = sel.filter((i) => i.type === 'registry:component' && !INFRA.has(i.name));
    if (flag('--premium')) sel = sel.filter((i) => i.premium);
    if (flag('--json')) { console.log(JSON.stringify(sel, null, 2)); break; }
    sel.sort((a, b) => (a.type + a.name).localeCompare(b.type + b.name));
    for (const i of sel) console.log(line(i));
    console.log(`\n${sel.length} item(s) · snapshot ${snap.fetchedAt} · ${snap.counts.sections} seções / ${snap.counts.components - 2} componentes / ${snap.counts.premium} usam Motion+`);
    break;
  }

  case 'search': {
    const terms = rest.map((t) => t.toLowerCase()).filter(Boolean);
    if (!terms.length) { console.error('uso: motion-ui.mjs search <termos…>'); process.exit(1); }
    const hay = (i) => [i.name, i.title, i.description, i.category].filter(Boolean).join(' ').toLowerCase();
    const score = new Map();
    const bump = (name, n) => score.set(name, (score.get(name) ?? 0) + n);
    for (const i of items) {
      const s = terms.reduce((acc, t) => acc + (i.name.includes(t) ? 3 : 0) + (hay(i).includes(t) ? 1 : 0), 0);
      if (s) bump(i.name, s);
    }

    // An intent match is a stronger signal than a substring match: it resolves the
    // words a person used to the names the registry actually has.
    const intents = INTENTS.filter(([k]) => terms.some((t) => k.toLowerCase().includes(t)));
    for (const [, v] of intents) {
      for (const w of v.split(/[^a-z0-9-]+/)) if (byName.has(w)) bump(w, 5);
    }
    if (intents.length) {
      console.log('Por intenção:');
      for (const [k, v] of intents) console.log(`  ${k}  →  ${v}`);
      console.log('');
    }

    const hits = [...score.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([n]) => ({ i: byName.get(n) }));

    if (!hits.length) {
      console.log(`Nada bateu com "${rest.join(' ')}".`);
      console.log('Antes de escrever do zero: consulte mcp__motion__search-motion-codex (MCP ≥ 6.2.0)');
      console.log('e references/premium-components.md — Ticker/Carousel/Cursor/AnimateNumber não estão neste índice.');
      process.exit(2);
    }
    for (const h of hits) console.log(line(h.i));
    console.log(`\n${hits.length} hit(s). Instalar: npx shadcn@latest add @motion/<name>`);
    break;
  }

  case 'show': {
    const name = rest[0];
    const i = byName.get(name);
    if (!i) { console.error(`✗ "${name}" não existe no registry. Rode: motion-ui.mjs search ${name ?? ''}`); process.exit(1); }
    if (flag('--json')) { console.log(JSON.stringify(i, null, 2)); break; }
    console.log(`${i.title}  (@motion/${i.name})`);
    console.log(`  tipo:      ${i.type}${i.category ? ` · ${i.category}` : ''}`);
    console.log(`  descrição: ${i.description}`);
    console.log(`  npm:       ${i.dependencies.join(', ') || '—'}${i.premium ? '   ← precisa do .npmrc @motionplus' : ''}`);
    console.log(`  registry:  ${i.registryDependencies.join(', ') || '—'}`);
    console.log(`  arquivos:  ${i.files.length}`);
    for (const f of i.files) console.log(`    - ${f}`);
    console.log(`\n  npx shadcn@latest add @motion/${i.name}`);
    break;
  }

  case 'add': {
    const sepIdx = argv.indexOf('--');
    const names = (sepIdx === -1 ? argv.slice(1) : argv.slice(1, sepIdx)).filter((a) => !a.startsWith('--'));
    const passthrough = sepIdx === -1 ? [] : argv.slice(sepIdx + 1);
    if (!names.length) { console.error('uso: motion-ui.mjs add <name…> [-- <flags do shadcn>]'); process.exit(1); }

    const unknown = names.filter((n) => !byName.has(n));
    if (unknown.length) {
      console.error(`✗ não existe no registry: ${unknown.join(', ')}`);
      console.error('  (o índice é a verdade — não invente nome. Rode `search` primeiro.)');
      process.exit(1);
    }
    if (names.includes('motion-theme') && existsSync(join(process.cwd(), 'motion.theme.ts'))) {
      console.error('✗ motion.theme.ts já existe — este é o ÚNICO add que sobrescreve sua configuração.');
      console.error('  Edite o arquivo à mão; `defineTheme` faz merge parcial sobre os defaults.');
      process.exit(1);
    }

    const token = (process.env.MOTION_TOKEN ?? process.env.MOTION_API_KEY ?? '').trim();
    if (!token) { console.error('✗ MOTION_TOKEN / MOTION_API_KEY ausente — o registry responde 401 sem Bearer.'); process.exit(1); }
    if (!existsSync(join(process.cwd(), 'components.json'))) {
      console.error('✗ components.json ausente neste projeto — rode antes:');
      console.error('    node ' + join(ROOT, 'scripts', 'ensure-setup.mjs'));
      process.exit(1);
    }

    const premium = names.filter((n) => byName.get(n).premium);
    if (premium.length) console.log(`· ${premium.join(', ')} puxam @motionplus/core — .npmrc com escopo é obrigatório.`);

    const args = ['shadcn@latest', 'add', ...names.map((n) => `@motion/${n}`), ...passthrough];
    console.log(`+ npx ${args.join(' ')}`);
    const r = spawnSync('npx', args, { stdio: 'inherit', env: { ...process.env, MOTION_TOKEN: token } });
    process.exit(r.status ?? 1);
  }

  default:
    console.error(`comando desconhecido: ${cmd}`);
    usage(1);
}

function usage(code) {
  console.log(`motion-ui — catálogo Motion UI (${existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, 'utf8')).items.length : '?'} itens)

  list [--sections|--components|--premium] [--json]
  search <termos…>              PT ou EN; casa nome, título, descrição e intenção
  show <name> [--json]          deps, arquivos e o comando de instalação
  add <name…> [-- <flags>]      valida o nome e roda o shadcn CLI com o token

  --refresh   rebaixa o registry antes (precisa de MOTION_TOKEN/MOTION_API_KEY)`);
  process.exit(code);
}
