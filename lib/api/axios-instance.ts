import axios from 'axios';
import { APP_ROUTES } from '@/lib/constants/routes.const';

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

// Add a request interceptor to lazily inject the freshest token before every request
apiClient.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth pages that should never trigger a redirect (prevents infinite loops)
const AUTH_PATHS = [
  APP_ROUTES.AUTH.SIGN_IN,
  APP_ROUTES.AUTH.SIGN_UP,
  APP_ROUTES.AUTH.GET_STARTED,
];

// Add a response interceptor to handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;

      // Only redirect if we are NOT already on an auth page (prevents loops)
      const isOnAuthPage = AUTH_PATHS.some((path) => currentPath.startsWith(path));
      if (!isOnAuthPage) {
        window.location.href = APP_ROUTES.AUTH.SIGN_IN;
      }
    }
    return Promise.reject(error);
  }
);

