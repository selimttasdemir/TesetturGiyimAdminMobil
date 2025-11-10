import apiService from './api.service';
import { User, ApiResponse } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // OAuth2PasswordRequestForm için URL-encoded format kullan
    const params = new URLSearchParams();
    params.append('username', credentials.email);
    params.append('password', credentials.password);

    return await apiService.post<LoginResponse>('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return await apiService.post<ApiResponse<User>>('/auth/register', data);
  }

  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>('/auth/me');
  }

  async logout(): Promise<void> {
    return await apiService.post('/auth/logout');
  }

  async refreshToken(): Promise<LoginResponse> {
    return await apiService.post<LoginResponse>('/auth/refresh');
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return await apiService.post<ApiResponse<void>>('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }
}

export default new AuthService();
