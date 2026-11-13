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
    SCHEDULED: '/broadcast/scheduled',
    TEMPLATES: '/templates',
    AUDIENCE: '/audience',
    CONNECTIONS: '/connections',
    ACTIVITY: '/activity',
    ANALYTICS: '/analytics',
    TEAM: '/team',
    INBOX: '/inbox',
    AI_ASSISTANT: '/ai-assistant',
    SETTINGS: '/settings',
  },

  // Platform Admin (allowlisted identities only)
  ADMIN: {
    BASE: '/admin',
    GROWTH: '/admin/growth',
    REVENUE: '/admin/revenue',
    HEALTH: '/admin/health',
    WORKSPACES: '/admin/workspaces',
    WORKSPACE: (id: string) => `/admin/workspaces/${id}`,
  },

  // Public/Marketing
  HOME: '/',
} as const;
