import dedent from 'dedent';
import { detectShell } from './os-detect';
import i18n from './i18n';

function getShellDetails() {
  return dedent`
      The target shell is ${detectShell()}
  `;
}

function getOperationSystemDetails() {
  const os = require('@nexssp/os/legacy');
  return os.name();
}

const shellDetails = getShellDetails();

const explainScript = dedent`
  Please provide a clear, concise description of the script, using minimal words. Outline the steps in a list format.
`;

const generationDetails = dedent`
    Only reply with the single line command surrounded by three backticks. It must be able to be directly run in the target shell. Do not include any other text.

    Make sure the command runs on ${getOperationSystemDetails()} operating system.
  `;

export function getFullPrompt(prompt: string) {
  return dedent`
    Create a single line command that one can enter in a terminal and run, based on what is specified in the prompt.

    ${shellDetails}

    ${generationDetails}

    The prompt is: ${prompt}
  `;
}

export function getExplanationPrompt(script: string) {
  return dedent`
    ${explainScript} Please reply in ${i18n.getCurrentLanguagenName()}

    The script: ${script}
  `;
}

export function getRevisionPrompt(prompt: string, code: string) {
  return dedent`
    Update the following script based on what is asked in the following prompt.

    The script: ${code}

    The prompt: ${prompt}

    ${generationDetails}
  `;
}
