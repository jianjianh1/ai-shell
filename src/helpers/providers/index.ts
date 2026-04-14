import { Provider } from './types';
import { CliAgentProvider } from './cli-agent';
import { GeminiApiProvider } from './gemini-api';

export type { Provider, DataReader } from './types';

export function createProvider(config: {
  PROVIDER: string;
  MODEL: string;
  GEMINI_API_KEY: string;
}): Provider {
  if (config.PROVIDER === 'gemini-api') {
    return new GeminiApiProvider(config.GEMINI_API_KEY, config.MODEL);
  }
  return new CliAgentProvider(config.PROVIDER, config.MODEL);
}
