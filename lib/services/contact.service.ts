import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";
import { Tag } from "./tag.service";

export interface ContactResponse {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  channel: string;
  routing_value: string;
  source: string;
  status: string;
  tags?: Tag[];
  created_at: string;
}

class ContactService {
  async getContacts(channelFilter?: string): Promise<ContactResponse[]> {
    const url = channelFilter
      ? `${ENDPOINTS.CONTACTS.BASE}?channel=${channelFilter}`
      : ENDPOINTS.CONTACTS.BASE;
    const response = await apiClient.get<any>(url);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.data || [];
  }
}

export const contactService = new ContactService();
export type { ContactService };
