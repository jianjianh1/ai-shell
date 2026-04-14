# AI Shell

A CLI that converts natural language to shell commands, powered by the Gemini API with CLI agent fallbacks (claude, codex, gemini).

## Setup

```sh
git clone <this-repo>
cd ai-shell
npm install
npm run compile
cp ai-bin /usr/local/bin/ai
```

Requires [Bun](https://bun.sh) for the `compile` step (`curl -fsSL https://bun.sh/install | bash`).

## Configuration

Set your Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/apikey)):

```sh
ai config set GEMINI_API_KEY=<your key>
```

Or use the interactive config UI:

```sh
ai config
```

### Config keys

| Key | Values | Default |
|-----|--------|---------|
| `PROVIDER` | `gemini-api`, `claude`, `codex`, `gemini` | `gemini-api` |
| `GEMINI_API_KEY` | your API key | (required for gemini-api) |
| `MODEL` | any model the provider supports | `gemini-2.5-flash` |
| `SILENT_MODE` | `true`, `false` | `true` |

Set any key with `ai config set KEY=value`, read with `ai config get KEY`.

## Usage

```sh
ai list all log files
```

Output (silent mode, default):

```
◇  Your script:
│
│  find . -name "*.log"
│
◆  Run this script?
│  ● ✅ Yes (Lets go!)
│  ○ 📝 Edit
│  ○ 🔁 Revise
│  ○ 📋 Copy
│  ○ ❌ Cancel
└
```

To include an explanation, use `ai config set SILENT_MODE=false`.

### Chat mode

```sh
ai chat
```

Interactive conversation — type `exit` or Ctrl+C to quit.

## Development

```sh
npm start          # run from source (jiti)
npm run build      # bundle to dist/cli.mjs
npm run compile    # bundle + compile to ai-bin binary
npm run typecheck  # type check only
```
