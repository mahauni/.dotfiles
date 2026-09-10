// Parsing de argumentos, compartilhado por todos os entry points.

const argv = process.argv.slice(2);

// Flags sem valor. Sem essa lista, um `--headed` antes de um posicional faria
// positionals() engolir o posicional como se fosse valor do flag.
const BOOLEAN_FLAGS = new Set(['headed', 'keep', 'help', 'all']);

export function flag(name, fallback = null) {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
}

export function hasFlag(name) {
  return argv.includes(`--${name}`);
}

export function positionals() {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      if (!BOOLEAN_FLAGS.has(argv[i].slice(2))) i++;
      continue;
    }
    out.push(argv[i]);
  }
  return out;
}

export function listFlag(name) {
  const raw = (flag(name) || '').trim();
  return raw ? raw.split(',').map((v) => v.trim()).filter(Boolean) : null;
}
