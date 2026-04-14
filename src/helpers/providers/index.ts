import { Provider } from './types';
import { CliAgentProvider } from './cli-agent';

export type { Provider, DataReader } from './types';

export function createProvider(config: {
  PROVIDER: string;
  MODEL: string;
}): Provider {
  return new CliAgentProvider(config.PROVIDER, config.MODEL);
}
