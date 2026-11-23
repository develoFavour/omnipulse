import useSWR from "swr";
import { useCallback } from "react";
import {
  cannedReplyService,
  type CannedReply,
  type CreateCannedReplyPayload,
} from "@/lib/services/canned-reply.service";

export function useCannedReplies() {
  const { data, error, isLoading, mutate } = useSWR<CannedReply[]>(
    "canned_replies",
    () => cannedReplyService.list()
  );

  const create = useCallback(
    async (payload: CreateCannedReplyPayload) => {
      const reply = await cannedReplyService.create(payload);
      await mutate((prev) => [reply, ...(prev ?? [])], false);
      return reply;
    },
    [mutate]
  );

  const update = useCallback(
    async (id: string, payload: CreateCannedReplyPayload) => {
      const reply = await cannedReplyService.update(id, payload);
      await mutate(
        (prev) => (prev ?? []).map((r) => (r.id === id ? reply : r)),
        false
      );
      return reply;
    },
    [mutate]
  );

  const remove = useCallback(
    async (id: string) => {
      await cannedReplyService.delete(id);
      await mutate(
        (prev) => (prev ?? []).filter((r) => r.id !== id),
        false
      );
    },
    [mutate]
  );

  return {
    replies: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: mutate,
    create,
    update,
    remove,
  };
}
