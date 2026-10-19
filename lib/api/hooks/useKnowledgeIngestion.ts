import { useCallback, useState } from "react";
import useSWR from "swr";
import {
  aiAgentService,
  type AIKnowledgeItem,
  type KnowledgeIngestionJob,
} from "@/lib/services/ai-agent.service";
import { extractErrorMessage } from "@/lib/api/response";

const ACTIVE_INGESTION_STATUSES = new Set(["queued", "processing"]);

export function useKnowledgeIngestionJob(jobId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<KnowledgeIngestionJob>(
    jobId ? `ai_knowledge_ingestion_${jobId}` : null,
    () => aiAgentService.getKnowledgeIngestionJob(jobId!),
    {
      refreshInterval: (job) =>
        job && ACTIVE_INGESTION_STATUSES.has(job.status) ? 2_000 : 0,
      revalidateOnFocus: true,
    }
  );

  return {
    job: data ?? null,
    isLoading,
    isError: !!error,
    refetch: mutate,
  };
}

export function useKnowledgeIngestionActions() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      return await aiAgentService.ingestDocument(file);
    } catch (uploadError) {
      const message = extractErrorMessage(uploadError, "The document could not be uploaded. Please try again.");
      setError(message);
      throw uploadError;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const approveItems = useCallback(async (items: AIKnowledgeItem[]) => {
    setError(null);
    try {
      return await aiAgentService.approveKnowledgeItems(items);
    } catch (approvalError) {
      const message = extractErrorMessage(approvalError, "The reviewed knowledge could not be saved. Please try again.");
      setError(message);
      throw approvalError;
    }
  }, []);

  return { uploadDocument, approveItems, isUploading, error };
}
