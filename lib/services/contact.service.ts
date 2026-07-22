import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface ContactResponse {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  channel: string;
  routing_value: string;
  source: string;
  status: string;
  created_at: string;
}

class ContactService {
  async getContacts(channelFilter?: string): Promise<ContactResponse[]> {
    const url = channelFilter
      ? `${ENDPOINTS.CONTACTS.BASE}?channel=${channelFilter}`
      : ENDPOINTS.CONTACTS.BASE;
    const response = await apiClient.get<{ success: boolean; data: ContactResponse[] }>(url);
    return response.data?.data || [];
  }
}

export const contactService = new ContactService();
export type { ContactService };
