// lib/constants/routes.const.ts

export const APP_ROUTES = {
  // Auth routes
  AUTH: {
    GET_STARTED: '/get-started',
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
  },
  
  // Onboarding wizard
  ONBOARDING: {
    BRAND: '/onboarding/brand',
    CHANNELS: '/onboarding/channels',
    WELCOME: '/onboarding/welcome',
  },

  // Main Dashboard modules
  DASHBOARD: {
    BASE: '/dashboard',
    BROADCAST: '/broadcast',
    AUDIENCE: '/audience',
    CONNECTIONS: '/connections',
    ACTIVITY: '/activity',
  },

  // Public/Marketing
  HOME: '/',
} as const;
