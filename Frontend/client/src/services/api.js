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

  getAllReviews: async () => {
    try {
      const response = await api.get('/review/all');
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
  }
};

export const clientService = {
  getClientReviews: async (type = '', search = '') => {
    try {
      const response = await api.get('/client/reviews', { params: { type, search } });
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
  }
};

export default api;
