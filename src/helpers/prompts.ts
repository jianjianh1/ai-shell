import { detectShell } from './os-detect';

function getOsName(): string {
  const names: Record<string, string> = {
    darwin: 'macOS',
    linux: 'Linux',
    win32: 'Windows',
    freebsd: 'FreeBSD',
  };
  return names[process.platform] || process.platform;
}

let _systemPrompt: string;

export function getSystemPrompt(): string {
  if (!_systemPrompt) {
    const shell = detectShell();
    const os = getOsName();
    _systemPrompt = [
      `You are a shell command generator for ${shell} on ${os}.`,
      'Output ONLY the command inside a single ```bash code block.',
      'No explanation, no alternatives, no extra text.',
      'Prefer simple, common commands over obscure ones.',
      'The command must be directly runnable in the target shell.',
    ].join('\n');
  }
  return _systemPrompt;
}

export function getFullPrompt(prompt: string): string {
  return prompt;
}

export function getCombinedPrompt(prompt: string): string {
  return `${getSystemPrompt()}\n\n${prompt}`;
}

export function getExplanationPrompt(script: string): string {
  return `Briefly explain this command in a few short bullet points:\n${script}`;
}

export function getRevisionPrompt(prompt: string, code: string): string {
  return `Revise this command: ${code}\n\n${prompt}`;
}

export function getCombinedRevisionPrompt(
  prompt: string,
  code: string
): string {
  return `${getSystemPrompt()}\n\nRevise this command: ${code}\n\n${prompt}`;
}
