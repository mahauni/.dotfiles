# Setup — replicating on another machine

This directory (`~/.agents/`) is the canonical source. `GLOBAL.md` and each skill under `skills/` are **symlinked** (not copied) into Claude Code and Codex. On a new machine, once this directory's content is present (git/dotfiles/rsync/scp — the transfer method doesn't matter, only that `~/.agents/` exists before the next step), recreate the symlinks.

## 1. Global context (`GLOBAL.md`)

```bash
mkdir -p ~/.claude ~/.codex
ln -s ~/.agents/GLOBAL.md ~/.claude/CLAUDE.md
ln -s ~/.agents/GLOBAL.md ~/.codex/AGENTS.md
```

## 2. Skills (`skills/<name>/SKILL.md`)

Each skill under `~/.agents/skills/` needs a symlink in `~/.claude/skills/` **and** in `~/.codex/skills/`.

For one specific skill:

```bash
mkdir -p ~/.claude/skills ~/.codex/skills
ln -s ~/.agents/skills/playwright-mcp ~/.claude/skills/playwright-mcp
ln -s ~/.agents/skills/playwright-mcp ~/.codex/skills/playwright-mcp
```

To link **all** skills at once (idempotent — skips ones that already exist):

```bash
mkdir -p ~/.claude/skills ~/.codex/skills
for dir in ~/.agents/skills/*/; do
  name="$(basename "$dir")"
  [ -e ~/.claude/skills/"$name" ] || ln -s "$dir" ~/.claude/skills/"$name"
  [ -e ~/.codex/skills/"$name" ] || ln -s "$dir" ~/.codex/skills/"$name"
done
```

## 3. Verify

```bash
ls -la ~/.claude/CLAUDE.md ~/.codex/AGENTS.md
ls -la ~/.claude/skills/ ~/.codex/skills/
head -3 ~/.claude/skills/playwright-mcp/SKILL.md   # should show the frontmatter
```

## When adding a new skill

Always create it under `~/.agents/skills/<name>/SKILL.md` (never directly under `~/.claude/skills/` or `~/.codex/skills/`), then run both `ln -s` commands from step 2 — otherwise the skill only reaches one of the two agents.
