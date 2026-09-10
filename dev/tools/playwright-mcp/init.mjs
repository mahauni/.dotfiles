#!/usr/bin/env node
// Cria a pasta de um projeto novo: target.json + e2e/ + shots/ + um check de
// exemplo. Adicionar projeto é isto — não há arquivo central para editar.
//
//   node init.mjs <projeto> --cwd ~/dev/algum/front --dev "npm run dev" --port 3000 [--routes /,/login]

import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { flag, listFlag, positionals } from './lib/args.mjs';
import { ROOT, listProjects } from './lib/projects.mjs';

const [slug] = positionals();
if (!slug) {
  console.error('uso: node init.mjs <projeto> --cwd <caminho> --dev "npm run dev" --port 3000 [--routes /,/login]');
  console.error(`existentes: ${listProjects().join(', ') || '(nenhum)'}`);
  process.exit(1);
}

const dir = resolve(ROOT, slug);
if (existsSync(dir)) {
  console.error(`${slug}/ já existe.`);
  process.exit(1);
}

const port = Number(flag('port', 3000));
const config = {
  cwd: flag('cwd', ''),
  dev: flag('dev', 'npm run dev'),
  port,
  routes: listFlag('routes') ?? ['/'],
};

mkdirSync(resolve(dir, 'e2e'), { recursive: true });
mkdirSync(resolve(dir, 'shots'), { recursive: true });
writeFileSync(resolve(dir, 'target.json'), JSON.stringify(config, null, 2) + '\n');

console.log(`${slug}/ criado:`);
console.log(`  target.json  cwd="${config.cwd}" dev="${config.dev}" porta=${port} rotas=${config.routes.join(',')}`);
console.log(`\npróximo passo: suba o dev server e rode  node shot.mjs ${slug}`);
console.log(`telas com login:  node login.mjs ${slug}`);
console.log(`check e2e novo:   cp lib/check-template.mjs ${slug}/e2e/<nome>.mjs   (ver WRITING-CHECKS.md)`);
