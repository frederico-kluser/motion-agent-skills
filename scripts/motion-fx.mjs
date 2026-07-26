#!/usr/bin/env node
/**
 * motion-fx.mjs — busca no catálogo de efeitos prontos, antes de escrever animação.
 *
 *   list [--react|--js|--vue|--premium|--json]
 *   search <termos…>        PT ou EN; casa slug, título, descrição e intenção
 *   show <efeito>           descrição + URLs por plataforma
 *   categories              as categorias e quantos efeitos cada uma tem
 *
 * Lê `assets/motion-effects-index.json` (offline). `--refresh` rebaixa o llms.txt antes.
 *
 * Não existe "instalar" aqui, de propósito: exemplo não é pacote. O fluxo é achar → abrir
 * pelo MCP (`search-motion-codex`) ou pela URL → **adaptar ao markup e ao CSS do projeto**.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT = join(ROOT, 'assets', 'motion-effects-index.json');

/** Intenção → efeito. Curado: as palavras que uma pessoa digita, em PT e EN. */
const INTENTS = [
  ['aparecer / entrar / montar / enter', 'enter-animation · stagger · variants'],
  ['sumir / sair / desmontar / exit / remover da lista', 'exit-animation · animate-presence-modes'],
  ['lista que reordena / arrastar para ordenar', 'todo-list · notifications-list'],
  ['parallax / profundidade ao rolar', 'parallax · scroll-velocity-linked-offset'],
  ['revelar ao rolar / scroll reveal / fade ao rolar', 'scroll-triggered · scroll-fade · scroll-image-reveal'],
  ['fixar ao rolar / pin / sticky / header some', 'scroll-pinning · scroll-hide-header'],
  ['zoom ao rolar / hero imersivo', 'scroll-zoom-hero'],
  ['barra de progresso do scroll', 'loading-progress-bar · scroll-highlight'],
  ['texto letra por letra / split / máscara', 'split-text · split-text-scatter · split-text-wavy · text-reveal'],
  ['máquina de escrever / typewriter', 'typewriter'],
  ['texto embaralhado / scramble / glitch', 'split-text-scatter'],
  ['contador / número animado / caracteres restantes', 'characters-remaining · multi-state-badge'],
  ['modal / dialog / popup', 'modal · family-dialog · app-store-layout'],
  ['acordeão / colapsar / expandir', 'accordion'],
  ['abas / tabs / segmented', 'smooth-tabs · tab-select'],
  ['card que vira detalhe / shared element / app store', 'app-store · app-store-layout · lightbox · ios-app-folder'],
  ['transição de página / rota / wipe', 'page-wipe · view-animation · shared-view-animation'],
  ['arrastar / drag / soltar', 'drag · card-stack · image-reveal-slider'],
  ['swipe / deslizar para revelar ação', 'swipe-actions'],
  ['segurar para confirmar / long press', 'hold-to-confirm · press'],
  ['hover / passar o mouse', 'hover · bobble-hover · text-reveal'],
  ['cursor / seguir o mouse / rastro', 'cursor-trail · cursor-trail-velocity · spring-follow-cursor · follow-pointer-with-spring'],
  ['imã / magnético / apontar para o cursor', 'magnetic-filings · cursor-floating-target'],
  ['carrossel / slider de imagens', 'carousel-ios-exposure-slider · card-stack'],
  ['ticker / marquee / esteira de logos', 'scroll-velocity-linked-offset'],
  ['tilt 3D / inclinar card', 'tilt-card'],
  ['cubo 3D / three.js', 'use-animation-frame · three'],
  ['loading / spinner / carregando', 'loading-circle-spinner · loading-three-dots-pulse · loading-jumping-dots'],
  ['skeleton / placeholder', 'loading-line-reveal · infinite-loading'],
  ['ripple / ondulação ao clicar', 'material-design-ripple · loading-ripple · apple-intelligence'],
  ['confete / celebração / sucesso', 'multi-state-badge'],
  ['notificação / toast / pilha', 'notifications-stack · notifications-list'],
  ['desenhar SVG / path / traço', 'path-drawing · loading-infinite-path-drawing · svg-loading-spinner'],
  ['morphing de forma / SVG morph', 'path-morphing · svg-path-morphing'],
  ['seguir um caminho / arco', 'motion-path'],
  ['mola / spring / quicar / bounce', 'spring · bounce-easing · css-spring'],
  ['stagger / escalonar / em cascata', 'stagger · staggered-grid'],
  ['gradiente que segue o mouse', 'conic-gradient-pointer'],
  ['interpolação de cor', 'color-interpolation'],
  ['comparar antes/depois / slider de imagem', 'image-reveal-slider'],
];

const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (f) => argv.includes(f);
const rest = argv.slice(1).filter((a) => !a.startsWith('--'));

if (!cmd || flag('--help') || flag('-h') || cmd === 'help') usage(0);

if (flag('--refresh')) {
  const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'refresh-effects.mjs')], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
if (!existsSync(SNAPSHOT)) {
  console.error('✗ assets/motion-effects-index.json ausente — rode: node scripts/refresh-effects.mjs');
  process.exit(1);
}

const snap = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
const items = snap.items;
/** Um "efeito" pode existir em React, JS e Vue — agrupa as variantes. */
const families = new Map();
for (const i of items) {
  const f = families.get(i.base) ?? families.set(i.base, { base: i.base, title: i.title, description: i.description, category: i.category, premium: false, platforms: {} }).get(i.base);
  f.platforms[i.platform] = i.url;
  f.premium ||= i.premium;
  if (i.platform === 'React') { f.title = i.title; f.description = i.description; }
}
const line = (f) => `${(f.base + (f.premium ? ' ★' : '')).padEnd(34)} ${Object.keys(f.platforms).join('/').padEnd(12)} ${f.category.padEnd(36)} ${f.description.slice(0, 90)}`;

switch (cmd) {
  case 'list': {
    let sel = [...families.values()];
    for (const [f, p] of [['--react', 'React'], ['--js', 'JS'], ['--vue', 'Vue']]) {
      if (flag(f)) sel = sel.filter((x) => x.platforms[p]);
    }
    if (flag('--premium')) sel = sel.filter((x) => x.premium);
    if (flag('--json')) { console.log(JSON.stringify(sel, null, 2)); break; }
    sel.sort((a, b) => (a.category + a.base).localeCompare(b.category + b.base));
    for (const f of sel) console.log(line(f));
    console.log(`\n${sel.length} efeito(s) · snapshot ${snap.fetchedAt} · ${snap.counts.examples} exemplos indexados`);
    console.log('A biblioteca completa do Motion+ (400+) só pelo MCP: mcp__motion__search-motion-codex');
    break;
  }

  case 'categories': {
    const c = new Map();
    for (const f of families.values()) c.set(f.category, (c.get(f.category) ?? 0) + 1);
    for (const [k, v] of [...c].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`);
    break;
  }

  case 'search': {
    const terms = rest.map((t) => t.toLowerCase()).filter(Boolean);
    if (!terms.length) { console.error('uso: motion-fx.mjs search <termos…>'); process.exit(1); }
    const hay = (f) => [f.base, f.title, f.description, f.category].join(' ').toLowerCase();
    const score = new Map();
    const bump = (b, n) => score.set(b, (score.get(b) ?? 0) + n);
    for (const f of families.values()) {
      const s = terms.reduce((acc, t) => acc + (f.base.includes(t) ? 3 : 0) + (hay(f).includes(t) ? 1 : 0), 0);
      if (s) bump(f.base, s);
    }
    const intents = INTENTS.filter(([k]) => terms.some((t) => k.toLowerCase().includes(t)));
    for (const [, v] of intents) for (const w of v.split(/[^a-z0-9-]+/)) if (families.has(w)) bump(w, 5);
    if (intents.length) {
      console.log('Por intenção:');
      for (const [k, v] of intents) console.log(`  ${k}  →  ${v}`);
      console.log('');
    }
    const hits = [...score.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (!hits.length) {
      console.log(`Nada bateu com "${rest.join(' ')}" no índice público.`);
      console.log('Pergunte ao MCP antes de escrever do zero:');
      console.log(`  mcp__motion__search-motion-codex { platform: "react", searchTerm: "${rest.join(' ')}" }`);
      console.log('Ele cobre os 400+ exemplos do Motion+, que não estão neste índice.');
      process.exit(2);
    }
    for (const [b] of hits) console.log(line(families.get(b)));
    console.log(`\n${hits.length} hit(s). Abra pelo MCP ou pela URL e adapte ao seu markup/CSS.`);
    break;
  }

  case 'show': {
    const f = families.get(rest[0]);
    if (!f) { console.error(`✗ "${rest[0]}" não está no índice. Rode: motion-fx.mjs search ${rest[0] ?? ''}`); process.exit(1); }
    if (flag('--json')) { console.log(JSON.stringify(f, null, 2)); break; }
    console.log(`${f.title}  (${f.base})${f.premium ? '   ★ usa API exclusiva do Motion+' : ''}`);
    console.log(`  categoria: ${f.category}`);
    console.log(`  ${f.description}`);
    for (const [p, u] of Object.entries(f.platforms)) console.log(`  ${p.padEnd(6)} ${u}`);
    console.log(`\n  Fonte completa: mcp__motion__search-motion-codex { platform: "react", searchTerm: "${f.base}" }`);
    break;
  }

  default:
    console.error(`comando desconhecido: ${cmd}`);
    usage(1);
}

function usage(code) {
  console.log(`motion-fx — catálogo de efeitos prontos do Motion / Motion+

  list [--react|--js|--vue|--premium] [--json]
  search <termos…>       PT ou EN; casa slug, título, descrição e intenção
  show <efeito> [--json] descrição + URL por plataforma
  categories             quantos efeitos por categoria

  --refresh   rebaixa o llms.txt antes (público, não precisa de token)`);
  process.exit(code);
}
