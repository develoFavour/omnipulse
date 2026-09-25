import useSWR from "swr";
import {
  templateService,
  MessageTemplate,
  CreateTemplateInput,
  UpdateTemplateInput,
} from "@/lib/services/template.service";

export function useTemplates(category?: string) {
  const cacheKey = category ? `templates_${category}` : "templates_all";

  const { data, error, isLoading, mutate } = useSWR<MessageTemplate[]>(
    cacheKey,
    () => templateService.listTemplates(category)
  );

  const createTemplate = async (input: CreateTemplateInput) => {
    const created = await templateService.createTemplate(input);
    await mutate();
    return created;
  };

  const updateTemplate = async (id: string, input: UpdateTemplateInput) => {
    const updated = await templateService.updateTemplate(id, input);
    await mutate();
    return updated;
  };

  const deleteTemplate = async (id: string) => {
    await templateService.deleteTemplate(id);
    await mutate();
  };

  return {
    templates: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    refetch: mutate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
