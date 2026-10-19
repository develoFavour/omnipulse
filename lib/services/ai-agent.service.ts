import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export type AIOperationalMode =
  | "always_on"
  | "after_hours"
  | "idle_fallback"
  | "copilot_only";

export interface AIAgentConfig {
  tenant_id: string;
  is_enabled: boolean;
  provider_available: boolean;
  operational_mode: AIOperationalMode;
  idle_timeout_seconds: number;
  business_name: string;
  business_summary: string;
  tone: string;
  language: string;
  custom_system_prompt: string;
  business_hours_start: string;
  business_hours_end: string;
  timezone: string;
  work_days: number[];
  human_handoff_message: string;
  unsupported_query_message: string;
  confidence_threshold: number;
  created_at?: string;
  updated_at?: string;
}

export interface AIKnowledgeItem {
  id?: string;
  tenant_id?: string;
  category: "faq" | "pricing" | "product" | "policy" | "hours" | string;
  question_or_topic: string;
  answer_or_content: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type KnowledgeIngestionStatus = "queued" | "processing" | "ready" | "failed";

export interface KnowledgeIngestionJob {
  id: string;
  filename: string;
  content_type?: string;
  status: KnowledgeIngestionStatus;
  items?: AIKnowledgeItem[];
  item_count?: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface KnowledgePage {
  items: AIKnowledgeItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface KnowledgeIngestionPage {
  jobs: KnowledgeIngestionJob[];
  total: number;
  limit: number;
  offset: number;
}

export interface KnowledgeIngestionAccepted {
  message: string;
  job_id: string;
  status: "queued";
}

class AIAgentService {
  async getConfig(): Promise<AIAgentConfig> {
    const response = await apiClient.get<AIAgentConfig>(
      ENDPOINTS.AI_AGENT.CONFIG
    );
    return response.data as unknown as AIAgentConfig;
  }

  async saveConfig(config: Partial<AIAgentConfig>): Promise<{ message: string; config: AIAgentConfig }> {
    const response = await apiClient.put<{ message: string; config: AIAgentConfig }>(
      ENDPOINTS.AI_AGENT.CONFIG,
      config
    );
    return response.data as unknown as { message: string; config: AIAgentConfig };
  }

  async toggleEnabled(enabled: boolean): Promise<{ message: string; config: AIAgentConfig }> {
    const response = await apiClient.post<{ message: string; config: AIAgentConfig }>(
      ENDPOINTS.AI_AGENT.TOGGLE,
      { enabled },
    );
    return response.data as unknown as { message: string; config: AIAgentConfig };
  }

  async listKnowledgeItems(params?: { search?: string; category?: string; limit?: number; offset?: number }): Promise<KnowledgePage> {
    const response = await apiClient.get<KnowledgePage>(ENDPOINTS.AI_AGENT.KNOWLEDGE, { params });
    return response.data as unknown as KnowledgePage;
  }

  async createKnowledgeItem(item: Omit<AIKnowledgeItem, "id" | "tenant_id">): Promise<AIKnowledgeItem> {
    const response = await apiClient.post<AIKnowledgeItem>(
      ENDPOINTS.AI_AGENT.KNOWLEDGE,
      item
    );
    return response.data as unknown as AIKnowledgeItem;
  }

  async updateKnowledgeItem(id: string, item: Partial<AIKnowledgeItem>): Promise<AIKnowledgeItem> {
    const response = await apiClient.put<AIKnowledgeItem>(
      ENDPOINTS.AI_AGENT.KNOWLEDGE_BY_ID(id),
      item
    );
    return response.data as unknown as AIKnowledgeItem;
  }

  async deleteKnowledgeItem(id: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.AI_AGENT.KNOWLEDGE_BY_ID(id));
  }

  async ingestDocument(file: File): Promise<KnowledgeIngestionAccepted> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<KnowledgeIngestionAccepted>(
      ENDPOINTS.AI_AGENT.KNOWLEDGE_INGEST,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data as unknown as KnowledgeIngestionAccepted;
  }

  async getKnowledgeIngestionJob(jobId: string): Promise<KnowledgeIngestionJob> {
    const response = await apiClient.get<KnowledgeIngestionJob>(
      ENDPOINTS.AI_AGENT.KNOWLEDGE_INGEST_JOB(jobId)
    );
    return response.data as unknown as KnowledgeIngestionJob;
  }

  async listKnowledgeIngestionJobs(params?: { status?: string; limit?: number; offset?: number }): Promise<KnowledgeIngestionPage> {
    const response = await apiClient.get<KnowledgeIngestionPage>(ENDPOINTS.AI_AGENT.KNOWLEDGE_INGEST_LIST, { params });
    return response.data as unknown as KnowledgeIngestionPage;
  }

  async approveKnowledgeItems(items: AIKnowledgeItem[]): Promise<{ message: string; count: number }> {
    const response = await apiClient.post<{ message: string; count: number }>(
      ENDPOINTS.AI_AGENT.KNOWLEDGE_APPROVE,
      { items }
    );
    return response.data as unknown as { message: string; count: number };
  }
}

export const aiAgentService = new AIAgentService();
