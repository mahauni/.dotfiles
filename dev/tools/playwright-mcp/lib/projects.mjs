// Resolução de projeto. Um projeto = uma pasta na raiz com target.json dentro.
// A pasta É o índice: não existe arquivo central de alvos para manter em
// sincronia, então adicionar projeto é criar pasta.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const NOT_PROJECTS = new Set(['lib', 'node_modules', '_urls']);

export function listProjects() {
  return readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !NOT_PROJECTS.has(e.name))
    .filter((e) => existsSync(resolve(ROOT, e.name, 'target.json')))
    .map((e) => e.name)
    .sort();
}

export function isUrl(value) {
  return /^https?:\/\//.test(value);
}

export function loadProject(slug, { port = null } = {}) {
  const dir = resolve(ROOT, slug);
  const configFile = resolve(dir, 'target.json');
  if (!existsSync(configFile)) return null;

  const config = JSON.parse(readFileSync(configFile, 'utf8'));
  return {
    slug,
    dir,
    config,
    baseURL: `http://localhost:${port ?? config.port}`,
    routes: config.routes ?? ['/'],
    authFile: resolve(dir, '.auth.json'),
    shotsDir: resolve(dir, 'shots'),
    e2eDir: resolve(dir, 'e2e'),
  };
}

// Alvo avulso por URL (homologação, produção, painel de terceiro). Não tem
// pasta de projeto: as fotos caem em _urls/<host>/.
export function loadUrlTarget(url) {
  const host = new URL(url).host.replace(/[:.]/g, '-');
  const dir = resolve(ROOT, '_urls', host);
  return {
    slug: host,
    dir,
    config: {},
    baseURL: url.replace(/\/$/, ''),
    routes: ['/'],
    authFile: resolve(dir, '.auth.json'),
    shotsDir: resolve(dir, 'shots'),
    e2eDir: resolve(dir, 'e2e'),
  };
}

export function printProjects(stream = console.log) {
  const projects = listProjects();
  if (!projects.length) {
    stream('nenhum projeto ainda. crie um com: node init.mjs <projeto> --cwd <caminho> --dev "npm run dev" --port 3000');
    return projects;
  }
  stream('projetos:');
  for (const slug of projects) {
    const project = loadProject(slug);
    const auth = existsSync(project.authFile) ? ' [sessão salva]' : '';
    stream(`  ${slug.padEnd(24)} :${project.config.port}  ${project.routes.length} rota(s)${auth}`);
  }
  return projects;
}

// Resolve slug OU url; encerra o processo com a lista se o slug não existir.
export function requireTarget(value, { port = null } = {}) {
  if (isUrl(value)) return loadUrlTarget(value);
  const project = loadProject(value, { port });
  if (!project) {
    console.error(`projeto "${value}" não existe.\n`);
    printProjects(console.error);
    process.exit(1);
  }
  return project;
}
