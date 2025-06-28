import { apiClient } from './apiClient';
import { ENDPOINTS } from '../config/api';

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

export interface CustomerFilter {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const customerService = {
  async getAll(filter: CustomerFilter = {}) {
    const params = new URLSearchParams();
    
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`${ENDPOINTS.CUSTOMERS.BASE}?${params}`);
    return response.data;
  },

  async getById(id: number) {
    const response = await apiClient.get(ENDPOINTS.CUSTOMERS.BY_ID(id));
    return response.data;
  },

  async create(customer: Customer) {
    const response = await apiClient.post(ENDPOINTS.CUSTOMERS.BASE, customer);
    return response.data;
  },

  async update(id: number, customer: Partial<Customer>) {
    const response = await apiClient.put(ENDPOINTS.CUSTOMERS.BY_ID(id), customer);
    return response.data;
  },

  async delete(id: number) {
    const response = await apiClient.delete(ENDPOINTS.CUSTOMERS.BY_ID(id));
    return response.data;
  },

  async getOpportunities(id: number) {
    const response = await apiClient.get(ENDPOINTS.CUSTOMERS.OPPORTUNITIES(id));
    return response.data;
  },

  async getActivities(id: number) {
    const response = await apiClient.get(ENDPOINTS.CUSTOMERS.ACTIVITIES(id));
    return response.data;
  },

  async getInteractions(id: number) {
    const response = await apiClient.get(ENDPOINTS.CUSTOMERS.INTERACTIONS(id));
    return response.data;
  },

  async getSummary(id: number) {
    const response = await apiClient.get(ENDPOINTS.CUSTOMERS.SUMMARY(id));
    return response.data;
  }
};