import useSWR from "swr";
import { tagService, Tag } from "@/lib/services/tag.service";

export function useTags() {
  const { data, error, isLoading, mutate } = useSWR<Tag[]>(
    "audience_tags",
    () => tagService.listTags()
  );

  const createTag = async (name: string, color?: string) => {
    const newTag = await tagService.createTag(name, color);
    await mutate();
    return newTag;
  };

  const deleteTag = async (id: string) => {
    await tagService.deleteTag(id);
    await mutate();
  };

  const tagContact = async (contactId: string, tagId: string) => {
    await tagService.tagContact(contactId, tagId);
    await mutate();
  };

  const untagContact = async (contactId: string, tagId: string) => {
    await tagService.untagContact(contactId, tagId);
    await mutate();
  };

  return {
    tags: data || [],
    isLoading,
    isError: error,
    refetch: mutate,
    createTag,
    deleteTag,
    tagContact,
    untagContact,
  };
}
