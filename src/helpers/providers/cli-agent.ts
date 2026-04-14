import { execa } from 'execa';
import { Provider, DataReader } from './types';
import {
  getFullPrompt,
  getExplanationPrompt,
  getRevisionPrompt,
} from '../prompts';
import { KnownError } from '../error';

interface CliConfig {
  command: string;
  buildArgs: (prompt: string, model?: string) => string[];
}

const CLI_CONFIGS: Record<string, CliConfig> = {
  claude: {
    command: 'claude',
    buildArgs: (prompt, model?) => {
      const args = ['-p', prompt, '--output-format', 'text'];
      if (model) args.push('--model', model);
      return args;
    },
  },
  codex: {
    command: 'codex',
    buildArgs: (prompt, model?) => {
      const args = ['-q', prompt];
      if (model) args.push('-m', model);
      return args;
    },
  },
  gemini: {
    command: 'gemini',
    buildArgs: (prompt, model?) => {
      const args = [prompt];
      if (model) args.push('--model', model);
      return args;
    },
  },
};

function extractCommand(text: string): string {
  const match = text.match(/```(?:\w*)\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

function makeReader(text: string): DataReader {
  return (writer) => {
    writer(text);
    return Promise.resolve(text);
  };
}

function emptyReader(): DataReader {
  return () => Promise.resolve('');
}

export class CliAgentProvider implements Provider {
  private cliConfig: CliConfig;
  private model?: string;

  constructor(provider: string, model?: string, cliPath?: string) {
    const config = CLI_CONFIGS[provider];
    if (!config) {
      throw new KnownError(
        `Unknown CLI provider: ${provider}. Supported: openai, ${Object.keys(CLI_CONFIGS).join(', ')}`
      );
    }
    this.cliConfig = { ...config };
    if (cliPath) {
      this.cliConfig.command = cliPath;
    }
    this.model = model;
  }

  private async runCli(prompt: string): Promise<string> {
    const args = this.cliConfig.buildArgs(prompt, this.model);
    try {
      const result = await execa(this.cliConfig.command, args);
      return result.stdout;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new KnownError(
          `CLI tool '${this.cliConfig.command}' not found. Make sure it is installed and in your PATH.`
        );
      }
      throw error;
    }
  }

  async getScriptAndInfo(prompt: string) {
    const fullPrompt = getFullPrompt(prompt);
    const output = await this.runCli(fullPrompt);
    const command = extractCommand(output);
    return {
      readScript: makeReader(command),
      readInfo: emptyReader(),
    };
  }

  async getExplanation(script: string) {
    const prompt = getExplanationPrompt(script);
    const output = await this.runCli(prompt);
    return { readExplanation: makeReader(output.trim()) };
  }

  async getRevision(prompt: string, code: string) {
    const fullPrompt = getRevisionPrompt(prompt, code);
    const output = await this.runCli(fullPrompt);
    const command = extractCommand(output);
    return { readScript: makeReader(command) };
  }

  async generateChat(messages: Array<{ role: string; content: string }>) {
    const formatted = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');
    const prompt = `Continue this conversation. Reply to the user's last message.\n\n${formatted}`;
    const output = await this.runCli(prompt);
    return { readResponse: makeReader(output.trim()) };
  }
}
