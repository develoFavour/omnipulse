import type { AxiosError } from "axios";

/** HTTP status of a failed request, when one is available. */
export function apiStatus(error: unknown): number | undefined {
  return (error as AxiosError | undefined)?.response?.status;
}

/** Backend `error` message for a failed request, falling back when absent. */
export function apiMessage(error: unknown, fallback: string): string {
  const data = (error as AxiosError<{ error?: string }> | undefined)?.response?.data;
  return data?.error?.trim() || fallback;
}
