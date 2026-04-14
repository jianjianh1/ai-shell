# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Shell is an open-source CLI tool that converts natural language prompts into shell commands using OpenAI's API. Published as `@builder.io/ai-shell` on npm, it provides both `ai` and `ai-shell` as binary commands.

## Common Commands

- **Dev run**: `npm start` (uses jiti for live TypeScript execution)
- **Build**: `npm run build` (pkgroll bundles to `dist/cli.mjs`)
- **Lint check**: `npm run lint` (prettier + eslint)
- **Lint fix**: `npm run lint:fix`
- **Type check**: `npm run typecheck` (tsc, no emit)
- **Node version**: v18.14.0 (see `.nvmrc`, use `nvm i`)

There is no test suite configured.

## Architecture

**ESM-only project** using TypeScript with pkgroll for bundling.

### Entry Point & CLI Flow

`src/cli.ts` → uses **cleye** for arg parsing → routes to commands or main `prompt()` flow.

The main flow (`src/prompt.ts`):
1. Initialize i18n, create provider from config
2. Collect user prompt (CLI arg or interactive)
3. Call provider to generate shell command
4. Present interactive menu: Run, Edit, Revise, Copy, or Cancel
5. Execute chosen script via `execa`

### Provider System

`src/helpers/providers/` abstracts the AI backend behind a `Provider` interface (`types.ts`):
- **`openai.ts`** — OpenAI API provider, delegates to `src/helpers/completion.ts` (streaming SSE, tiktoken token counting)
- **`cli-agent.ts`** — CLI agent provider for local tools (claude, codex, gemini). Spawns the CLI process via `execa`, captures output, extracts commands from markdown code blocks.
- **`index.ts`** — `createProvider(config)` factory selects provider based on `PROVIDER` config

### Key Modules

- **`src/helpers/completion.ts`** — OpenAI API integration with streaming SSE parsing and shell-aware system prompts. Also exports `getFullPrompt`, `getExplanationPrompt`, `getRevisionPrompt` shared by CLI providers.
- **`src/helpers/config.ts`** — INI-format config file at `~/.ai-shell` (keys: `PROVIDER`, `OPENAI_KEY`, `MODEL`, `SILENT_MODE`, `OPENAI_API_ENDPOINT`, `LANGUAGE`). `OPENAI_KEY` is only required when `PROVIDER=openai`.
- **`src/commands/chat.ts`** — Persistent interactive chat mode
- **`src/commands/config.ts`** — Config get/set UI via `@clack/prompts`
- **`src/helpers/i18n.ts`** + `src/locales/` — i18next-based internationalization (16 languages)
- **`src/helpers/os-detect.ts`** — Detects user's shell environment for context-aware command generation

### UI Libraries

- `@clack/prompts` / `@clack/core` for interactive CLI prompts
- `kolorist` for terminal colors
