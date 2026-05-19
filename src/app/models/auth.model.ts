export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
  lastModifiedAt: string;
}
