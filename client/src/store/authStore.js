import { create } from 'zustand';
import { authService } from '../services';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,

  checkAuth: async () => {
    try {
      const data = await authService.me();
      set({ user: data, isAuthenticated: true, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  login: async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
    return data;
  },

  register: async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true });
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
