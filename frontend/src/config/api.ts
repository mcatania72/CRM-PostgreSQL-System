export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:4001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    CHANGE_PASSWORD: '/auth/change-password',
    USERS: '/auth/users',
  },
  
  // Customers
  CUSTOMERS: {
    BASE: '/customers',
    BY_ID: (id: number) => `/customers/${id}`,
    OPPORTUNITIES: (id: number) => `/customers/${id}/opportunities`,
    ACTIVITIES: (id: number) => `/customers/${id}/activities`,
    INTERACTIONS: (id: number) => `/customers/${id}/interactions`,
    SUMMARY: (id: number) => `/customers/${id}/summary`,
  },
  
  // Opportunities
  OPPORTUNITIES: {
    BASE: '/opportunities',
    BY_ID: (id: number) => `/opportunities/${id}`,
    ACTIVITIES: (id: number) => `/opportunities/${id}/activities`,
    CLOSE: (id: number) => `/opportunities/${id}/close`,
    BY_STAGE: (stage: string) => `/opportunities/stage/${stage}`,
    PIPELINE_STATS: '/opportunities/stats/pipeline',
  },
  
  // Activities
  ACTIVITIES: {
    BASE: '/activities',
    BY_ID: (id: number) => `/activities/${id}`,
    COMPLETE: (id: number) => `/activities/${id}/complete`,
    CANCEL: (id: number) => `/activities/${id}/cancel`,
    BY_USER: (userId: number) => `/activities/user/${userId}`,
    DUE_TODAY: '/activities/due/today',
    OVERDUE: '/activities/due/overdue',
  },
  
  // Interactions
  INTERACTIONS: {
    BASE: '/interactions',
    BY_ID: (id: number) => `/interactions/${id}`,
    BY_CUSTOMER: (customerId: number) => `/interactions/customer/${customerId}`,
    BY_USER: (userId: number) => `/interactions/user/${userId}`,
    RECENT: (days: number) => `/interactions/recent/${days}`,
    STATS: '/interactions/stats/summary',
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    METRICS: '/dashboard/metrics',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
    PIPELINE: '/dashboard/pipeline',
    PERFORMANCE: '/dashboard/performance',
    CHARTS: {
      REVENUE: '/dashboard/charts/revenue',
      PIPELINE: '/dashboard/charts/pipeline',
      ACTIVITIES: '/dashboard/charts/activities',
    },
  },
  
  // Health
  HEALTH: '/health',
} as const;