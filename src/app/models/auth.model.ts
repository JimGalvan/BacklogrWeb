import { Workspace } from './workspace.model';

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

export interface RegistrationResponse extends AuthResponse {
  user: UserProfile;
  defaultWorkspace: Workspace;
}

export interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
  lastModifiedAt: string;
}
