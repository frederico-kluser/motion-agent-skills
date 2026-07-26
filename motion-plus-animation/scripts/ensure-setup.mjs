#!/usr/bin/env node
/**
 * ensure-setup.mjs — bootstrapper idempotente da skill `motion-plus-animation`.
 *
 * Escopo deliberadamente pequeno: esta skill **anima o que já existe**. Ela não instala
 * componente de UI, não roda `shadcn init`, não exige Tailwind e não escreve tema —
 * isso é a skill `motion-plus-ui`. Aqui só:
 *
 * GLOBAL   1. o token (MOTION_TOKEN → MOTION_API_KEY → ~/.secrets), com --save-token
 *          2. o MCP `motion` em escopo de usuário, pinado em 6.2.0
 *          3. a skill oficial `/motion` do AI Kit
 * PROJETO  4. o pacote `motion` (grátis) — e migração de `framer-motion` se houver
 *          5. com --with-premium: o `.npmrc` do escopo @motionplus + o alias `motion-plus`
 *
 * Nunca grava o valor do token num arquivo de projeto: só o placeholder ${MOTION_TOKEN}.
 *
 * Uso:
 *   node ensure-setup.mjs                     # configura o que falta
 *   node ensure-setup.mjs --check             # só relata
 *   node ensure-setup.mjs --with-premium      # + motion-plus (registry privado)
 *   node ensure-setup.mjs --save-token <tok>  # salva o segredo globalmente
 *   node ensure-setup.mjs --global-only       # pula a camada de projeto
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node ensure-setup.mjs [--check] [--with-premium] [--global-only] [--save-token <token>]');
  process.exit(0);
}
const CHECK = args.includes('--check') || args.includes('--dry-run');
const WITH_PREMIUM = args.includes('--with-premium');
const GLOBAL_ONLY = args.includes('--global-only');
const saveIdx = args.indexOf('--save-token');
const SAVE_TOKEN = saveIdx === -1 ? null : args[saveIdx + 1];
if (saveIdx !== -1 && (!SAVE_TOKEN || SAVE_TOKEN.startsWith('-'))) {
  console.error('✗ --save-token needs the token value.');
  process.exit(1);
}

const API = 'https://api.motion.dev';
const MCP_VERSION = '6.2.0';
const MCP_SPEC = `${API}/registry.tgz?package=motion-studio-mcp&version=${MCP_VERSION}`;
const NPM_REGISTRY = `${API}/npm/`;
const PREMIUM_ALIAS = 'npm:@motionplus/core@^2.12.0';
const CWD = process.cwd();

const log = (...a) => console.log(...a);
const run = (cmd, cmdArgs, opts = {}) => spawnSync(cmd, cmdArgs, { encoding: 'utf8', stdio: 'pipe', ...opts });
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };

let changed = 0, warned = 0;
const did = (m) => { changed++; log('+ ' + m); };
const warn = (m) => { warned++; log('⚠ ' + m); };
const ok = (m) => log('✓ ' + m);
const skip = (m) => log('· ' + m);

// ── 1. token ─────────────────────────────────────────────────────────────────
log('— global —');
if (SAVE_TOKEN) saveTokenGlobally(SAVE_TOKEN);

let token = (process.env.MOTION_TOKEN ?? process.env.MOTION_API_KEY ?? '').trim();
if (!token) token = tokenFromSecrets();
if (token) {
  ok(`Motion token resolved (${process.env.MOTION_TOKEN ? 'MOTION_TOKEN' : process.env.MOTION_API_KEY ? 'MOTION_API_KEY' : '~/.secrets'})`);
  process.env.MOTION_TOKEN = token;
} else {
  warn('no Motion token anywhere — the MCP, /motion and motion-plus all need it.');
  log('  Save it once, globally (never inline it in a project or a command):');
  log('    node scripts/ensure-setup.mjs --save-token <token>');
  log('  Get one at https://motion.dev/dashboard/tokens (requires Motion+).');
  log('  The free `motion` package below still installs without it.');
}

// ── 2. motion MCP em escopo de usuário, pinado ───────────────────────────────
// A CLI escreve ~/.claude/.claude.json; ~/.claude.json na raiz é legado em instalações
// antigas e, se lido, faz este passo "atualizar" para sempre.
const CFG_PATHS = [join(homedir(), '.claude', '.claude.json'), join(homedir(), '.claude.json')];
const specOf = (cfg) => {
  const s = cfg?.mcpServers?.motion?.args?.find((a) => typeof a === 'string' && a.includes('motion-studio-mcp')) ?? '';
  return { server: cfg?.mcpServers?.motion, version: s.match(/version=([\d.]+)/)?.[1] ?? null };
};
const cfgs = CFG_PATHS.map((p) => ({ path: p, ...specOf(readJson(p)) })).filter((c) => c.server);
const mcp = cfgs[0]?.server;
const mcpVersion = cfgs[0]?.version ?? null;
if (cfgs.length > 1 && cfgs[0].version !== cfgs[1].version) {
  warn(`two Claude configs disagree on the motion MCP (${cfgs[0].path} → ${cfgs[0].version}, ${cfgs[1].path} → ${cfgs[1].version}).`);
  log('  The CLI writes the first one; the second is legacy. Using the first.');
}

if (!token) skip('motion MCP: skipped (no token)');
else if (mcpVersion === MCP_VERSION) ok(`motion MCP at user scope, pinned ${MCP_VERSION}`);
else if (CHECK) warn(mcp ? `motion MCP pinned ${mcpVersion ?? '?'} — would upgrade to ${MCP_VERSION}` : 'motion MCP not registered at user scope (would add)');
else {
  if (mcp) run('claude', ['mcp', 'remove', '--scope', 'user', 'motion']);
  // spawnSync roda sem shell → '${MOTION_API_KEY}' fica LITERAL no config; o Claude Code
  // expande do próprio env ao subir o servidor. O valor nunca toca o disco.
  const r = run('claude', ['mcp', 'add', '--scope', 'user', 'motion', '--env', 'TOKEN=${MOTION_API_KEY}', '--', 'npx', '-y', MCP_SPEC]);
  if (r.status === 0) did(`motion MCP at user scope → ${MCP_VERSION}${mcpVersion ? ` (was ${mcpVersion})` : ''}`);
  else {
    warn('`claude mcp add` failed (is the `claude` CLI on PATH?). Run manually:');
    log(`    claude mcp add --scope user motion --env TOKEN='\${MOTION_API_KEY}' -- npx -y "${MCP_SPEC}"`);
  }
}

// ── 3. skill /motion do AI Kit ───────────────────────────────────────────────
const motionSkill = join(homedir(), '.claude', 'skills', 'motion', 'SKILL.md');
if (existsSync(motionSkill)) ok('/motion AI-Kit skill installed (~/.claude/skills/motion)');
else if (!token) skip('/motion skill: skipped (no token)');
else if (CHECK) warn('/motion AI-Kit skill not installed (would fetch from the Motion registry)');
else {
  try { await installAiKit(token); }
  catch (e) { warn('/motion install skipped: ' + e.message); }
}

// ── projeto ──────────────────────────────────────────────────────────────────
const pkgPath = join(CWD, 'package.json');
if (GLOBAL_ONLY) skip('project layer skipped (--global-only)');
else if (!existsSync(pkgPath)) { log('\n— project —'); skip('no package.json in cwd — nothing to configure here'); }
else {
  log('\n— project —');
  const pkg = readJson(pkgPath) ?? {};
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const pm = detectPm(CWD);

  // 4. motion (grátis) — e a migração de framer-motion
  if (deps['framer-motion']) {
    warn('project depends on `framer-motion` — migrate to `motion` (import from "motion/react").');
    log('  Motion v12 is API-compatible: swap the package and the import path, nothing else.');
  }
  if (existsSync(join(CWD, 'node_modules', 'motion', 'package.json'))) ok('`motion` installed');
  else if (CHECK) warn(`\`motion\` ${deps.motion ? 'declared but not installed' : 'missing'} (would ${deps.motion ? 'restore' : 'add'})`);
  else {
    const a = deps.motion ? pm.install : pm.add('motion');
    log(`+ ${pm.name} ${a.join(' ')}`);
    if (run(pm.name, a, { stdio: 'inherit' }).status === 0) changed++;
    else warn(`install failed; run manually: ${pm.name} ${a.join(' ')}`);
  }

  // 5. motion-plus (premium) — só sob demanda; um projeto que usa só o core não precisa.
  const premiumInstalled = existsSync(join(CWD, 'node_modules', 'motion-plus', 'package.json'))
    || existsSync(join(CWD, 'node_modules', '@motionplus', 'core', 'package.json'));
  const premiumWanted = WITH_PREMIUM || !!deps['motion-plus'] || !!deps['@motionplus/core'];

  if (!premiumWanted) {
    skip('motion-plus (premium): not requested — add with --with-premium when the code needs');
    log('  Ticker / Carousel / Cursor / AnimateNumber / ScrambleText / Typewriter / splitText / useCurtains');
  } else if (premiumInstalled && deps['motion-plus']) {
    ok('motion-plus (premium) installed');
  } else if (CHECK) {
    warn('motion-plus requested but not wired (would add .npmrc scope + alias + install)');
  } else if (!token) {
    warn('motion-plus needs the token (private registry) — skipped.');
  } else {
    // .npmrc: seguro de commitar, referencia a variável e não o valor.
    const npmrcPath = join(CWD, '.npmrc');
    const npmrc = existsSync(npmrcPath) ? readFileSync(npmrcPath, 'utf8') : '';
    const lines = [`@motionplus:registry=${NPM_REGISTRY}`, '//api.motion.dev/npm/:_authToken=${MOTION_TOKEN}'];
    if (!lines.every((l) => npmrc.includes(l))) {
      writeFileSync(npmrcPath, (npmrc && !npmrc.endsWith('\n') ? npmrc + '\n' : npmrc) +
        lines.filter((l) => !npmrc.includes(l)).join('\n') + '\n');
      did('.npmrc → @motionplus scope (references ${MOTION_TOKEN}, never the value)');
    }
    // O alias mantém os imports documentados (`motion-plus/react`) funcionando.
    if (pkg.dependencies?.['motion-plus'] !== PREMIUM_ALIAS) {
      pkg.dependencies = { ...pkg.dependencies, 'motion-plus': PREMIUM_ALIAS };
      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      did(`package.json → "motion-plus": "${PREMIUM_ALIAS}"`);
    }
    log(`+ ${pm.name} ${pm.install.join(' ')}`);
    if (run(pm.name, pm.install, { stdio: 'inherit', env: { ...process.env, MOTION_TOKEN: token } }).status === 0) changed++;
    else warn('install failed — see references/setup.md (pnpm 11+ and Yarn need extra config).');
  }

  if (pm.name === 'pnpm' && premiumWanted) {
    warn('pnpm 11+ refuses to expand ${MOTION_TOKEN} in a project .npmrc. Before installing:');
    log('    pnpm config set "//api.motion.dev/npm/:_authToken" "$MOTION_TOKEN"');
  }
  if (pm.name === 'yarn' && premiumWanted) {
    warn(existsSync(join(CWD, '.yarnrc.yml'))
      ? 'Yarn Berry: declare the scope in .yarnrc.yml (npmScopes.motionplus) — see references/setup.md'
      : 'Yarn 1 ignores the scoped-registry line in .npmrc — add a .yarnrc too (see references/setup.md)');
  }
}

log(`\n${changed} change(s), ${warned} warning(s).${CHECK ? '  (check mode — nothing modified)' : ''}`);
process.exit(0);

// ── helpers ──────────────────────────────────────────────────────────────────
function tokenFromSecrets() {
  try {
    const s = readFileSync(join(homedir(), '.secrets'), 'utf8');
    for (const name of ['MOTION_TOKEN', 'MOTION_API_KEY']) {
      const v = s.match(new RegExp(`^\\s*export\\s+${name}=["']?([^"'\\s$]+)`, 'm'))?.[1];
      if (v) return v.trim();
    }
  } catch { /* no secrets file */ }
  return '';
}

/**
 * Grava o segredo nos dois lugares globais desta máquina, para nenhum projeto e nenhuma
 * linha de comando carregarem o valor:
 *   ~/.secrets              — sourced pelo ~/.zshenv, vale em todo shell
 *   ~/.claude/settings.json — bloco `env`, vale em toda sessão do Claude Code
 * MOTION_TOKEN deriva de MOTION_API_KEY no ~/.secrets (rotação num lugar só); o
 * settings.json leva o literal porque aquele bloco não faz expansão de shell.
 */
function saveTokenGlobally(value) {
  if (CHECK) { warn('--save-token ignored in --check mode'); return; }
  const secretsPath = join(homedir(), '.secrets');
  let s = existsSync(secretsPath) ? readFileSync(secretsPath, 'utf8') : '';
  if (!/^\s*export\s+MOTION_API_KEY=/m.test(s)) {
    s += `${s && !s.endsWith('\n') ? '\n' : ''}export MOTION_API_KEY=${value}\n`;
    did('~/.secrets → MOTION_API_KEY');
  } else if (!s.includes(value)) {
    s = s.replace(/^(\s*export\s+MOTION_API_KEY=).*$/m, `$1${value}`);
    did('~/.secrets → MOTION_API_KEY updated (rotated)');
  }
  if (!/^\s*export\s+MOTION_TOKEN=/m.test(s)) {
    s = s.replace(/^(\s*export\s+MOTION_API_KEY=.*)$/m,
      '$1\n# Nome canônico esperado por shadcn/npm/registry da Motion — mesmo segredo.\nexport MOTION_TOKEN="$MOTION_API_KEY"');
    did('~/.secrets → MOTION_TOKEN="$MOTION_API_KEY"');
  }
  writeFileSync(secretsPath, s, { mode: 0o600 });

  const settingsPath = join(homedir(), '.claude', 'settings.json');
  const settings = readJson(settingsPath);
  if (!settings) warn('~/.claude/settings.json unreadable — skipped (the ~/.secrets copy still works)');
  else {
    const env = settings.env ?? (settings.env = {});
    if (env.MOTION_TOKEN !== value || env.MOTION_API_KEY !== value) {
      env.MOTION_API_KEY = value;
      env.MOTION_TOKEN = value;
      settings.env = Object.fromEntries(Object.entries(env).sort(([a], [b]) => a.localeCompare(b)));
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
      did('~/.claude/settings.json → env.MOTION_TOKEN + env.MOTION_API_KEY');
    }
  }
  process.env.MOTION_TOKEN = process.env.MOTION_API_KEY = value;
  log('  Run `source ~/.secrets` in the current shell; new sessions pick it up automatically.');
}

function detectPm(cwd) {
  if (existsSync(join(cwd, 'bun.lockb')) || existsSync(join(cwd, 'bun.lock'))) return { name: 'bun', install: ['install'], add: (p) => ['add', p] };
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return { name: 'pnpm', install: ['install'], add: (p) => ['add', p] };
  if (existsSync(join(cwd, 'yarn.lock'))) return { name: 'yarn', install: [], add: (p) => ['add', p] };
  return { name: 'npm', install: ['install'], add: (p) => ['install', p] };
}

async function installAiKit(tok) {
  const res = await fetch(`${API}/me/is-valid-token`, { method: 'POST', headers: { Authorization: `Bearer ${tok}` } });
  const check = res.ok ? await res.json() : null;
  if (!check) throw new Error('token rejected by Motion (generate at motion.dev/dashboard/tokens — requires Motion+)');
  if (!check.isAIKit) throw new Error('token lacks AI-Kit entitlement (isAIKit=false) — the MCP still covers audit/spring-gen');
  const skillsRes = await fetch(`${API}/registry/skills/motion-ai-kit?token=${encodeURIComponent(tok)}`);
  if (!skillsRes.ok) throw new Error(`skills registry returned ${skillsRes.status}`);
  const bundle = await skillsRes.text();
  const byIdx = new Map();
  const ensure = (i) => byIdx.get(i) ?? byIdx.set(i, { files: new Map() }).get(i);
  const ensureFile = (s, j) => s.files.get(j) ?? s.files.set(j, {}).get(j);
  for (const line of bundle.split('\n')) {
    let m;
    if ((m = line.match(/^SKILL_(\d+)_NAME="(.*)"$/))) ensure(m[1]).name = m[2];
    else if ((m = line.match(/^SKILL_(\d+)_FILE_(\d+)_PATH="(.*)"$/))) ensureFile(ensure(m[1]), m[2]).path = m[3];
    else if ((m = line.match(/^SKILL_(\d+)_FILE_(\d+)_B64="(.*)"$/))) ensureFile(ensure(m[1]), m[2]).b64 = m[3];
  }
  const base = join(homedir(), '.claude');
  let written = 0;
  for (const skill of byIdx.values()) {
    if (!skill.name) continue;
    for (const file of skill.files.values()) {
      if (!file.path || !file.b64) continue;
      const full = join(base, 'skills', skill.name, file.path);
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, Buffer.from(file.b64, 'base64'));
      written++;
    }
    did(`skill "${skill.name}" → ${join(base, 'skills', skill.name)}`);
  }
  if (!written) throw new Error('registry returned no skill files');
}
