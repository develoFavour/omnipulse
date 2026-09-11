import { apiClient } from "@/lib/api/axios-instance";
import { ENDPOINTS } from "@/lib/constants/endpoint.const";

export interface MediaUploadResponse {
  url: string;
  public_id: string;
}

class MediaService {
  /**
   * Upload an image file to Cloudinary via backend api-gateway
   * Supports JPG, PNG, WebP, GIF up to 10MB
   */
  async uploadImage(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<{
      success: boolean;
      data: MediaUploadResponse;
      message?: string;
    }>(ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  }
}

export const mediaService = new MediaService();
