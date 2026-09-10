#!/usr/bin/env node
// Fotografa as rotas de um projeto em todos os breakpoints.
//
//   node shot.mjs                                   lista os projetos
//   node shot.mjs <projeto|url> [--label antes] [--routes /,/login] [--port 3001] [--headed]
//
// Sai em <projeto>/shots/<label>/<rota>@<breakpoint>.png, página inteira.
// Se existir <projeto>/.auth.json, é carregado como storageState.

import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { flag, hasFlag, listFlag, positionals } from './lib/args.mjs';
import { requireTarget, printProjects } from './lib/projects.mjs';
import { BREAKPOINTS, launch, newContext } from './lib/browser.mjs';

const [slug] = positionals();
if (!slug) {
  printProjects();
  console.log('\nuso: node shot.mjs <projeto|url> [--label antes] [--routes /,/login] [--port 3001] [--headed]');
  process.exit(0);
}

const target = requireTarget(slug, { port: flag('port') });
const routes = listFlag('routes') ?? target.routes;
const label = flag('label', 'shot');
const hasAuth = existsSync(target.authFile);

const outDir = resolve(target.shotsDir, label);
mkdirSync(outDir, { recursive: true });

const routeSlug = (route) => (route === '/' ? 'home' : route.replace(/^\//, '').replace(/[/?=&]/g, '-'));

const browser = await launch({ headed: hasFlag('headed') });
const done = [];
const failed = [];

for (const breakpoint of BREAKPOINTS) {
  const context = await newContext(browser, { breakpoint, authFile: target.authFile });
  const page = await context.newPage();

  for (const route of routes) {
    const url = `${target.baseURL}${route}`;
    const file = resolve(outDir, `${routeSlug(route)}@${breakpoint.name}.png`);
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
      await page.waitForTimeout(400); // fontes e animação de entrada assentarem
      await page.screenshot({ path: file, fullPage: true });
      done.push(`${file}  (HTTP ${response?.status() ?? '?'})`);
    } catch (err) {
      failed.push(`${url} @${breakpoint.name} -> ${String(err).split('\n')[0]}`);
    }
  }
  await context.close();
}

await browser.close();

console.log(`\nbase: ${target.baseURL}${hasAuth ? '  [autenticado]' : '  [sem login]'}`);
console.log(`saída: ${outDir}\n`);
for (const line of done) console.log('  ok    ' + line);
for (const line of failed) console.log('  FALHA ' + line);
if (failed.length) process.exitCode = 1;
