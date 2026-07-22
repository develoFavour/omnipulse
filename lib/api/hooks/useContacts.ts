import { useState, useEffect, useCallback } from "react";
import { contactService } from "@/lib/services/contact.service";

export interface Contact {
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

export function useContacts(channelFilter: string = "") {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const payload = await contactService.getContacts(channelFilter || undefined);
      setContacts(Array.isArray(payload) ? payload : []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  }, [channelFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return { contacts, isLoading, error, refetch: fetchContacts };
}
