import axios from 'axios';

// PostgreSQL version - Backend su porta 4001
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

// Configurazione axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondi timeout
});

// Interceptor per aggiungere token di autenticazione
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire errori di autenticazione
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };

// Tipi TypeScript per PostgreSQL
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id?: number;
  name: string;
  company?: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  status: 'prospect' | 'active' | 'inactive' | 'lost';
  notes?: string;
  estimatedValue?: number;
  website?: string;
  employeeCount?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Opportunity {
  id?: number;
  title: string;
  description?: string;
  value?: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  source?: string;
  competitorAnalysis?: string;
  lossReason?: string;
  tags?: string[];
  customerId: number;
  customer?: Customer;
  createdAt?: string;
  updatedAt?: string;
}

export interface Activity {
  id?: number;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'follow-up';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  result?: string;
  notes?: string;
  tags?: string[];
  customerId: number;
  customer?: Customer;
  opportunityId?: number;
  opportunity?: Opportunity;
  assignedToId?: number;
  assignedTo?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Interaction {
  id?: number;
  type: 'phone' | 'email' | 'meeting' | 'chat' | 'social' | 'website' | 'other';
  direction: 'inbound' | 'outbound';
  subject?: string;
  description: string;
  notes?: string;
  date: string;
  duration?: number;
  channel?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  isImportant: boolean;
  needsFollowUp: boolean;
  followUpDate?: string;
  customerId: number;
  customer?: Customer;
  userId?: number;
  user?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  customers: {
    total: number;
    recent?: number;
  };
  opportunities: {
    total: number;
    totalValue: number;
    wonValue: number;
    recent?: number;
  };
  activities: {
    total: number;
  };
  interactions: {
    total: number;
  };
}

export interface DashboardMetrics {
  conversionRate: number;
  opportunityCounts: {
    total: number;
    won: number;
    lost?: number;
    active?: number;
  };
}

export interface PipelineData {
  stage: string;
  count: number;
  totalValue: number;
  avgProbability?: number;
}

// Servizi API per PostgreSQL
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: Partial<User> & { password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};

export const customerService = {
  getAll: async (params?: any) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (customer: Customer) => {
    const response = await api.post('/customers', customer);
    return response.data;
  },

  update: async (id: number, customer: Partial<Customer>) => {
    const response = await api.put(`/customers/${id}`, customer);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/customers/stats');
    return response.data;
  },
};

export const opportunityService = {
  getAll: async (params?: any) => {
    const response = await api.get('/opportunities', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/opportunities/${id}`);
    return response.data;
  },

  create: async (opportunity: Opportunity) => {
    const response = await api.post('/opportunities', opportunity);
    return response.data;
  },

  update: async (id: number, opportunity: Partial<Opportunity>) => {
    const response = await api.put(`/opportunities/${id}`, opportunity);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/opportunities/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/opportunities/stats');
    return response.data;
  },
};

export const activityService = {
  getAll: async (params?: any) => {
    const response = await api.get('/activities', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/activities/${id}`);
    return response.data;
  },

  create: async (activity: Activity) => {
    const response = await api.post('/activities', activity);
    return response.data;
  },

  update: async (id: number, activity: Partial<Activity>) => {
    const response = await api.put(`/activities/${id}`, activity);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },

  markAsCompleted: async (id: number) => {
    const response = await api.patch(`/activities/${id}/complete`);
    return response.data;
  },
};

export const interactionService = {
  getAll: async (params?: any) => {
    const response = await api.get('/interactions', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/interactions/${id}`);
    return response.data;
  },

  create: async (interaction: Interaction) => {
    const response = await api.post('/interactions', interaction);
    return response.data;
  },

  update: async (id: number, interaction: Partial<Interaction>) => {
    const response = await api.put(`/interactions/${id}`, interaction);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/interactions/${id}`);
    return response.data;
  },
};

export const dashboardService = {
  getStats: async (dateRange?: { startDate?: string; endDate?: string }): Promise<DashboardStats> => {
    const params = new URLSearchParams();
    
    if (dateRange?.startDate) {
      params.append('startDate', dateRange.startDate);
    }
    if (dateRange?.endDate) {
      params.append('endDate', dateRange.endDate);
    }
    
    const response = await api.get(`/dashboard/stats?${params}`);
    return response.data;
  },

  getMetrics: async (dateRange?: { startDate?: string; endDate?: string }): Promise<DashboardMetrics> => {
    const params = new URLSearchParams();
    
    if (dateRange?.startDate) {
      params.append('startDate', dateRange.startDate);
    }
    if (dateRange?.endDate) {
      params.append('endDate', dateRange.endDate);
    }
    
    const response = await api.get(`/dashboard/metrics?${params}`);
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await api.get('/dashboard/recent-activity');
    return response.data;
  },

  getPipeline: async (): Promise<PipelineData[]> => {
    const response = await api.get('/dashboard/pipeline');
    return response.data;
  },
};