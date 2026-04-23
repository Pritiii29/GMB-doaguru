import axios from 'axios';

const API_URL = `http://${window.location.hostname}:5000/api`;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const reviewService = {
  submitReview: async (reviewData) => {
    try {
      const response = await api.post('/review', reviewData);
      return response.data;
    } catch (error) {
      console.error("API error during submitReview:", error);
      throw error.response?.data || error;
    }
  },

  getAllReviews: async (clientId, dateRange, startDate, endDate, page = 1, limit = 10) => {
    try {
      const params = {};
      if (clientId && clientId !== 'all') params.clientId = clientId;
      if (dateRange) params.dateRange = dateRange;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (page) params.page = page;
      if (limit) params.limit = limit;

      const response = await api.get('/review/all', { params });
      return response.data;
    } catch (error) {
      console.error("API error during getAllReviews:", error);
      throw error.response?.data || error;
    }
  }
};

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      return response.data;
    } catch (error) {
      console.error("Auth error during login:", error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/login/logout');
      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error.response?.data || error;
    }
  },

  verifyAuth: async () => {
    try {
      const response = await api.get('/login/verify');
      return response.data; // Expected { isAuthenticated: true, user }
    } catch (error) {
      return { isAuthenticated: false };
    }
  },
};

export const qrService = {
  generateQRCode: async () => {
    try {
      const response = await api.get('/qr/generate');
      return response.data;
    } catch (error) {
      console.error("API error during generateQRCode:", error);
      throw error.response?.data || error;
    }
  }
};

export const adminService = {
  getClients: async () => {
    try {
      const response = await api.get('/admin/clients');
      return response.data;
    } catch (error) {
      console.error("API error during getClients:", error);
      throw error.response?.data || error;
    }
  },
  createClient: async (clientData) => {
    try {
      const response = await api.post('/admin/clients', clientData);
      return response.data;
    } catch (error) {
       console.error("API error during createClient:", error);
       throw error.response?.data || error;
    }
  },
  updateClient: async (clientId, clientData) => {
    try {
      const response = await api.put(`/admin/clients/${clientId}`, clientData);
      return response.data;
    } catch (error) {
      console.error("API error during updateClient:", error);
      throw error.response?.data || error;
    }
  },
  toggleClientStatus: async (clientId, isActive) => {
    try {
      const response = await api.put(`/admin/clients/${clientId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error("API error during toggleClientStatus:", error);
      throw error.response?.data || error;
    }
  },
  uploadLogo: async (file) => {
    try {
      const formData = new FormData();
      formData.append("logo", file);
      
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data; // expects { url: "/uploads/filename" }
    } catch (error) {
      console.error("API error during uploadLogo:", error);
      throw error.response?.data || error;
    }
  },
  getNotifications: async () => {
    try {
      const response = await api.get('/admin/notifications');
      return response.data;
    } catch (error) {
      console.error("API error during getNotifications:", error);
      throw error.response?.data || error;
    }
  },
  markNotificationRead: async (id) => {
    try {
      const response = await api.put(`/admin/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error("API error during markNotificationRead:", error);
      throw error.response?.data || error;
    }
  }
};

export const clientService = {
  getClientReviews: async (type = '', search = '', dateRange = '', startDate = '', endDate = '', page = 1, limit = 10) => {
    try {
      const params = { type, search, page, limit };
      if (dateRange) params.dateRange = dateRange;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/client/reviews', { params });
      return response.data;
    } catch (error) {
      console.error("API error during getClientReviews:", error);
      throw error.response?.data || error;
    }
  },
  getProfile: async () => {
    try {
      const response = await api.get('/client/profile');
      return response.data;
    } catch (error) {
       console.error("API error during getProfile:", error);
       throw error.response?.data || error;
    }
  },
  updateProfile: async (profileData) => {
    try {
       const response = await api.put('/client/profile', profileData);
       return response.data;
    } catch (error) {
       console.error("API error during updateProfile:", error);
       throw error.response?.data || error;
    }
  },
  getNotifications: async () => {
    try {
      const response = await api.get('/client/notifications');
      return response.data;
    } catch (error) {
      console.error("API error during getNotifications:", error);
      throw error.response?.data || error;
    }
  },
  markNotificationRead: async (id) => {
    try {
      const response = await api.put(`/client/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error("API error during markNotificationRead:", error);
      throw error.response?.data || error;
    }
  }
};

export const subscriptionService = {
  getSubscriptionPlans: async () => {
    try {
      const response = await api.get('/subscription/plans');
      return response.data;
    } catch (error) {
      console.error("API error during getSubscriptionPlans:", error);
      throw error.response?.data || error;
    }
  },

  getPlanById: async (planId) => {
    try {
      const response = await api.get(`/subscription/plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error("API error during getPlanById:", error);
      throw error.response?.data || error;
    }
  },

  getActiveClientForSubscription: async (clientId) => {
    try {
      const response = await api.get(`/subscription/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error("API error during getActiveClientForSubscription:", error);
      throw error.response?.data || error;
    }
  },

  getMySubscription: async () => {
    try {
      const response = await api.get('/subscription/my-subscription');
      return response.data;
    } catch (error) {
      console.error("API error during getMySubscription:", error);
      throw error.response?.data || error;
    }
  },

  checkSubscriptionValidity: async () => {
    try {
      const response = await api.get('/subscription/check-validity');
      return response.data;
    } catch (error) {
      console.error("API error during checkSubscriptionValidity:", error);
      throw error.response?.data || error;
    }
  },

  registerSubscription: async (clientId, planId, paymentData = {}) => {
    try {
      const response = await api.post('/subscription/register', {
        clientId,
        planId,
        auto_renew: paymentData.autoRenew ?? true,
        amount_paid: paymentData.amountPaid ?? 0,
        payment_method: paymentData.paymentMethod ?? 'manual',
        transaction_id: paymentData.transactionId ?? null,
        notes: paymentData.notes ?? ''
      });
      return response.data;
    } catch (error) {
      console.error("API error during registerSubscription:", error);
      throw error.response?.data || error;
    }
  },

  getAllSubscriptions: async () => {
    try {
      const response = await api.get('/subscription/admin/all');
      return response.data;
    } catch (error) {
      console.error("API error during getAllSubscriptions:", error);
      throw error.response?.data || error;
    }
  },

  getSubscriptionStats: async () => {
    try {
      const response = await api.get('/subscription/admin/stats');
      return response.data;
    } catch (error) {
      console.error("API error during getSubscriptionStats:", error);
      throw error.response?.data || error;
    }
  },

  getClientSubscriptionHistory: async (clientId) => {
    try {
      const response = await api.get(`/subscription/admin/history/${clientId}`);
      return response.data;
    } catch (error) {
      console.error("API error during getClientSubscriptionHistory:", error);
      throw error.response?.data || error;
    }
  },

  cancelSubscription: async (subscriptionId) => {
    try {
      const response = await api.put(`/subscription/cancel/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error("API error during cancelSubscription:", error);
      throw error.response?.data || error;
    }
  },

  renewSubscription: async (subscriptionId) => {
    try {
      const response = await api.put(`/subscription/renew/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error("API error during renewSubscription:", error);
      throw error.response?.data || error;
    }
  }
};

export default api;
