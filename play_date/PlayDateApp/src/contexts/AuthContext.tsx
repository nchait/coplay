import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authService, tokenManager } from '../services/api';
import { mapApiUserToUser, mapRegisterDataToApi } from '../services/userMapper';
import { NetworkDebug } from '../utils/networkDebug';

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'INITIAL_LOAD_COMPLETE' };

// Auth Context Type
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;
}

// Register Data Type
interface RegisterData {
  email: string;
  password: string;
  name: string;
  age: number;
  bio?: string;
  city?: string;
  interests?: string[];
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true for initial auth check
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false, // Don't show loading screen after logout
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'INITIAL_LOAD_COMPLETE':
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('AuthContext: Checking for stored token...');

      // Check if we have a stored token
      const token = await tokenManager.getToken();

      if (!token) {
        // No token found, complete initial load and show auth screens
        console.log('AuthContext: No stored token found, showing auth screens');
        dispatch({ type: 'INITIAL_LOAD_COMPLETE' });
        return;
      }

      console.log('AuthContext: Found stored token, validating with server...');

      // We have a token, validate it with the backend
      const response = await authService.getCurrentUser();

      console.log('AuthContext: Server response:', response);

      if (response.data?.user) {
        // Token is valid, log the user in
        console.log('AuthContext: Token is valid, logging user in automatically');
        const user = mapApiUserToUser(response.data.user);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        // Token is invalid, remove it and show auth screens
        console.log('AuthContext: Token validation failed, removing stored token');
        console.log('AuthContext: Response error:', response.error);
        await tokenManager.removeToken();
        dispatch({ type: 'INITIAL_LOAD_COMPLETE' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);

      // Check if it's a network error vs authentication error
      if (error instanceof Error && error.message.includes('Network')) {
        // Network error - keep token but show auth screens for now
        // User can try again later
        console.log('Network error during auth check, keeping token');
        dispatch({ type: 'INITIAL_LOAD_COMPLETE' });
      } else {
        // Authentication error - remove invalid token
        console.log('Authentication error, removing stored token');
        await tokenManager.removeToken();
        dispatch({ type: 'INITIAL_LOAD_COMPLETE' });
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Make actual login API call
      const response = await authService.login({ email, password });

      if (response.data?.user && response.data?.access_token) {
        // Convert API user to frontend User type
        const user = mapApiUserToUser(response.data.user);

        // Token is already stored by authService.login
        console.log('AuthContext: Login successful, token stored, user logged in');
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        const errorMessage = response.error || 'Login failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      // Convert frontend data to API format
      const apiUserData = mapRegisterDataToApi(userData);

      // Make actual registration API call
      const response = await authService.register(apiUserData);

      if (response.data?.user && response.data?.access_token) {
        // Convert API user to frontend User type
        const user = mapApiUserToUser(response.data.user);

        // Token is already stored by authService.register
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        const errorMessage = response.error || 'Registration failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out user and clearing stored token');
      // Clear stored token and logout
      await authService.logout();

      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!state.user) {
        throw new Error('No user logged in');
      }

      // Import userService here to avoid circular dependency
      const { userService } = await import('../services/api');
      const { mapUserToApiUser } = await import('../services/userMapper');

      // Convert frontend user data to API format
      const apiUserData = mapUserToApiUser(userData);

      // Call update user API endpoint
      const response = await userService.updateUser(parseInt(state.user.id), apiUserData);

      if (response.data?.user) {
        // Convert API response back to frontend format
        const { mapApiUserToUser } = await import('../services/userMapper');
        const updatedUser = mapApiUserToUser(response.data.user);
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      } else {
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check auth status on app start
  useEffect(() => {
    console.log('AuthProvider: Starting initial auth check...');
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
