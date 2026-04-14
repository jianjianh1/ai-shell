import fs from 'fs/promises';
import path from 'path';
import os from 'os';
const ini = {
  parse(str: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const line of str.split('\n')) {
      const eq = line.indexOf('=');
      if (eq > 0) result[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
    return result;
  },
  stringify(obj: Record<string, any>): string {
    return (
      Object.entries(obj)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n') + '\n'
    );
  },
};
import { commandName } from './constants';
import { KnownError, handleCliError } from './error';
import * as p from '@clack/prompts';
import { red } from './colors';
import i18n from './i18n';

const { hasOwnProperty } = Object.prototype;
export const hasOwn = (object: unknown, key: PropertyKey) =>
  hasOwnProperty.call(object, key);

const parseAssert = (name: string, condition: any, message: string) => {
  if (!condition) {
    throw new KnownError(
      `${i18n.t('Invalid config property')} ${name}: ${message}`
    );
  }
};

const configParsers = {
  PROVIDER(provider?: string) {
    return provider || 'gemini-api';
  },
  GEMINI_API_KEY(key?: string) {
    return key || '';
  },
  MODEL(model?: string) {
    return model || '';
  },
  SILENT_MODE(mode?: string) {
    if (mode === undefined) return true;
    return String(mode).toLowerCase() === 'true';
  },
} as const;

type ConfigKeys = keyof typeof configParsers;

type RawConfig = {
  [key in ConfigKeys]?: string;
};

type ValidConfig = {
  [Key in ConfigKeys]: ReturnType<(typeof configParsers)[Key]>;
};

const configPath = path.join(os.homedir(), '.ai-shell');

const fileExists = (filePath: string) =>
  fs.lstat(filePath).then(
    () => true,
    () => false
  );

const readConfigFile = async (): Promise<RawConfig> => {
  const configExists = await fileExists(configPath);
  if (!configExists) {
    return Object.create(null);
  }

  const configString = await fs.readFile(configPath, 'utf8');
  return ini.parse(configString);
};

export const getConfig = async (
  cliConfig?: RawConfig
): Promise<ValidConfig> => {
  const config = await readConfigFile();
  const parsedConfig: Record<string, unknown> = {};

  for (const key of Object.keys(configParsers) as ConfigKeys[]) {
    const parser = configParsers[key];
    const value = cliConfig?.[key] ?? config[key];
    parsedConfig[key] = parser(value);
  }

  return parsedConfig as ValidConfig;
};

export const setConfigs = async (keyValues: [key: string, value: string][]) => {
  const config = await readConfigFile();

  for (const [key, value] of keyValues) {
    if (!hasOwn(configParsers, key)) {
      throw new KnownError(`${i18n.t('Invalid config property')}: ${key}`);
    }

    const parsed = configParsers[key as ConfigKeys](value);
    config[key as ConfigKeys] = parsed as any;
  }

  await fs.writeFile(configPath, ini.stringify(config), 'utf8');
};

export const showConfigUI = async () => {
  try {
    const config = await getConfig();
    const choice = (await p.select({
      message: i18n.t('Set config') + ':',
      options: [
        {
          label: i18n.t('Provider'),
          value: 'PROVIDER',
          hint: config.PROVIDER,
        },
        {
          label: i18n.t('Gemini API Key'),
          value: 'GEMINI_API_KEY',
          hint: config.GEMINI_API_KEY
            ? '...' + config.GEMINI_API_KEY.slice(-4)
            : i18n.t('(not set)'),
        },
        {
          label: i18n.t('Model'),
          value: 'MODEL',
          hint: config.MODEL || i18n.t('(default)'),
        },
        {
          label: i18n.t('Silent Mode'),
          value: 'SILENT_MODE',
          hint: hasOwn(config, 'SILENT_MODE')
            ? config.SILENT_MODE.toString()
            : i18n.t('(not set)'),
        },
        {
          label: i18n.t('Cancel'),
          value: 'cancel',
          hint: i18n.t('Exit the program'),
        },
      ],
    })) as ConfigKeys | 'cancel' | symbol;

    if (p.isCancel(choice)) return;

    if (choice === 'PROVIDER') {
      const provider = (await p.select({
        message: i18n.t('Pick a provider'),
        options: [
          { value: 'gemini-api', label: 'Gemini (API)' },
          { value: 'claude', label: 'Claude (CLI)' },
          { value: 'codex', label: 'Codex (CLI)' },
          { value: 'gemini', label: 'Gemini (CLI)' },
        ],
      })) as string;
      if (p.isCancel(provider)) return;
      await setConfigs([['PROVIDER', provider]]);
    } else if (choice === 'GEMINI_API_KEY') {
      const key = await p.text({
        message: i18n.t('Enter your Gemini API key'),
        validate: (value) => {
          if (!value.length) return i18n.t('Please enter a key');
        },
      });
      if (p.isCancel(key)) return;
      await setConfigs([['GEMINI_API_KEY', key]]);
    } else if (choice === 'MODEL') {
      const model = await p.text({
        message: i18n.t('Enter the model name (leave empty for default)'),
        initialValue: config.MODEL,
      });
      if (p.isCancel(model)) return;
      await setConfigs([['MODEL', model as string]]);
    } else if (choice === 'SILENT_MODE') {
      const silentMode = await p.confirm({
        message: i18n.t('Enable silent mode?'),
      });
      if (p.isCancel(silentMode)) return;
      await setConfigs([['SILENT_MODE', silentMode ? 'true' : 'false']]);
    }
    if (choice === 'cancel') return;
    showConfigUI();
  } catch (error: any) {
    console.error(`\n${red('✖')} ${error.message}`);
    handleCliError(error);
    process.exit(1);
  }
};
