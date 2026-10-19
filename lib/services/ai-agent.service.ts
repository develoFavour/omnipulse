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

  async listKnowledgeItems(): Promise<AIKnowledgeItem[]> {
    const response = await apiClient.get<{ items: AIKnowledgeItem[]; total: number }>(
      ENDPOINTS.AI_AGENT.KNOWLEDGE
    );
    const data = response.data as unknown as { items: AIKnowledgeItem[]; total: number };
    return data.items || [];
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
}

export const aiAgentService = new AIAgentService();
