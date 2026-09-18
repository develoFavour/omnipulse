import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We expose a utility to inject a dynamic token getter function from React
// This ensures every API call always uses the freshest Clerk token, preventing expiration errors
let tokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (getter: () => Promise<string | null>) => {
  tokenGetter = getter;
};

export const getAuthToken = async (): Promise<string | null> => {
  if (tokenGetter) {
    return tokenGetter();
  }
  return null;
};

// Add a request interceptor to lazily inject the freshest token before every request
apiClient.interceptors.request.use(
  async (config) => {
    // If tokenGetter has not yet mounted (during early page hydration), wait up to 2s
    if (!tokenGetter) {
      for (let i = 0; i < 20; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (tokenGetter) break;
      }
    }

    if (tokenGetter) {
      let token = await tokenGetter();
      // If token is null, Clerk might still be initializing session. Retry briefly.
      if (!token) {
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          token = await tokenGetter();
          if (token) break;
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// If a request encounters a 401 (e.g. token expired or momentary auth desync),
// attempt a one-time retry with a freshly obtained token before failing.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      tokenGetter
    ) {
      originalRequest._retry = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const freshToken = await tokenGetter();
        if (freshToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${freshToken}`;
          return apiClient(originalRequest);
        }
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }
    return Promise.reject(error);
  }
);
