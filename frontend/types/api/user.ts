export interface User {
  id: string; // UUID
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string; // UUID, optional
}

// Auth related types
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}
