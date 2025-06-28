import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

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

export const dashboardService = {
  async getStats(dateRange?: { startDate?: string; endDate?: string }): Promise<DashboardStats> {
    const params = new URLSearchParams();
    
    if (dateRange?.startDate) {
      params.append('startDate', dateRange.startDate);
    }
    if (dateRange?.endDate) {
      params.append('endDate', dateRange.endDate);
    }
    
    const response = await apiClient.get(`${ENDPOINTS.DASHBOARD.STATS}?${params}`);
    return response.data;
  },

  async getMetrics(dateRange?: { startDate?: string; endDate?: string }): Promise<DashboardMetrics> {
    const params = new URLSearchParams();
    
    if (dateRange?.startDate) {
      params.append('startDate', dateRange.startDate);
    }
    if (dateRange?.endDate) {
      params.append('endDate', dateRange.endDate);
    }
    
    const response = await apiClient.get(`${ENDPOINTS.DASHBOARD.METRICS}?${params}`);
    return response.data;
  },

  async getRecentActivity() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.RECENT_ACTIVITY);
    return response.data;
  },

  async getPipeline() {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.PIPELINE);
    return response.data;
  },

  async getPerformance(dateRange?: { startDate?: string; endDate?: string }) {
    const params = new URLSearchParams();
    
    if (dateRange?.startDate) {
      params.append('startDate', dateRange.startDate);
    }
    if (dateRange?.endDate) {
      params.append('endDate', dateRange.endDate);
    }
    
    const response = await apiClient.get(`${ENDPOINTS.DASHBOARD.PERFORMANCE}?${params}`);
    return response.data;
  }
};