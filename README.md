# AI Shell

A CLI that converts natural language to shell commands, powered by local CLI agents (claude, codex, gemini).

## Setup

```sh
git clone <this-repo>
cd ai-shell
npm install
npm run build
```

## Configuration

Default provider is `gemini`. Change it with:

```sh
ai config set PROVIDER=codex
```

Or use the interactive config UI:

```sh
ai config
```

### Config keys

| Key | Values | Default |
|-----|--------|---------|
| `PROVIDER` | `claude`, `codex`, `gemini` | `gemini` |
| `MODEL` | any model the CLI supports | (provider default) |
| `SILENT_MODE` | `true`, `false` | `false` |

Set any key with `ai config set KEY=value`, read with `ai config get KEY`.

## Usage

```sh
ai list all log files
```

Output:

```
◇  Your script:
│
│  find . -name "*.log"
│
◇  Explanation:
│
│  1. Searches for all files with the extension ".log" in the current
│     directory and any subdirectories.
│
◆  Run this script?
│  ● ✅ Yes (Lets go!)
│  ○ 📝 Edit
│  ○ 🔁 Revise
│  ○ 📋 Copy
│  ○ ❌ Cancel
└
```

### Silent mode

Skip the explanation:

```sh
ai -s list all log files
```

### Chat mode

```sh
ai chat
```

Interactive conversation — type `exit` or Ctrl+C to quit.

## Development

```sh
npm start          # run from source (jiti)
npm run build      # production build
npm run typecheck   # type check only
```
