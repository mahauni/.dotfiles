#!/usr/bin/env node
// Abre um navegador visível, você loga na mão, e a sessão fica salva em
// <projeto>/.auth.json para o shot.mjs e os checks reusarem.
//
//   node login.mjs <projeto|url> [--port 3001]
//
// Rode de novo quando a sessão expirar.

import { mkdirSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { flag, positionals } from './lib/args.mjs';
import { requireTarget, printProjects } from './lib/projects.mjs';
import { launch, newContext } from './lib/browser.mjs';

const [slug] = positionals();
if (!slug) {
  printProjects();
  console.log('\nuso: node login.mjs <projeto|url> [--port 3001]');
  process.exit(0);
}

const target = requireTarget(slug, { port: flag('port') });
mkdirSync(target.dir, { recursive: true });

const browser = await launch({ headed: true });
const context = await newContext(browser);
const page = await context.newPage();
await page.goto(target.baseURL);

console.log(`\nnavegador aberto em ${target.baseURL}`);
console.log('faça o login na janela. quando estiver dentro, volte aqui e aperte ENTER.');

const rl = createInterface({ input: process.stdin, output: process.stdout });
await rl.question('');
rl.close();

await context.storageState({ path: target.authFile });
await browser.close();

console.log(`\nsessão salva em ${target.authFile}`);
console.log(`agora: node shot.mjs ${target.slug}   ·   node check.mjs ${target.slug}`);
