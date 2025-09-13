import { GameType } from '../types';

// Root Stack Navigation Types
export type RootStackParamList = {
  Loading: undefined;
  Auth: undefined;
  Main: undefined;
  Profile: { userId?: string };
  Chat: { matchId: string };
};

// Auth Stack Navigation Types
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ProfileSetup: undefined;
};

// Main Tab Navigation Types
export type MainTabParamList = {
  Discover: undefined;
  Matches: undefined;
  Games: undefined;
  Profile: undefined;
};

// Discover Stack Types
export type DiscoverStackParamList = {
  DiscoverHome: undefined;
  UserProfile: { userId: string };
};

// Matches Stack Types
export type MatchesStackParamList = {
  MatchesList: undefined;
  Chat: { matchId: string };
  GameInvite: { matchId: string };
};

// Games Stack Types
export type GamesStackParamList = {
  GamesList: undefined;
  GameLobby: { matchId: string; gameType: GameType };
  GamePlay: { sessionId: string };
  GameResults: { sessionId: string };
};

// Profile Stack Types
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Privacy: undefined;
  Help: undefined;
};
