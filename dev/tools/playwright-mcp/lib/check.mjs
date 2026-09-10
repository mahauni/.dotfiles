// Harness dos checks e2e: coleta asserção por asserção, imprime OK/FALHA na
// hora e fecha com contagem + exit code. É o que os scripts de projeto NÃO
// reimplementam.

import { expect } from '@playwright/test';

export function createChecker() {
  const results = [];

  function check(name, condition, detail = '') {
    const ok = !!condition;
    results.push({ name, ok, detail });
    console.log(`  ${ok ? 'OK  ' : 'FALHA'} ${name}${detail ? ' — ' + detail : ''}`);
    return ok;
  }

  // A resposta do POST chega antes do React Query invalidar, refazer o GET e
  // re-renderizar: ler o texto uma vez logo após a resposta é corrida.
  // expect().toContainText faz polling até o timeout, então espera o re-render.
  async function waitForText(locator, text, timeout = 8000) {
    try {
      await expect(locator).toContainText(text, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  async function waitForVisible(locator, timeout = 10_000) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  return { check, waitForText, waitForVisible, results };
}

export function report(runs) {
  const all = runs.flatMap((run) => run.results.map((r) => ({ ...r, check: run.name })));
  const failed = all.filter((r) => !r.ok);

  console.log(`\n${all.length - failed.length}/${all.length} verificações passaram em ${runs.length} check(s).`);
  if (failed.length) {
    console.log('falhas:');
    for (const f of failed) console.log(`  ${f.check} › ${f.name}${f.detail ? ' — ' + f.detail : ''}`);
  }
  return failed.length;
}
