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

export interface ContactQueryParams {
  channel?: string;
  tagId?: string;
  search?: string;
  sort?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedContactsResponse {
  data: ContactResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class ContactService {
  async getContacts(
    paramsOrChannel?: string | ContactQueryParams
  ): Promise<PaginatedContactsResponse> {
    const searchParams = new URLSearchParams();

    if (typeof paramsOrChannel === "string") {
      if (paramsOrChannel && paramsOrChannel !== "all") {
        searchParams.set("channel", paramsOrChannel);
      }
      searchParams.set("pageSize", "500");
    } else if (paramsOrChannel) {
      if (paramsOrChannel.channel && paramsOrChannel.channel !== "all") {
        searchParams.set("channel", paramsOrChannel.channel);
      }
      if (paramsOrChannel.tagId) {
        searchParams.set("tagId", paramsOrChannel.tagId);
      }
      if (paramsOrChannel.search?.trim()) {
        searchParams.set("search", paramsOrChannel.search.trim());
      }
      if (paramsOrChannel.sort) {
        searchParams.set("sort", paramsOrChannel.sort);
      }
      if (paramsOrChannel.sortDir) {
        searchParams.set("sortDir", paramsOrChannel.sortDir);
      }
      if (paramsOrChannel.page) {
        searchParams.set("page", String(paramsOrChannel.page));
      }
      if (paramsOrChannel.pageSize) {
        searchParams.set("pageSize", String(paramsOrChannel.pageSize));
      }
    } else {
      // Default: fetch up to 500 when no params provided (e.g. BroadcastStudio)
      searchParams.set("pageSize", "500");
    }

    const qs = searchParams.toString();
    const url = qs ? `${ENDPOINTS.CONTACTS.BASE}?${qs}` : ENDPOINTS.CONTACTS.BASE;
    const response = await apiClient.get<any>(url);

    const body = response.data;
    // Unwrap JSONEnvelope { success: true, data: ... }
    const envelope = (body && typeof body === "object" && "data" in body) ? body.data : body;

    // Case 1: Backend returned paginated object { data: [...], total: N, page: N, ... }
    if (envelope && typeof envelope === "object" && Array.isArray(envelope.data)) {
      return {
        data: envelope.data,
        total: envelope.total ?? envelope.data.length,
        page: envelope.page ?? 1,
        pageSize: envelope.pageSize ?? envelope.data.length,
        totalPages: envelope.totalPages ?? 1,
      };
    }

    // Case 2: Backend returned array directly inside envelope { success: true, data: [ ... ] }
    if (Array.isArray(envelope)) {
      return {
        data: envelope,
        total: envelope.length,
        page: 1,
        pageSize: envelope.length,
        totalPages: 1,
      };
    }

    // Case 3: Raw array response
    if (Array.isArray(body)) {
      return {
        data: body,
        total: body.length,
        page: 1,
        pageSize: body.length,
        totalPages: 1,
      };
    }

    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: 50,
      totalPages: 0,
    };
  }
}

export const contactService = new ContactService();
export type { ContactService };
