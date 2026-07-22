import { apiClient } from './axios-instance';
import { ApiError } from '../types';

export const http = {
  get: async <T>(url: string, params?: any): Promise<T> => {
    try {
      const response = await apiClient.get<T>(url, { params });
      return response.data;
    } catch (error: any) {
      throw formatError(error);
    }
  },

  post: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.post<T>(url, data);
      return response.data;
    } catch (error: any) {
      throw formatError(error);
    }
  },

  patch: async <T>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.patch<T>(url, data);
      return response.data;
    } catch (error: any) {
      throw formatError(error);
    }
  },

  delete: async <T>(url: string): Promise<T> => {
    try {
      const response = await apiClient.delete<T>(url);
      return response.data;
    } catch (error: any) {
      throw formatError(error);
    }
  },
};

function formatError(error: any): ApiError {
  if (error.response) {
    return {
      error: error.response.data?.error || error.message,
      details: error.response.data?.details,
    };
  }
  return { error: error.message };
}
