// Navegador e contexto. Único lugar que fala com o Playwright direto.

import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';

export const BREAKPOINTS = [
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
  { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];

export const DESKTOP = { width: 1440, height: 900 };

export function launch({ headed = false } = {}) {
  return chromium.launch({ headless: !headed });
}

export function newContext(browser, { viewport = DESKTOP, breakpoint = null, authFile = null } = {}) {
  const bp = breakpoint;
  return browser.newContext({
    viewport: bp ? { width: bp.width, height: bp.height } : viewport,
    ...(bp ? { deviceScaleFactor: bp.deviceScaleFactor, isMobile: !!bp.isMobile, hasTouch: !!bp.isMobile } : {}),
    ...(authFile && existsSync(authFile) ? { storageState: authFile } : {}),
  });
}
