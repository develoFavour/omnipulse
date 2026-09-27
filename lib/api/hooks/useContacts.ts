import { useState, useEffect, useCallback } from "react";
import { contactService, ContactQueryParams } from "@/lib/services/contact.service";
import { Tag } from "@/lib/services/tag.service";

export interface Contact {
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

export function useContacts(paramsOrChannel?: string | ContactQueryParams) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract individual query primitives to prevent unnecessary re-fetches on object reference changes
  const queryChannel = typeof paramsOrChannel === "string" ? paramsOrChannel : paramsOrChannel?.channel;
  const queryTagId = typeof paramsOrChannel === "object" ? paramsOrChannel?.tagId : undefined;
  const querySearch = typeof paramsOrChannel === "object" ? paramsOrChannel?.search : undefined;
  const querySort = typeof paramsOrChannel === "object" ? paramsOrChannel?.sort : undefined;
  const querySortDir = typeof paramsOrChannel === "object" ? paramsOrChannel?.sortDir : undefined;
  const queryPage = typeof paramsOrChannel === "object" ? paramsOrChannel?.page : undefined;
  const queryPageSize = typeof paramsOrChannel === "object" ? paramsOrChannel?.pageSize : undefined;

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await contactService.getContacts(
        typeof paramsOrChannel === "string"
          ? paramsOrChannel
          : {
              channel: queryChannel,
              tagId: queryTagId,
              search: querySearch,
              sort: querySort,
              sortDir: querySortDir,
              page: queryPage,
              pageSize: queryPageSize,
            }
      );
      setContacts(res.data);
      setTotal(res.total);
      setPage(res.page);
      setPageSize(res.pageSize);
      setTotalPages(res.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  }, [queryChannel, queryTagId, querySearch, querySort, querySortDir, queryPage, queryPageSize]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    total,
    page,
    pageSize,
    totalPages,
    isLoading,
    error,
    refetch: fetchContacts,
  };
}
export type { ContactQueryParams };
