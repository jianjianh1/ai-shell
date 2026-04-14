# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Shell is a personal CLI tool that converts natural language prompts into shell commands using local CLI agents (claude, codex, gemini).

## Common Commands

- **Dev run**: `npm start` (uses jiti for live TypeScript execution)
- **Build**: `npm run build` (pkgroll bundles to `dist/cli.mjs`)
- **Type check**: `npm run typecheck` (tsc, no emit)
- **Node version**: v18.14.0 (see `.nvmrc`, use `nvm i`)

There is no test suite configured.

## Architecture

**ESM-only project** using TypeScript with pkgroll for bundling.

### Entry Point & CLI Flow

`src/cli.ts` → uses **cleye** for arg parsing → routes to commands or main `prompt()` flow.

The main flow (`src/prompt.ts`):
1. Create provider from config
2. Collect user prompt (CLI arg or interactive)
3. Call provider to generate shell command
4. Present interactive menu: Run, Edit, Revise, Copy, or Cancel
5. Execute chosen script via `execa`

### Provider System

`src/helpers/providers/` abstracts the AI backend behind a `Provider` interface (`types.ts`):
- **`cli-agent.ts`** — Spawns CLI tools (claude, codex, gemini) via `execa`, captures output, extracts commands from markdown code blocks. Each agent has its own arg format defined in `CLI_CONFIGS`.
- **`index.ts`** — `createProvider(config)` factory

### Key Modules

- **`src/helpers/prompts.ts`** — Shell-aware prompt construction (`getFullPrompt`, `getExplanationPrompt`, `getRevisionPrompt`), shared by all providers
- **`src/helpers/config.ts`** — INI-format config file at `~/.ai-shell` (keys: `PROVIDER`, `MODEL`, `SILENT_MODE`)
- **`src/commands/chat.ts`** — Interactive chat mode
- **`src/commands/config.ts`** — Config get/set UI via `@clack/prompts`
- **`src/helpers/os-detect.ts`** — Detects user's shell environment for context-aware command generation

### UI Libraries

- `@clack/prompts` / `@clack/core` for interactive CLI prompts
- `kolorist` for terminal colors
