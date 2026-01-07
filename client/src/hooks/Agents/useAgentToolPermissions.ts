import { useMemo } from 'react';
import { Tools, EToolResources } from 'librechat-data-provider';
import type { TEphemeralAgent } from 'librechat-data-provider';
import { useGetAgentByIdQuery } from '~/data-provider';
import { useAgentsMapContext } from '~/Providers';
import { isEphemeralAgent } from '~/common';

interface AgentToolPermissionsResult {
  fileSearchAllowedByAgent: boolean;
  codeAllowedByAgent: boolean;
  tools: string[] | undefined;
  provider?: string;
}

/**
 * Hook to determine whether specific tools are allowed for a given agent.
 *
 * @param agentId - The ID of the agent. If null/undefined/empty, checks ephemeralAgent settings
 * @param ephemeralAgent - Optional ephemeral agent settings for tool permissions
 * @returns Object with boolean flags for file_search and execute_code permissions, plus the tools array
 */
export default function useAgentToolPermissions(
  agentId: string | null | undefined,
  ephemeralAgent?: TEphemeralAgent | null,
): AgentToolPermissionsResult {
  const agentsMap = useAgentsMapContext();

  const selectedAgent = useMemo(() => {
    return agentId != null && agentId !== '' ? agentsMap?.[agentId] : undefined;
  }, [agentId, agentsMap]);

  // Only fetch agent data if we don't already have it in the agents map
  // This prevents unnecessary 404 errors for deleted/non-existent agents
  const needsAgentFetch = useMemo(() => {
    if (!agentId || isEphemeralAgent(agentId)) {
      return false;
    }
    // If agent exists in map with provider info, no need to fetch
    return !selectedAgent?.provider;
  }, [agentId, selectedAgent?.provider]);

  const { data: agentData } = useGetAgentByIdQuery(agentId, {
    enabled: needsAgentFetch,
  });

  const tools = useMemo(
    () =>
      (agentData?.tools as string[] | undefined) || (selectedAgent?.tools as string[] | undefined),
    [agentData?.tools, selectedAgent?.tools],
  );

  const provider = useMemo(
    () => agentData?.provider || selectedAgent?.provider,
    [agentData?.provider, selectedAgent?.provider],
  );

  const fileSearchAllowedByAgent = useMemo(() => {
    // Check ephemeral agent settings
    if (isEphemeralAgent(agentId)) {
      return ephemeralAgent?.[EToolResources.file_search] ?? false;
    }
    // If agentId exists but agent not found, disallow
    if (!selectedAgent) return false;
    // Check if the agent has the file_search tool
    return tools?.includes(Tools.file_search) ?? false;
  }, [agentId, selectedAgent, tools, ephemeralAgent]);

  const codeAllowedByAgent = useMemo(() => {
    // Check ephemeral agent settings
    if (isEphemeralAgent(agentId)) {
      return ephemeralAgent?.[EToolResources.execute_code] ?? false;
    }
    // If agentId exists but agent not found, disallow
    if (!selectedAgent) return false;
    // Check if the agent has the execute_code tool
    return tools?.includes(Tools.execute_code) ?? false;
  }, [agentId, selectedAgent, tools, ephemeralAgent]);

  return {
    fileSearchAllowedByAgent,
    codeAllowedByAgent,
    provider,
    tools,
  };
}
