# Global Context (Lucas Raoni)

> This file is read by both Claude Code (`~/.claude/CLAUDE.md`) and Codex (`~/.codex/AGENTS.md`) via symlink.
> It contains only **project-agnostic** preferences. Rules specific to a given repository live in that repo's own local `AGENTS.md`/`CLAUDE.md`.

## Language

- **English:** code (identifiers — classes, functions, vars, enums), chat responses (this conversation), branch names.
- **Portuguese:** `.md` files (project docs, READMEs, architecture docs), commit messages, code comments.
- **Exception: files under `~/.agents/`** (this file, `SETUP.md`, everything in `skills/`) **are in English** — they're agent-config/meta docs, not project docs.
- **A repo's own local `AGENTS.md`/`CLAUDE.md` can override this default for that repo** — when it states its own language rule, that local rule is the one in effect there. This file only sets the default for projects that don't say otherwise.

## Azure DevOps

- **Always try `az` (Azure CLI) with the `azure-devops` extension first** for any Azure DevOps operation (create/query PR, link work item, etc.), rather than going straight to REST+HTTPS.
- Authentication: export the dev's personal PAT as an environment variable before running `az devops`/`az repos` commands:
  ```bash
  export AZURE_DEVOPS_EXT_PAT="$(cat ~/.finpec/finpec-pat)"
  ```
  Never print or log the PAT value.
- **Fallback:** if the `az` command fails for any reason (missing extension, auth error, endpoint not supported by the extension, etc.), fall back to REST+HTTPS via `curl` using the same PAT (`curl -u ":$PAT" ...`). Don't keep retrying `az` — fall back and continue the task.
- This applies to any repository/project, not just the Monitoramento ones.
- **Do not use the Azure DevOps MCP** (`azure-devops`) for anything — even if it appears available/connected in the session. Always use `az` (with the REST+HTTPS fallback above). Only use the MCP if I explicitly ask for it in the conversation.
- The `azure-devops` MCP registration was **removed** from user scope (`claude mcp remove azure-devops -s user`) to avoid connection overhead in every project. The original config with credentials is backed up at `~/.claude/mcp-backups/azure-devops.json` (outside git). If I explicitly ask to reactivate it, restore with:
  ```bash
  claude mcp add-json azure-devops "$(cat ~/.claude/mcp-backups/azure-devops.json)" -s user
  ```

## Tools

- **Visual QA of any local/remote web front-end (screenshot, before/after redesign compare):** standalone Playwright tool at `~/dev/tools/playwright-mcp`, outside all repos. Full usage is the `playwright-mcp` skill (`~/.agents/skills/playwright-mcp/SKILL.md`, symlinked into both `~/.claude/skills/` and `~/.codex/skills/`) — load that skill rather than duplicating its instructions here.

## General preferences

- (to be defined)
