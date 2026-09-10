#!/usr/bin/env node
// Fotografa a tela do device/emulador Android via adb. Irmão do shot.mjs.
//
//   node mobile-shot.mjs <projeto> [--label antes] [--serial emulator-5554] [--wait 1500]
//
// Sai em <projeto>/shots/<label>/<projeto>-NN.png
//
// Requer um device visível em `adb devices`. NÃO navega sozinho: fotografa o
// que estiver na tela.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { flag, positionals } from './lib/args.mjs';
import { requireTarget, printProjects } from './lib/projects.mjs';

const exec = promisify(execFile);

const ADB = [
  process.env.ADB_PATH,
  resolve(homedir(), 'Android/Sdk/platform-tools/adb'),
  '/usr/bin/adb',
].find((p) => p && existsSync(p)) || 'adb';

const [slug] = positionals();
if (!slug) {
  printProjects();
  console.log('\nuso: node mobile-shot.mjs <projeto> [--label antes] [--serial emulator-5554] [--wait 1500]');
  process.exit(0);
}

const target = requireTarget(slug);
const label = flag('label', 'shot');
const serial = flag('serial');
const wait = Number(flag('wait', 800));
const device = serial ? ['-s', serial] : [];

async function adb(...args) {
  const { stdout } = await exec(ADB, [...device, ...args], { maxBuffer: 64 * 1024 * 1024, encoding: 'buffer' });
  return stdout;
}

const devices = (await exec(ADB, ['devices'])).stdout
  .split('\n').slice(1).filter((line) => line.trim() && !line.startsWith('*'));
if (!devices.length) {
  console.error('nenhum device em `adb devices`.');
  console.error('emulador:  ~/Android/Sdk/emulator/emulator -avd pixel6_api35 -no-window &');
  console.error('(precisa do grupo kvm: sudo usermod -aG kvm $USER, e reabrir o WSL)');
  process.exit(1);
}
console.log('device:', devices[0].trim());

const booted = (await adb('shell', 'getprop', 'sys.boot_completed')).toString().trim();
if (booted !== '1') {
  console.error(`device ainda bootando (sys.boot_completed=${booted || 'vazio'}). espere e tente de novo.`);
  process.exit(1);
}

const outDir = resolve(target.shotsDir, label);
mkdirSync(outDir, { recursive: true });

const existing = readdirSync(outDir).filter((f) => f.endsWith('.png')).length;
const seq = String(existing + 1).padStart(2, '0');
const file = resolve(outDir, `${target.slug}-${seq}.png`);

if (wait) await new Promise((r) => setTimeout(r, wait));
writeFileSync(file, await adb('exec-out', 'screencap', '-p'));

const activity = (await adb('shell', 'dumpsys', 'activity', 'activities'))
  .toString().match(/topResumedActivity=ActivityRecord\{\S+\s+\S+\s+(\S+\/\S+)/)?.[1] ?? '?';

console.log(`\n  ok   ${file}`);
console.log(`  tela: ${activity}`);
