
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Added password field
  role: UserRole;
  isBanned: boolean;
  coins: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string; // Support for generated images
  timestamp: number;
  mode?: string;
}

export enum AppView {
  AUTH = 'AUTH',
  CHAT = 'CHAT',
  ADMIN_PANEL = 'ADMIN_PANEL',
}

export enum Theme {
  CYBER = 'cyber',
  MATRIX = 'matrix',
  SYNTH = 'synth',
}

export enum AiMode {
  STANDARD = 'STANDARD',
  CREATIVE = 'CREATIVE',
  UNRESTRICTED = 'UNRESTRICTED',
  VISION = 'VISION', // New Image Gen Mode
}