import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle token refresh for authenticated requests
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/token/') {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post(`${API_BASE}/api/token/refresh/`, {
          refresh: refreshToken
        });

        const { access } = response.data;
        
        // Store new access token
        localStorage.setItem('accessToken', access);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export class AuthAPI {
    static async loginRequest({username, password}) {
      try {
        const response = await api.post('/api/token/', {
          username,
          password,
        });

        // Store tokens in localStorage
        if (response.data.access && response.data.refresh) {
          localStorage.setItem('accessToken', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
        }

        return response.data; // { access, refresh }
      } catch (error) {
        if (error.response) {
          // Handle different error status codes
          switch (error.response.status) {
            case 400:
              throw new Error("Please enter username and password");
            case 401:
              throw new Error("Invalid username or password");
            default:
              throw new Error(error.response.data.detail || "Login failed");
          }
        } else if (error.request) {
          // Network error
          throw new Error("Network error - please check your connection");
        } else {
          // Other errors
          throw new Error("An unexpected error occurred");
        }
      }
    }

    static async logout() {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }

    static async getCurrentUser() {
      try {
        const response = await api.get('/api/user/me/');
        return response.data;
      } catch (error) {
        throw new Error("Failed to get current user");
      }
    }
}



