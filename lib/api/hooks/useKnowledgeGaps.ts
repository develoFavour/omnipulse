import { useCallback, useState } from "react";
import useSWR from "swr";
import {
  aiAgentService,
  type AIKnowledgeGap,
  type AIKnowledgeGapsPage,
  type ResolveKnowledgeGapPayload,
} from "@/lib/services/ai-agent.service";
import { extractErrorMessage } from "@/lib/api/response";

export function useKnowledgeGaps(status = "pending") {
  const { data, error, isLoading, mutate } = useSWR<AIKnowledgeGapsPage>(
    `ai_knowledge_gaps_${status}`,
    () => aiAgentService.listKnowledgeGaps({ status, limit: 100 }),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return {
    gaps: data?.gaps ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: !!error,
    refetch: mutate,
  };
}

export function useKnowledgeGapActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveGap = useCallback(
    async (gapId: string, payload: ResolveKnowledgeGapPayload) => {
      setIsSubmitting(true);
      setError(null);
      try {
        return await aiAgentService.resolveKnowledgeGap(gapId, payload);
      } catch (err) {
        const msg = extractErrorMessage(err, "Failed to resolve knowledge gap.");
        setError(msg);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const dismissGap = useCallback(async (gapId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      return await aiAgentService.dismissKnowledgeGap(gapId);
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to dismiss knowledge gap.");
      setError(msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    resolveGap,
    dismissGap,
    isSubmitting,
    error,
  };
}

