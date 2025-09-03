import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// For React Native development with Docker backend
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'http://localhost:5000'; // Production URL would go here
  }

  // Development environment with Docker
  if (Platform.OS === 'android') {
    // Android emulator: 10.0.2.2 maps to host machine's localhost
    return 'http://10.0.2.2:5000';
  } else if (Platform.OS === 'ios') {
    // iOS simulator: localhost works directly
    return 'http://localhost:5000';
  } else {
    // Web or other platforms
    return 'http://localhost:5000';
  }
};

const API_BASE_URL = getApiBaseUrl();
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

      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      if (token) {
        console.log(`API Request: Using token: ${token.substring(0, 20)}...`);
      } else {
        console.log('API Request: No token available');
      }

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
        timeout: 10000, // 10 second timeout
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      const data = await response.json();
      console.log('API Response Data:', data);

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401 && token) {
          console.log('API: Token expired or invalid, removing stored token');
          await tokenManager.removeToken();
          return {
            error: 'Session expired. Please log in again.',
          };
        }

        const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`;
        console.log('API Error:', errorMessage);
        return {
          error: errorMessage,
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);

      let errorMessage = 'Network request failed';

      if (error instanceof Error) {
        if (error.message.includes('Network request failed')) {
          errorMessage = `Cannot connect to server at ${url}. Make sure your server is running.`;
        } else if (error.message.includes('timeout')) {
          errorMessage = `Request timeout. Server at ${url} is not responding.`;
        } else {
          errorMessage = error.message;
        }
      }

      return {
        error: errorMessage,
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
