/**
 * Auth Store - Kết nối với backend API
 * Falls back to localStorage khi backend offline
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, setAuthToken, ApiUser } from '../lib/api';

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface RegisterData {
  fullName: string;
  phone: string;
  password: string;
  referralCode?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUser>) => void;
  checkAuth: () => Promise<void>;
}

// Fallback: localStorage-based auth (khi backend offline)
const MOCK_ADMIN = {
  phone: 'admin',
  password: 'admin123',
  user: {
    id: 'admin-local',
    fullName: 'Quản trị viên',
    phone: 'admin',
    email: 'admin@vgreen.vn',
    role: 'admin' as UserRole,
    referralCode: 'ADMIN001',
    kycStatus: 'approved' as const,
    createdAt: new Date().toISOString(),
  },
};

function createReferralCode(): string {
  return `VIC${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone, password) => {
        set({ isLoading: true });

        // Try API first
        const apiResult = await authApi.login(phone, password);

        if (apiResult.success && apiResult.user && apiResult.token) {
          setAuthToken(apiResult.token);
          const user: AuthUser = {
            id: apiResult.user.id,
            fullName: apiResult.user.fullName,
            phone: apiResult.user.phone,
            email: apiResult.user.email || '',
            role: apiResult.user.role,
            referralCode: apiResult.user.referralCode,
            referredBy: apiResult.user.referredBy,
            kycStatus: apiResult.user.kycStatus,
            createdAt: apiResult.user.createdAt,
          };
          set({ user, token: apiResult.token, isAuthenticated: true, isLoading: false });
          return { success: true };
        }

        // Fallback: localStorage mock (khi backend offline)
        if (phone === MOCK_ADMIN.phone && password === MOCK_ADMIN.password) {
          const token = `token_admin_${Date.now()}`;
          set({ user: MOCK_ADMIN.user, token, isAuthenticated: true, isLoading: false });
          return { success: true };
        }

        const storedUsers = JSON.parse(localStorage.getItem('vgreen_users') || '[]') as Array<
          RegisterData & { id: string; referralCode: string; referredBy?: string; createdAt: string }
        >;
        const found = storedUsers.find((u) => u.phone === phone && u.password === password);
        if (found) {
          const user: AuthUser = {
            id: found.id,
            fullName: found.fullName,
            phone: found.phone,
            email: `${found.phone}@vgreen.vn`,
            role: 'user',
            referralCode: found.referralCode,
            referredBy: found.referredBy,
            kycStatus: 'none',
            createdAt: found.createdAt,
          };
          const token = `token_user_${Date.now()}`;
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true };
        }

        set({ isLoading: false });
        return { success: false, error: apiResult.error || 'Số điện thoại hoặc mật khẩu không đúng' };
      },

      register: async (data) => {
        set({ isLoading: true });

        const apiResult = await authApi.register(data.fullName, data.phone, data.password, data.referralCode);

        if (apiResult.success && apiResult.user && apiResult.token) {
          setAuthToken(apiResult.token!);
          const user: AuthUser = {
            id: apiResult.user.id,
            fullName: apiResult.user.fullName,
            phone: apiResult.user.phone,
            email: apiResult.user.email || '',
            role: apiResult.user.role,
            referralCode: apiResult.user.referralCode,
            referredBy: apiResult.user.referredBy,
            kycStatus: 'none',
            createdAt: new Date().toISOString(),
          };
          set({ user, token: apiResult.token, isAuthenticated: true, isLoading: false });
          return { success: true };
        }

        // Fallback: localStorage
        const storedUsers = JSON.parse(localStorage.getItem('vgreen_users') || '[]') as Array<
          RegisterData & { id: string; referralCode: string; referredBy?: string; createdAt: string }
        >;

        if (storedUsers.some((u) => u.phone === data.phone)) {
          set({ isLoading: false });
          return { success: false, error: 'Số điện thoại đã được đăng ký' };
        }

        const referralId = data.referralCode
          ? storedUsers.find((u) => u.referralCode === data.referralCode?.toUpperCase())?.id
          : undefined;

        const newUser = {
          ...data,
          id: `user_${Date.now()}`,
          referralCode: createReferralCode(),
          referredBy: referralId,
          createdAt: new Date().toISOString(),
        };

        storedUsers.push(newUser);
        localStorage.setItem('vgreen_users', JSON.stringify(storedUsers));

        const user: AuthUser = {
          id: newUser.id,
          fullName: newUser.fullName,
          phone: newUser.phone,
          email: `${newUser.phone}@vgreen.vn`,
          role: 'user',
          referralCode: newUser.referralCode,
          referredBy: data.referralCode,
          kycStatus: 'none',
          createdAt: newUser.createdAt,
        };

        const token = `token_user_${Date.now()}`;
        set({ user, token, isAuthenticated: true, isLoading: false });
        return { success: true };
      },

      logout: () => {
        authApi.logout?.();
        setAuthToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...data } });
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) return;

        setAuthToken(token);
        const profile = await authApi.getProfile();
        if (profile) {
          const user: AuthUser = {
            id: profile.id,
            fullName: profile.fullName,
            phone: profile.phone,
            email: profile.email || '',
            role: profile.role,
            referralCode: profile.referralCode,
            referredBy: profile.referredBy,
            kycStatus: profile.kycStatus,
            createdAt: profile.createdAt,
          };
          set({ user, isAuthenticated: true });
        }
      },
    }),
    {
      name: 'vgreen-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
