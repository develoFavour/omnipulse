/**
 * response.ts
 *
 * Single source of truth for API response types.
 *
 * The Omnipulse backend always returns one of two shapes:
 *
 *  SUCCESS  ->  { success: true,  data: T }
 *  ERROR    ->  { success: false, error: string }
 *
 * Services should import `ApiResponse<T>` / `ApiError` as their generic
 * type argument and call `unwrap()` to safely extract the payload.
 */

// ---- Shape types ------------------------------------------------------------

/** Successful response envelope from the backend */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

/** Error response envelope from the backend */
export interface ApiError {
  success: false;
  error: string;
}

/** Union -- what the wire always returns */
export type ApiEnvelope<T = unknown> = ApiResponse<T> | ApiError;

// ---- Runtime helpers --------------------------------------------------------

/**
 * Extracts the inner `data` from a success envelope.
 * Throws a user-friendly Error when the backend signals failure.
 *
 * @example
 *   const campaigns = unwrap(await apiClient.get<ApiResponse<Campaign[]>>(url));
 */
export function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope.success === false) {
    throw new Error(envelope.error ?? "An unexpected error occurred");
  }
  return envelope.data;
}

/**
 * Safe version of `unwrap` - returns fallback instead of throwing.
 */
export function unwrapOr<T>(envelope: ApiEnvelope<T>, fallback: T): T {
  if (envelope.success === false) return fallback;
  return envelope.data;
}

/**
 * Extracts a human-readable message from an Axios/fetch error,
 * respecting our backend error envelope shape.
 *
 * @example
 *   catch (err) { toast.error(extractErrorMessage(err)) }
 */
export function extractErrorMessage(err: unknown, fallback = "An unexpected error occurred"): string {
  if (!err || typeof err !== "object") return fallback;
  const axiosErr = err as { response?: { data?: Partial<ApiError> & { message?: string } } };
  return (
    axiosErr.response?.data?.error ??
    axiosErr.response?.data?.message ??
    (err as Error).message ??
    fallback
  );
}
