---
name: playwright-mcp
description: Screenshot any local or remote web front-end for visual QA and before/after redesign checks, and write ad hoc end-to-end verification scripts for a feature you just implemented — both from a standalone Playwright install that lives outside every repo at ~/dev/tools/playwright-mcp. Use for "screenshot"/"photograph the screen"/"check how it looks"/validate a CSS or layout change, AND for "test this e2e"/"make sure I didn't break anything" on a feature WHEN the target repo has no Playwright/E2E suite of its own — write the check as a new script here instead of adding Playwright as a dependency to that repo. Do NOT use when the target repo already has its own Playwright/E2E setup (extend that instead, in-repo), for component/unit tests, or for React Native/Expo native screens (only their web build, if any).
---

# playwright-mcp — standalone visual QA + E2E tool

Standalone Playwright kept outside every repo, at `~/dev/tools/playwright-mcp`. Its own `README.md` (usage) and `WRITING-CHECKS.md` (authoring a check) are the authoritative detail — read the relevant one before anything beyond the commands below, because the code there evolves and this file doesn't.

## What's where

A **project is a folder with `target.json` in it** — the filesystem is the index, there's no central targets file. Each project folder holds `target.json` (cwd, dev command, port, routes), `.auth.json` (saved session), `shots/`, and `e2e/`. Shared machinery lives in `lib/`; the entry points sit at the root.

Every entry point run with **no arguments lists the projects** (or its usage), and a wrong project/check name prints the valid ones. That's how you discover what exists — don't rely on a list written into this file.

**The root is versioned; project folders are deliberately local-only.** Never offer to commit one, and never treat one as pending work.

## Commands

```
node shot.mjs [project|url] [--label before] [--routes /,/login] [--port N] [--headed]
node login.mjs <project>          # manual login once → <project>/.auth.json
node check.mjs <project> [check]  # no check name = run all; exit 1 on any failure
node mobile-shot.mjs <project>    # Android emulator screen, via adb
node init.mjs <project> ...       # scaffold a new project folder
```

Screenshots land in `<project>/shots/<label>/<route>@{mobile,tablet,desktop}.png`, full page. **Read the PNGs back** — the point is to look at the result, not to assume the change worked. For a redesign, shoot `--label before` *before* touching anything; that's the step people skip and regret.

`node check.mjs <project>` with no check name is the "did I break anything" pass.

## Writing a check — only when explicitly asked

Only when the user asks for it ("test this e2e", "write a playwright check for this", "make sure I didn't break anything with playwright"). **Never on your own initiative** because you finished a feature — finishing doesn't trigger this; the user asking does.

Then, only if the target repo has **no** Playwright/E2E suite of its own. If it has one, the test goes there, in that repo's suite and CI. Component and unit tests always belong in the repo. Adding Playwright *to* a repo that lacks it is a new dependency and a new pattern — in a FinPec repo that's a Gate 2 call: flag it, don't silently install.

```
cp lib/check-template.mjs <project>/e2e/<name>.mjs
node check.mjs <project> <name> --headed
```

**Start from the template, not from memory** — it carries the contract (`meta`, the default export, the helpers the runner injects) and can't fall out of sync with the runner. `WRITING-CHECKS.md` has the rules that keep a check from lying — assert the action's HTTP status, never read the screen once right after the response, clean up what you created, one assertion per call — plus two worked examples. Read it before writing.

## Environment

WSL: headless and headed both work with no extra install; headed opens a window via WSLg. The adb/emulator quirks, the react-native-web shortcut for Expo screens, and fresh-machine setup are all in `README.md`.
