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
    }

    const qs = searchParams.toString();
    const url = qs ? `${ENDPOINTS.CONTACTS.BASE}?${qs}` : ENDPOINTS.CONTACTS.BASE;
    const response = await apiClient.get<any>(url);

    // If backend returns the paginated envelope { data, total, page, pageSize, totalPages }
    if (response.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        total: response.data.total ?? response.data.data.length,
        page: response.data.page ?? 1,
        pageSize: response.data.pageSize ?? response.data.data.length,
        totalPages: response.data.totalPages ?? 1,
      };
    }

    // Direct array fallback
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        total: response.data.length,
        page: 1,
        pageSize: response.data.length,
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
