#!/usr/bin/env node
// Roda os checks e2e de um projeto. O runner é dono do navegador, da sessão,
// do harness e do exit code — o script do projeto só faz as asserções.
//
//   node check.mjs                              lista os projetos
//   node check.mjs <projeto>                    roda TODOS os checks do projeto
//   node check.mjs <projeto> <check>            roda um check só
//   ... [--headed] [--port 3001] [--keep]
//
// Exit code 1 se qualquer verificação falhar.

import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { flag, hasFlag, positionals } from './lib/args.mjs';
import { requireTarget, printProjects } from './lib/projects.mjs';
import { launch, newContext, DESKTOP } from './lib/browser.mjs';
import { createChecker, report } from './lib/check.mjs';

const [slug, wanted] = positionals();
if (!slug) {
  printProjects();
  console.log('\nuso: node check.mjs <projeto> [check] [--headed] [--port 3001] [--keep]');
  process.exit(0);
}

const target = requireTarget(slug, { port: flag('port') });

if (!existsSync(target.e2eDir)) {
  console.error(`${target.slug} não tem pasta e2e/. crie um check a partir de lib/check-template.mjs`);
  process.exit(1);
}

const available = readdirSync(target.e2eDir)
  .filter((f) => f.endsWith('.mjs') && !f.startsWith('_'))
  .map((f) => f.replace(/\.mjs$/, ''))
  .sort();

if (!available.length) {
  console.error(`${target.slug}/e2e/ está vazia. veja WRITING-CHECKS.md`);
  process.exit(1);
}

const selected = wanted ? [wanted.replace(/\.mjs$/, '')] : available;
const unknown = selected.filter((name) => !available.includes(name));
if (unknown.length) {
  console.error(`check "${unknown[0]}" não existe em ${target.slug}/e2e/`);
  console.error(`disponíveis: ${available.join(', ')}`);
  process.exit(1);
}

const browser = await launch({ headed: hasFlag('headed') });
const runs = [];

for (const name of selected) {
  const module = await import(pathToFileURL(resolve(target.e2eDir, `${name}.mjs`)).href);
  const meta = module.meta ?? {};
  const run = module.default;
  const { check, waitForText, waitForVisible, results } = createChecker();
  runs.push({ name, results });

  console.log(`\n▸ ${name}${meta.description ? ` — ${meta.description}` : ''}`);

  if (typeof run !== 'function') {
    check('o check exporta uma função default', false, `${name}.mjs`);
    continue;
  }

  const needsAuth = meta.auth === 'required';
  if (needsAuth && !existsSync(target.authFile)) {
    check('sessão salva disponível', false, `rode: node login.mjs ${target.slug}`);
    continue;
  }

  const context = await newContext(browser, {
    viewport: meta.viewport ?? DESKTOP,
    authFile: meta.auth === 'none' ? null : target.authFile,
  });

  try {
    const page = await context.newPage();
    await run({
      browser, context, page, check, waitForText, waitForVisible,
      baseURL: target.baseURL, project: target, flag, hasFlag,
    });
  } catch (err) {
    check('execução sem exceção não tratada', false, String(err?.message ?? err));
  } finally {
    await context.close();
  }
}

await browser.close();

if (report(runs)) process.exitCode = 1;
