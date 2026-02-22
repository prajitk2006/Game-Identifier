import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.API_URL;

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include auth token
axios.interceptors.request.use(
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

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: (email: string, password: string) =>
    axios.post(`${API_URL}/auth/login`, { email, password }),
  
  register: (data: { name: string; email: string; password: string; userType: string }) =>
    axios.post(`${API_URL}/auth/register`, data),

  // Memberships
  getMembershipPlans: () =>
    axios.get(`${API_URL}/memberships`),
  
  getMembershipPlan: (id: string) =>
    axios.get(`${API_URL}/memberships/${id}`),
  
  purchaseMembership: (planId: string) =>
    axios.post(`${API_URL}/memberships/purchase/${planId}`),
  
  getCurrentMembership: () =>
    axios.get(`${API_URL}/memberships/user/current`),

  // Meal Plans
  getMealPlans: () =>
    axios.get(`${API_URL}/meal-plans`),
  
  getMealPlan: (id: string) =>
    axios.get(`${API_URL}/meal-plans/${id}`),
  
  getAssignedMealPlan: () =>
    axios.get(`${API_URL}/meal-plans/user/assigned`),

  // Orders
  createOrder: (data: any) =>
    axios.post(`${API_URL}/orders`, data),
  
  getMyOrders: () =>
    axios.get(`${API_URL}/orders/my-orders`),
  
  getOrder: (id: string) =>
    axios.get(`${API_URL}/orders/${id}`),
  
  updateOrderStatus: (id: string, status: string) =>
    axios.put(`${API_URL}/orders/${id}/status`, { status }),
  
  cancelOrder: (id: string) =>
    axios.put(`${API_URL}/orders/${id}/cancel`),

  // Users
  getProfile: () =>
    axios.get(`${API_URL}/users/me`),
  
  updateProfile: (data: any) =>
    axios.put(`${API_URL}/users/me`, data),
};

