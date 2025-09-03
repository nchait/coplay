import { User } from '../types';
import { AuthResponse } from './api';

/**
 * Maps API user response to frontend User type
 */
export const mapApiUserToUser = (apiUser: AuthResponse['user']): User => {
  return {
    id: apiUser.id.toString(), // Convert number to string for frontend
    email: apiUser.email,
    name: apiUser.name,
    age: apiUser.age || 0,
    bio: apiUser.bio || '',
    photos: apiUser.photos || [],
    interests: apiUser.interests || [],
    location: {
      latitude: apiUser.latitude || 0,
      longitude: apiUser.longitude || 0,
      city: apiUser.city || '',
    },
    preferences: {
      ageRange: apiUser.preferences?.ageRange || { min: 18, max: 99 },
      maxDistance: apiUser.preferences?.maxDistance || 50,
      interests: apiUser.preferences?.interests || [],
    },
    createdAt: new Date(apiUser.created_at),
    updatedAt: new Date(apiUser.updated_at),
  };
};

/**
 * Maps frontend User type to API user format for updates
 */
export const mapUserToApiUser = (user: Partial<User>) => {
  return {
    name: user.name,
    email: user.email,
    age: user.age,
    bio: user.bio,
    city: user.location?.city,
    latitude: user.location?.latitude,
    longitude: user.location?.longitude,
    interests: user.interests,
    photos: user.photos,
    preferences: {
      ageRange: user.preferences?.ageRange,
      maxDistance: user.preferences?.maxDistance,
      gameTypes: user.preferences?.interests, // Map interests to gameTypes for API
    },
  };
};

/**
 * Maps registration data from frontend to API format
 */
export const mapRegisterDataToApi = (userData: {
  email: string;
  password: string;
  name: string;
  age: number;
  bio?: string;
  city?: string;
  interests?: string[];
}) => {
  return {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    age: userData.age,
    bio: userData.bio || '',
    city: userData.city,
    interests: userData.interests || [],
    preferences: {
      ageRange: { min: 18, max: 99 },
      maxDistance: 50,
      gameTypes: ['PuzzleConnect', 'GuessAndDraw', 'WordChain'],
    },
  };
};
