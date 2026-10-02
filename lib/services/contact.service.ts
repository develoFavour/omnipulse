import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";
import type { ApiResponse } from "@/lib/api/response";
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
      if (paramsOrChannel.tagId) searchParams.set("tagId", paramsOrChannel.tagId);
      if (paramsOrChannel.search?.trim()) searchParams.set("search", paramsOrChannel.search.trim());
      if (paramsOrChannel.sort) searchParams.set("sort", paramsOrChannel.sort);
      if (paramsOrChannel.sortDir) searchParams.set("sortDir", paramsOrChannel.sortDir);
      if (paramsOrChannel.page) searchParams.set("page", String(paramsOrChannel.page));
      if (paramsOrChannel.pageSize) searchParams.set("pageSize", String(paramsOrChannel.pageSize));
    } else {
      searchParams.set("pageSize", "500");
    }

    const qs = searchParams.toString();
    const url = qs ? `${ENDPOINTS.CONTACTS.BASE}?${qs}` : ENDPOINTS.CONTACTS.BASE;

    // Interceptor auto-unwraps { success, data } -> response.data is the payload.
    // The payload may be a paginated object or a plain array.
    const response = await apiClient.get<ApiResponse<PaginatedContactsResponse | ContactResponse[]>>(url);
    const payload = response.data as unknown as PaginatedContactsResponse | ContactResponse[];

    if (Array.isArray(payload)) {
      return {
        data: payload,
        total: payload.length,
        page: 1,
        pageSize: payload.length,
        totalPages: 1,
      };
    }

    if (payload && Array.isArray((payload as PaginatedContactsResponse).data)) {
      const p = payload as PaginatedContactsResponse;
      return {
        data: p.data,
        total: p.total ?? p.data.length,
        page: p.page ?? 1,
        pageSize: p.pageSize ?? p.data.length,
        totalPages: p.totalPages ?? 1,
      };
    }

    return { data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 };
  }
}

export const contactService = new ContactService();
export type { ContactService };
