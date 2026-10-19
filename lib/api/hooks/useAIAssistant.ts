import { useCallback, useState } from "react";
import useSWR from "swr";
import { aiAgentService, type AIAgentConfig } from "@/lib/services/ai-agent.service";

const CONFIG_KEY = "ai_agent_config";

export function useAIAssistantConfig() {
  const { data, error, isLoading, mutate } = useSWR<AIAgentConfig>(
    CONFIG_KEY,
    () => aiAgentService.getConfig(),
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleEnabled = useCallback(async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      const result = await aiAgentService.toggleEnabled(enabled);
      await mutate(result.config, { revalidate: false });
      return result.config;
    } finally {
      setIsUpdating(false);
    }
  }, [mutate]);

  return {
    config: data,
    error,
    isLoading,
    isUpdating,
    toggleEnabled,
    refetch: mutate,
  };
}
