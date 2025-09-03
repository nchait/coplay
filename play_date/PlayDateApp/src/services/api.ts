import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// For React Native development, we need to use the actual IP address
// localhost won't work from the mobile simulator/device
const API_BASE_URL = __DEV__
  ? 'http://localhost:5000'  // This will work for web, but needs IP for mobile
  : 'http://localhost:5000'; // Production URL would go here
const TOKEN_KEY = 'auth_token';

// Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  age?: number;
  bio?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  interests?: string[];
  photos?: string[];
  preferences?: {
    ageRange?: { min: number; max: number };
    maxDistance?: number;
    gameTypes?: string[];
  };
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    age?: number;
    bio?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    interests: string[];
    photos: string[];
    preferences: any;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  access_token: string;
  message: string;
}

// Token Management
export const tokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
};

// HTTP Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const token = await tokenManager.getToken();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && token) {
          await tokenManager.removeToken();
          return {
            error: 'Session expired. Please log in again.',
          };
        }

        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network request failed',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// API Client Instance
const apiClient = new ApiClient(API_BASE_URL);

// Auth Service
export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data?.access_token) {
      await tokenManager.setToken(response.data.access_token);
    }
    
    return response;
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    if (response.data?.access_token) {
      await tokenManager.setToken(response.data.access_token);
    }
    
    return response;
  },

  async getCurrentUser(): Promise<ApiResponse<{ user: AuthResponse['user'] }>> {
    return apiClient.get<{ user: AuthResponse['user'] }>('/auth/me');
  },

  async logout(): Promise<void> {
    await tokenManager.removeToken();
  },
};

// User Service
export const userService = {
  async getUsers(): Promise<ApiResponse<{ users: AuthResponse['user'][] }>> {
    return apiClient.get<{ users: AuthResponse['user'][] }>('/users');
  },

  async getUser(id: number): Promise<ApiResponse<{ user: AuthResponse['user'] }>> {
    return apiClient.get<{ user: AuthResponse['user'] }>(`/users/${id}`);
  },

  async updateUser(id: number, userData: Partial<RegisterRequest>): Promise<ApiResponse<{ user: AuthResponse['user'] }>> {
    return apiClient.put<{ user: AuthResponse['user'] }>(`/users/${id}`, userData);
  },

  async deleteUser(id: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },
};

// Health Check
export const healthService = {
  async checkHealth(): Promise<ApiResponse<{ status: string; database: string }>> {
    return apiClient.get<{ status: string; database: string }>('/health');
  },
};

export default apiClient;
