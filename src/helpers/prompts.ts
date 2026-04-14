import dedent from './dedent';
import { detectShell } from './os-detect';

function getOsName(): string {
  const platform = process.platform;
  const names: Record<string, string> = {
    darwin: 'macOS',
    linux: 'Linux',
    win32: 'Windows',
    freebsd: 'FreeBSD',
  };
  return names[platform] || platform;
}

let _shellDetails: string;
let _generationDetails: string;

function shellDetails() {
  if (!_shellDetails) {
    _shellDetails = `The target shell is ${detectShell()}`;
  }
  return _shellDetails;
}

function generationDetails() {
  if (!_generationDetails) {
    _generationDetails = dedent`
      Only reply with the single line command surrounded by three backticks. It must be able to be directly run in the target shell. Do not include any other text.

      Make sure the command runs on ${getOsName()} operating system.
    `;
  }
  return _generationDetails;
}

export function getFullPrompt(prompt: string) {
  return dedent`
    Create a single line command that one can enter in a terminal and run, based on what is specified in the prompt.

    ${shellDetails()}

    ${generationDetails()}

    The prompt is: ${prompt}
  `;
}

export function getExplanationPrompt(script: string) {
  return dedent`
    Please provide a clear, concise description of the script, using minimal words. Outline the steps in a list format.

    The script: ${script}
  `;
}

export function getRevisionPrompt(prompt: string, code: string) {
  return dedent`
    Update the following script based on what is asked in the following prompt.

    The script: ${code}

    The prompt: ${prompt}

    ${generationDetails()}
  `;
}
