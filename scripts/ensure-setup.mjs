#!/usr/bin/env node
/**
 * ensure-setup.mjs — idempotent bootstrapper for the `motion-plus-ui` skill.
 *
 * GLOBAL (once per machine)
 *   1. MOTION_API_KEY / MOTION_TOKEN in the environment (same secret; the Motion UI
 *      registry, the npm registry and the MCP all accept it).
 *   2. the `motion` MCP at USER scope, pinned to 6.2.0 — the release that made
 *      `search-motion-codex` return Motion UI sections/components as full source.
 *      An older pin is upgraded in place.
 *   3. the official `/motion` AI-Kit skill (~/.claude/skills/motion/).
 *
 * PROJECT (once per repo, only when a package.json is present)
 *   4. base `motion`.
 *   5. Tailwind + shadcn (`components.json`) — bootstrapped when missing, because
 *      Motion UI components are pure shadcn-semantic Tailwind and render unstyled
 *      without the token layer.
 *   6. the `@motion` registry entry in components.json.
 *   7. `.npmrc` (+ Yarn variants) for the `@motionplus` scope — 20 of the 64 catalog
 *      items depend on `motion-plus@npm:@motionplus/core`.
 *   8. `motion.theme.ts` — installed once, NEVER overwritten afterwards.
 *   9. a reminder if <MotionUIThemeProvider> is not mounted anywhere.
 *
 * Nothing here ever writes the token value to a file: only the literal
 * `${MOTION_TOKEN}` / `${MOTION_API_KEY}` placeholders are persisted.
 *
 * Usage:
 *   node ensure-setup.mjs               # configure what's missing
 *   node ensure-setup.mjs --check       # report only, change nothing
 *   node ensure-setup.mjs --no-init     # never run `shadcn init` (just report)
 *   node ensure-setup.mjs --global-only # skip the project layer
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node ensure-setup.mjs [--check] [--no-init] [--global-only]');
  process.exit(0);
}
const CHECK = args.includes('--check') || args.includes('--dry-run');
const NO_INIT = args.includes('--no-init');
const GLOBAL_ONLY = args.includes('--global-only');

const API = 'https://api.motion.dev';
const MCP_VERSION = '6.2.0'; // ≥6.2.0 → search-motion-codex serves Motion UI source
const MCP_SPEC = `${API}/registry.tgz?package=motion-studio-mcp&version=${MCP_VERSION}`;
const UI_REGISTRY = `${API}/ui/registry/{name}.json`;
const NPM_REGISTRY = `${API}/npm/`;
const CWD = process.cwd();

const log = (...a) => console.log(...a);
const run = (cmd, cmdArgs, opts = {}) => spawnSync(cmd, cmdArgs, { encoding: 'utf8', stdio: 'pipe', ...opts });
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };

let changed = 0, warned = 0;
const did = (m) => { changed++; log('+ ' + m); };
const warn = (m) => { warned++; log('⚠ ' + m); };
const ok = (m) => log('✓ ' + m);
const skip = (m) => log('· ' + m);

const token = (process.env.MOTION_API_KEY ?? process.env.MOTION_TOKEN ?? '').trim();

// ── 1. key ───────────────────────────────────────────────────────────────────
log('— global —');
if (token) ok('MOTION_API_KEY/MOTION_TOKEN present in environment');
else {
  warn('no Motion token in the environment — the registry answers 401 without it.');
  log('  Set it once globally (~/.secrets + the `env` block of ~/.claude/settings.json):');
  log('    export MOTION_API_KEY=<token de motion.dev/dashboard/tokens>');
  log('  MOTION_TOKEN is the name the shadcn/npm configs expect; the same value serves both.');
}

// ── 2. motion MCP at user scope, pinned to 6.2.0 ─────────────────────────────
// Claude Code's user config moved: the CLI now writes ~/.claude/.claude.json, while
// ~/.claude.json survives as a stale legacy file on older installs. Reading the legacy
// one makes this step non-idempotent (it "upgrades" forever). Prefer the CLI's file.
const CFG_PATHS = [join(homedir(), '.claude', '.claude.json'), join(homedir(), '.claude.json')];
const specOf = (cfg) => {
  const s = cfg?.mcpServers?.motion?.args?.find((a) => typeof a === 'string' && a.includes('motion-studio-mcp')) ?? '';
  return { server: cfg?.mcpServers?.motion, version: s.match(/version=([\d.]+)/)?.[1] ?? null };
};
const found = CFG_PATHS.map((p) => ({ path: p, ...specOf(readJson(p)) })).filter((c) => c.server);
const active = found[0];
const mcp = active?.server;
const mcpVersion = active?.version ?? null;
if (found.length > 1 && found[0].version !== found[1].version) {
  warn(`two Claude configs disagree on the motion MCP (${found[0].path} → ${found[0].version}, ${found[1].path} → ${found[1].version}).`);
  log('  The CLI writes the first one; the second is legacy. Using the first.');
}
const addMcp = () => run('claude', ['mcp', 'add', '--scope', 'user', 'motion',
  '--env', 'TOKEN=${MOTION_API_KEY}', '--', 'npx', '-y', MCP_SPEC]);

if (!token) {
  skip('motion MCP: skipped (no token)');
} else if (mcpVersion === MCP_VERSION) {
  ok(`motion MCP at user scope, pinned ${MCP_VERSION}`);
} else if (CHECK) {
  warn(mcp
    ? `motion MCP pinned ${mcpVersion ?? '?'} — would upgrade to ${MCP_VERSION} (Motion UI in search-motion-codex)`
    : 'motion MCP not registered at user scope (would add)');
} else {
  if (mcp) run('claude', ['mcp', 'remove', '--scope', 'user', 'motion']);
  // spawnSync runs without a shell → '${MOTION_API_KEY}' is stored LITERALLY;
  // Claude Code expands it from its own env when it launches the server.
  const r = addMcp();
  if (r.status === 0) did(`motion MCP at user scope → ${MCP_VERSION}${mcpVersion ? ` (was ${mcpVersion})` : ''}`);
  else {
    warn('`claude mcp add` failed (is the `claude` CLI on PATH?). Run manually:');
    log(`    claude mcp add --scope user motion --env TOKEN='\${MOTION_API_KEY}' -- npx -y "${MCP_SPEC}"`);
  }
}

// ── 3. official /motion AI-Kit skill ─────────────────────────────────────────
const motionSkill = join(homedir(), '.claude', 'skills', 'motion', 'SKILL.md');
if (existsSync(motionSkill)) ok('/motion AI-Kit skill installed (~/.claude/skills/motion)');
else if (!token) skip('/motion skill: skipped (no token)');
else if (CHECK) warn('/motion AI-Kit skill not installed (would fetch from the Motion registry)');
else {
  try { await installAiKit(token); }
  catch (e) { warn('/motion install skipped: ' + e.message); }
}

// ── project layer ────────────────────────────────────────────────────────────
const pkgPath = join(CWD, 'package.json');
if (GLOBAL_ONLY) {
  skip('project layer skipped (--global-only)');
} else if (!existsSync(pkgPath)) {
  log('\n— project —');
  skip('no package.json in cwd — nothing to configure here');
} else {
  log('\n— project —');
  const pkg = readJson(pkgPath) ?? {};
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const pm = detectPm(CWD);

  // 4. base motion + framer-motion migration
  if (deps['framer-motion']) warn('project depends on `framer-motion` — migrate to `motion` (import from "motion/react"); the API is compatible.');
  if (existsSync(join(CWD, 'node_modules', 'motion', 'package.json'))) ok('base `motion` installed');
  else if (CHECK) warn(`base \`motion\` ${deps.motion ? 'declared but not installed' : 'missing'} (would ${deps.motion ? 'restore' : 'add'})`);
  else {
    const a = deps.motion ? pm.install : pm.add('motion');
    log(`+ ${pm.name} ${a.join(' ')}`);
    if (run(pm.name, a, { stdio: 'inherit' }).status === 0) changed++;
    else warn(`install failed; run manually: ${pm.name} ${a.join(' ')}`);
  }

  // 5. Tailwind + shadcn — the token layer Motion UI is written against
  const componentsJsonPath = join(CWD, 'components.json');
  const hasTailwind = !!(deps.tailwindcss || deps['@tailwindcss/vite'] || deps['@tailwindcss/postcss']);
  if (existsSync(componentsJsonPath)) {
    ok(`shadcn configured (components.json)${hasTailwind ? ' + Tailwind' : ''}`);
    if (!hasTailwind) warn('components.json exists but Tailwind is not a dependency — Motion UI classes will not resolve.');
  } else if (NO_INIT) {
    warn('no components.json and --no-init given. Run: npx shadcn@latest init');
  } else if (CHECK) {
    warn(`no components.json — would ${hasTailwind ? '' : 'install Tailwind v4 + path alias, then '}run \`npx shadcn@latest init\``);
  } else {
    log('+ preparing the shadcn token layer — Motion UI is pure shadcn-semantic Tailwind;');
    log('  without --background/--foreground/--primary/--card/--radius every installed');
    log('  section renders unstyled.');
    // `shadcn init` does NOT install Tailwind for Vite — it bails with "No Tailwind CSS
    // configuration found" and then "Could not find valid path aliases". Prepare both first.
    if (!hasTailwind) bootstrapTailwind(pm);
    // -b base → Base UI, the same headless layer Motion UI's own components use.
    // -p nova → the default preset; without BOTH flags the CLI stops on an interactive
    // prompt and exits 0 having written nothing.
    // NOT --defaults: that forces --template=next and corrupts a Vite project.
    const r = run('npx', ['shadcn@latest', 'init', '--yes', '--no-monorepo', '-b', 'base', '-p', 'nova', '--css-variables'], { stdio: 'inherit' });
    // The CLI can exit 0 after failing its preflight — trust the artefact, not the status.
    if (existsSync(componentsJsonPath)) did('shadcn initialised (components.json)');
    else {
      warn(`\`shadcn init\` did not produce components.json (exit ${r.status}). Run it manually:`);
      log('    npx shadcn@latest init --yes --no-monorepo -b base');
    }
  }

  // 6. the @motion registry entry
  const cj = readJson(componentsJsonPath);
  if (!cj) {
    if (existsSync(componentsJsonPath)) warn('components.json is not valid JSON — fix it, then re-run.');
    else skip('@motion registry: needs components.json first');
  } else if (cj.registries?.['@motion']?.url === UI_REGISTRY) {
    ok('@motion registry configured in components.json');
  } else if (CHECK) {
    warn('components.json has no @motion registry (would add)');
  } else {
    cj.registries = { ...cj.registries, '@motion': { url: UI_REGISTRY, headers: { Authorization: 'Bearer ${MOTION_TOKEN}' } } };
    writeFileSync(componentsJsonPath, JSON.stringify(cj, null, 2) + '\n');
    did('components.json → registries["@motion"] (token as ${MOTION_TOKEN}, never the value)');
  }

  // 7. .npmrc for the @motionplus scope
  const npmrcPath = join(CWD, '.npmrc');
  const npmrc = existsSync(npmrcPath) ? readFileSync(npmrcPath, 'utf8') : '';
  const NPMRC_LINES = [`@motionplus:registry=${NPM_REGISTRY}`, `//api.motion.dev/npm/:_authToken=\${MOTION_TOKEN}`];
  if (NPMRC_LINES.every((l) => npmrc.includes(l))) {
    ok('.npmrc wired for the @motionplus scope');
  } else if (CHECK) {
    warn('.npmrc missing the @motionplus scope (would add 2 lines)');
  } else {
    const body = (npmrc && !npmrc.endsWith('\n') ? npmrc + '\n' : npmrc) +
      NPMRC_LINES.filter((l) => !npmrc.includes(l)).join('\n') + '\n';
    writeFileSync(npmrcPath, body);
    did('.npmrc → @motionplus scope (safe to commit: references ${MOTION_TOKEN}, not the value)');
  }
  if (pm.name === 'pnpm') {
    warn('pnpm 11+ refuses to expand ${MOTION_TOKEN} in a project .npmrc. Before installing, run:');
    log('    pnpm config set "//api.motion.dev/npm/:_authToken" "$MOTION_TOKEN"');
  }
  if (pm.name === 'yarn') {
    const berry = existsSync(join(CWD, '.yarnrc.yml'));
    warn(berry
      ? 'Yarn Berry: put the scope in .yarnrc.yml (npmScopes.motionplus) — see references/motion-ui-setup.md'
      : 'Yarn 1 ignores the scoped-registry line in .npmrc — add a .yarnrc alongside it (see references/motion-ui-setup.md)');
  }

  // 8. motion.theme.ts — install once, never again
  const themePath = join(CWD, 'motion.theme.ts');
  if (existsSync(themePath)) {
    ok('motion.theme.ts present — do NOT re-run `add @motion/motion-theme` (it overwrites)');
  } else if (!cj || !token) {
    skip('motion.theme.ts: needs components.json + token');
  } else if (CHECK) {
    warn('motion.theme.ts missing (would run `npx shadcn@latest add @motion/motion-theme`)');
  } else {
    const r = run('npx', ['shadcn@latest', 'add', '@motion/motion-theme'],
      { stdio: 'inherit', env: { ...process.env, MOTION_TOKEN: token } });
    if (r.status === 0) did('motion.theme.ts + components/motion-ui/ui-theme (snap/ui/gentle/lively/ambient)');
    else warn('theme install failed — check the token and the @motion registry entry.');
  }

  // 9. provider mounted?
  if (existsSync(themePath) || !CHECK) {
    // Exclude components/motion-ui/** — that tree DEFINES MotionUIThemeProvider, so matching
    // it would report the provider as mounted in every freshly-installed project.
    const found = grepSource(CWD, 'MotionUIThemeProvider', 4, (p) => !p.includes('components/motion-ui'));
    if (found) ok(`<MotionUIThemeProvider> mounted (${found})`);
    else warn('<MotionUIThemeProvider> not found — mount it ONCE at the app root, otherwise every section falls back to the built-in defaults:\n' +
      '    import { MotionUIThemeProvider } from "@/components/motion-ui/ui-theme"\n' +
      '    import motionTheme from "@/motion.theme"\n' +
      '    <MotionUIThemeProvider theme={motionTheme}>{children}</MotionUIThemeProvider>');
  }
}

log(`\n${changed} change(s), ${warned} warning(s).${CHECK ? '  (check mode — nothing modified)' : ''}`);
process.exit(0);

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Install and wire Tailwind v4 so `shadcn init` has something to validate.
 * Handles the Vite + TS layout (the common fresh-project case); for anything else it
 * installs the packages and prints what to wire by hand.
 */
function bootstrapTailwind(pm) {
  const viteConfig = ['vite.config.ts', 'vite.config.js'].map((f) => join(CWD, f)).find(existsSync);
  const isVite = !!viteConfig;
  const pkgs = isVite ? ['tailwindcss', '@tailwindcss/vite'] : ['tailwindcss'];
  log(`+ ${pm.name} ${pm.add(pkgs.join(' ')).join(' ')}`);
  if (run(pm.name, [...pm.add(pkgs[0]).slice(0, -1), ...pkgs], { stdio: 'inherit' }).status !== 0) {
    warn('Tailwind install failed — install it manually (https://tailwindcss.com/docs/installation/using-vite).');
    return;
  }
  changed++;

  // The Tailwind entry: `@import "tailwindcss";` at the top of the app's CSS.
  const cssPath = ['src/index.css', 'src/App.css', 'src/styles/globals.css', 'app/globals.css']
    .map((f) => join(CWD, f)).find(existsSync);
  if (cssPath) {
    const css = readFileSync(cssPath, 'utf8');
    if (!css.includes('@import "tailwindcss"')) {
      writeFileSync(cssPath, '@import "tailwindcss";\n\n' + css);
      did(`${cssPath.replace(CWD + '/', '')} → @import "tailwindcss"`);
    }
  } else warn('no CSS entry found — add `@import "tailwindcss";` to your global stylesheet.');

  if (!isVite) {
    warn('not a Vite project — wire the Tailwind plugin and the `@/*` alias by hand, then re-run.');
    return;
  }

  // vite.config: the Tailwind plugin + the `@` alias shadcn validates.
  let vc = readFileSync(viteConfig, 'utf8');
  if (!vc.includes('@tailwindcss/vite')) {
    vc = `import tailwindcss from '@tailwindcss/vite'\n` + vc;
    vc = vc.replace(/plugins:\s*\[/, 'plugins: [tailwindcss(), ');
  }
  if (!vc.includes("'@':") && !vc.includes('"@":')) {
    if (!vc.includes("from 'node:path'") && !vc.includes('from "node:path"')) vc = `import path from 'node:path'\n` + vc;
    vc = vc.replace(/defineConfig\(\{/, "defineConfig({\n  resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } },");
  }
  writeFileSync(viteConfig, vc);
  did(`${viteConfig.replace(CWD + '/', '')} → tailwindcss() + '@' alias`);

  // tsconfig: shadcn reads baseUrl/paths. Vite's template splits these across files,
  // so write to both the root config and the app config when present.
  for (const f of ['tsconfig.json', 'tsconfig.app.json']) {
    const p = join(CWD, f);
    if (!existsSync(p)) continue;
    // tsconfig files legitimately carry comments — patch as text, not via JSON.parse.
    let ts = readFileSync(p, 'utf8');
    if (ts.includes('"paths"')) continue;
    // `paths` only — no `baseUrl`: TS ≥5.4 resolves paths relative to the tsconfig, and
    // baseUrl is deprecated (TS5101 breaks `tsc -b` on TypeScript 6+).
    if (/"compilerOptions"\s*:\s*\{/.test(ts)) {
      ts = ts.replace(/"compilerOptions"\s*:\s*\{/, '"compilerOptions": {\n    "paths": { "@/*": ["./src/*"] },');
    } else {
      ts = ts.replace(/^\{/, '{\n  "compilerOptions": { "paths": { "@/*": ["./src/*"] } },');
    }
    writeFileSync(p, ts);
    did(`${f} → paths "@/*"`);
  }
}

function detectPm(cwd) {
  if (existsSync(join(cwd, 'bun.lockb')) || existsSync(join(cwd, 'bun.lock'))) return { name: 'bun', install: ['install'], add: (p) => ['add', p] };
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return { name: 'pnpm', install: ['install'], add: (p) => ['add', p] };
  if (existsSync(join(cwd, 'yarn.lock'))) return { name: 'yarn', install: [], add: (p) => ['add', p] };
  return { name: 'npm', install: ['install'], add: (p) => ['install', p] };
}

/** Shallow source scan for a symbol; avoids shelling out to grep. `accept` filters by path. */
function grepSource(root, needle, depth = 4, accept = () => true) {
  const SKIPDIR = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.turbo', 'coverage']);
  const EXT = /\.(tsx?|jsx?|mdx)$/;
  const walk = (dir, d) => {
    if (d > depth) return null;
    let entries;
    try { entries = readdirSync(dir); } catch { return null; }
    for (const e of entries) {
      if (SKIPDIR.has(e) || e.startsWith('.')) continue;
      const p = join(dir, e);
      let st; try { st = statSync(p); } catch { continue; }
      if (st.isDirectory()) { const hit = walk(p, d + 1); if (hit) return hit; }
      else if (EXT.test(e) && st.size < 512_000) {
        const rel = p.replace(root + '/', '');
        if (!accept(rel)) continue;
        try { if (readFileSync(p, 'utf8').includes(needle)) return rel; } catch { /* unreadable */ }
      }
    }
    return null;
  };
  return walk(root, 0);
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
