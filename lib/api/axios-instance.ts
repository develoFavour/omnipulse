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

// Do not navigate from an API interceptor. Route authentication belongs in
// proxy.ts, where redirects happen before protected pages render. Navigating
// here can discard one-time OAuth query parameters and creates sign-in flashes
// when the Clerk token is still being initialized.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
