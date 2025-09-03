import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

// Auth Context Type
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Register Data Type
interface RegisterData {
  email: string;
  password: string;
  name: string;
  age: number;
}

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
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
      dispatch({ type: 'AUTH_START' });
      
      // TODO: Check AsyncStorage for stored token
      // TODO: Validate token with backend
      // For now, we'll just set loading to false
      
      // Simulated check - replace with actual implementation
      const storedUser = null; // await getStoredUser();
      
      if (storedUser) {
        dispatch({ type: 'AUTH_SUCCESS', payload: storedUser });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: 'No stored authentication found' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to check authentication status' });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // TODO: Implement actual login API call
      // const response = await authService.login(email, password);
      
      // Simulated login - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock user data - replace with actual response
      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        age: 25,
        bio: 'Love playing games and meeting new people!',
        photos: [],
        interests: ['gaming', 'music', 'travel'],
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          city: 'New York',
        },
        preferences: {
          ageRange: { min: 22, max: 30 },
          maxDistance: 50,
          interests: ['gaming', 'music'],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // TODO: Store token in AsyncStorage
      // await storeAuthToken(response.token);
      // await storeUserData(response.user);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: mockUser });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // TODO: Implement actual registration API call
      // const response = await authService.register(userData);
      
      // Simulated registration - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock user data - replace with actual response
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        age: userData.age,
        bio: '',
        photos: [],
        interests: [],
        location: {
          latitude: 0,
          longitude: 0,
          city: '',
        },
        preferences: {
          ageRange: { min: 18, max: 35 },
          maxDistance: 25,
          interests: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // TODO: Store token in AsyncStorage
      // await storeAuthToken(response.token);
      // await storeUserData(response.user);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: newUser });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    try {
      // TODO: Call logout API endpoint
      // await authService.logout();
      
      // TODO: Clear stored data
      // await clearAuthToken();
      // await clearUserData();
      
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      // TODO: Call update user API endpoint
      // const updatedUser = await userService.updateUser(userData);
      
      dispatch({ type: 'UPDATE_USER', payload: userData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    updateUser,
    clearError,
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
