import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { STORAGE_KEYS } from '../constants';
import authService from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Backend ile login - sadece token döner
      const loginResponse = await authService.login({ email, password });
      
      // Token'ı sakla
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, loginResponse.access_token);
      
      // Token ile user bilgisini çek
      const user = await authService.getCurrentUser();
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      set({
        user: user,
        token: loginResponse.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      console.log('Login error:', error.response?.data);
      
      let errorMessage = 'Giriş başarısız. Email veya şifre hatalı.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // FastAPI validation errors (array format)
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((err: any) => err.msg).join(', ');
        } 
        // String format
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        // Message format
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register({ email, password, name });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Kayıt başarısız',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    console.log('AuthStore logout çağrıldı');
    try {
      await authService.logout();
      console.log('AuthService logout başarılı');
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      console.log('AsyncStorage temizleniyor...');
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      console.log('State güncelleniyor...');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      console.log('Logout tamamlandı, isAuthenticated: false');
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        const user = JSON.parse(userData);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.log('Load user error:', error);
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
