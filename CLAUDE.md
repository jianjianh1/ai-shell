# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Shell is a personal CLI tool that converts natural language prompts into shell commands. Default backend is the Gemini API (direct HTTP), with CLI agent fallbacks for claude, codex, and gemini.

## Common Commands

- **Dev run**: `npm start` (uses jiti for live TypeScript execution)
- **Build**: `npm run build` (pkgroll bundles to `dist/cli.mjs`)
- **Compile**: `npm run compile` (pkgroll + bun compile to `ai-bin` binary)
- **Type check**: `npm run typecheck` (tsc, no emit)
- **Install**: `cp ai-bin /usr/local/bin/ai`

There is no test suite configured.

## Architecture

**ESM-only project** using TypeScript. pkgroll bundles source + most deps into `dist/cli.mjs`. Bun compiles that into a single `ai-bin` binary.

Most dependencies are devDependencies (bundled by pkgroll). Only `execa` and `clipboardy` are runtime deps, both lazy-loaded.

### Entry Point & CLI Flow

`src/cli.ts` → uses **cleye** for arg parsing → routes to commands or main `prompt()` flow.

The main flow (`src/prompt.ts`):
1. Load cached config, create provider
2. If prompt known from args, fire API call immediately (pre-spawn)
3. Show intro + spinner while waiting
4. Present interactive menu: Run, Edit, Revise, Copy, or Cancel
5. Execute chosen script via `execa` (lazy-loaded)

### Provider System

`src/helpers/providers/` abstracts the AI backend behind a `Provider` interface (`types.ts`):
- **`gemini-api.ts`** — Direct HTTP fetch to `generativelanguage.googleapis.com`. Default provider. Uses `gemini-2.5-flash` model. No CLI subprocess overhead.
- **`cli-agent.ts`** — Spawns CLI tools (claude, codex, gemini) via `execa`. Each agent has its own arg format in `CLI_CONFIGS`.
- **`index.ts`** — `createProvider(config)` factory selects provider based on `PROVIDER` config.

### Key Modules

- **`src/helpers/prompts.ts`** — Shell-aware prompt construction (`getFullPrompt`, `getExplanationPrompt`, `getRevisionPrompt`). OS and shell detection deferred to first use.
- **`src/helpers/config.ts`** — Config file at `~/.ai-shell` (keys: `PROVIDER`, `GEMINI_API_KEY`, `MODEL`, `SILENT_MODE`). Inline INI parser, no external dep.
- **`src/helpers/colors.ts`** — ANSI color functions (cyan, dim, red, green). Replaces kolorist.
- **`src/helpers/dedent.ts`** — Tagged template dedent. Replaces dedent package.
- **`src/commands/chat.ts`** — Interactive chat mode
- **`src/commands/config.ts`** — Config get/set UI via `@clack/prompts`
- **`src/helpers/os-detect.ts`** — Detects user's shell environment
