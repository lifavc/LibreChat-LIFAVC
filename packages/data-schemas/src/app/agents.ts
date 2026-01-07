import { EModelEndpoint, agentsEndpointSchema } from 'librechat-data-provider';
import type { TCustomConfig, TAgentsEndpoint } from 'librechat-data-provider';

/**
 * Sets up the Agents configuration from the config (`librechat.yaml`) file.
 * If no agents config is defined, uses the provided defaults or parses empty object.
 *
 * @param config - The loaded custom configuration.
 * @param [defaultConfig] - Default configuration from getConfigDefaults.
 * @returns The Agents endpoint configuration.
 */
export function agentsConfigSetup(
  config: Partial<TCustomConfig>,
  defaultConfig?: Partial<TAgentsEndpoint>,
): Partial<TAgentsEndpoint> {
  const agentsConfig = config?.endpoints?.[EModelEndpoint.agents];

  if (!agentsConfig) {
    return defaultConfig || agentsEndpointSchema.parse({});
  }

  const parsedConfig = agentsEndpointSchema.parse(agentsConfig);

  // Explicitly preserve documentSupportedProviders from the raw config
  // This ensures the field is passed through even if the schema hasn't been rebuilt
  const rawDocumentSupportedProviders = (agentsConfig as Record<string, unknown>)
    .documentSupportedProviders as string[] | undefined;

  return {
    ...parsedConfig,
    ...(rawDocumentSupportedProviders && { documentSupportedProviders: rawDocumentSupportedProviders }),
  };
}
