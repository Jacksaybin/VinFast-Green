/**
 * API Client - Kết nối frontend với backend server
 * Backend: http://localhost:3001
 */

const API_BASE = (typeof process !== 'undefined' && (process as any).env?.VITE_API_URL)
  || 'http://localhost:3001/api';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; errors?: any[] }> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: json.error || 'Request failed',
        errors: json.errors,
      };
    }

    return { success: true, data: json.data, ...json };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

// =============================================
// TYPE DEFINITIONS
// =============================================

export interface ApiUser {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: 'user' | 'admin';
  referralCode: string;
  referredBy?: string;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ApiWallet {
  balance: number;
  lockedBalance: number;
}

export interface ApiTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  description: string;
  created_at: string;
}

export interface ApiInvestment {
  id: string;
  packageId: string;
  packageName: string;
  packageCode: string;
  amount: number;
  dailyProfit: number;
  investmentPeriod: number;
  accumulatedProfit: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  reference: string;
}

export interface ApiPackage {
  id: string;
  slug: string;
  name: string;
  type: string;
  power?: string;
  category: string;
  dailyProfit: number;
  investmentPeriod: number;
  investmentAmount: number;
  minInvestment: number;
  maxInvestment?: number;
  projectScale: number;
  progress: number;
  image?: string;
  description: string;
  details: any;
  status: string;
  showOnHome: boolean;
}

// =============================================
// AUTH API
// =============================================

export const authApi = {
  async login(phone: string, password: string): Promise<{ success: boolean; user?: ApiUser; token?: string; refreshToken?: string; error?: string }> {
    const result = await request<{ user: ApiUser; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ phone, password }) }
    );

    if (result.success && result.data) {
      return {
        success: true,
        user: result.data.user,
        token: result.data.tokens.accessToken,
        refreshToken: result.data.tokens.refreshToken,
      };
    }
    return { success: false, error: result.error };
  },

  async register(fullName: string, phone: string, password: string, referralCode?: string): Promise<{ success: boolean; user?: ApiUser; token?: string; refreshToken?: string; error?: string }> {
    const result = await request<{ user: ApiUser; tokens: { accessToken: string; refreshToken: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ fullName, phone, password, referralCode }) }
    );

    if (result.success && result.data) {
      return {
        success: true,
        user: result.data.user,
        token: result.data.tokens.accessToken,
        refreshToken: result.data.tokens.refreshToken,
      };
    }
    return { success: false, error: result.error };
  },

  async getProfile(): Promise<ApiUser | null> {
    const result = await request<ApiUser>('/auth/me');
    return result.success ? result.data! : null;
  },

  async updateProfile(data: Partial<ApiUser>): Promise<ApiUser | null> {
    const result = await request<ApiUser>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.success ? result.data! : null;
  },

  async logout(): Promise<void> {
    authToken = null;
  },
};

// =============================================
// WALLET API
// =============================================

export const walletApi = {
  async getWallet(): Promise<ApiWallet | null> {
    const result = await request<ApiWallet>('/wallet');
    if (!result.success) return null;
    return result.data!;
  },

  async requestDeposit(amount: number, description?: string): Promise<{ success: boolean; reference?: string; message?: string; error?: string }> {
    const result = await request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
    return { success: result.success, ...result.data };
  },

  async requestWithdraw(amount: number, description?: string): Promise<{ success: boolean; reference?: string; message?: string; error?: string }> {
    const result = await request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, description }),
    });
    return { success: result.success, ...result.data };
  },

  async getTransactions(type?: string, page = 1, limit = 20): Promise<{ transactions: ApiTransaction[]; total: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) params.set('type', type);
    const result = await request<ApiTransaction[]>(`/wallet/transactions?${params}`);
    return {
      transactions: result.data || [],
      total: (result as any).pagination?.total || 0,
    };
  },
};

// =============================================
// INVESTMENT API
// =============================================

export const investmentApi = {
  async getPackages(category?: string): Promise<ApiPackage[]> {
    const params = category ? `?category=${category}` : '';
    const result = await request<ApiPackage[]>(`/investments/packages${params}`);
    return result.data || [];
  },

  async getPackageStats(): Promise<any[]> {
    const result = await request<any[]>('/investments/stats');
    return result.data || [];
  },

  async getMyInvestments(status?: string): Promise<ApiInvestment[]> {
    const params = status ? `?status=${status}` : '';
    const result = await request<ApiInvestment[]>(`/investments/my-investments${params}`);
    return result.data || [];
  },

  async getMyStats(): Promise<any> {
    const result = await request<any>('/investments/my-stats');
    return result.data || {};
  },

  async invest(packageId: string, amount: number): Promise<{ success: boolean; reference?: string; endDate?: string; error?: string }> {
    const result = await request('/investments/invest', {
      method: 'POST',
      body: JSON.stringify({ packageId, amount }),
    });
    return { success: result.success, ...result.data };
  },
};

// =============================================
// NOTIFICATION API
// =============================================

export const notificationApi = {
  async getNotifications(page = 1, limit = 20): Promise<{ notifications: any[]; total: number }> {
    const result = await request<any[]>(`/notifications?page=${page}&limit=${limit}`);
    return {
      notifications: result.data || [],
      total: (result as any).pagination?.total || 0,
    };
  },

  async getUnreadCount(): Promise<number> {
    const result = await request<{ count: number }>('/notifications/unread-count');
    return result.success ? result.data?.count || 0 : 0;
  },

  async markAsRead(id: string): Promise<void> {
    await request(`/notifications/${id}/read`, { method: 'PUT' });
  },

  async markAllAsRead(): Promise<void> {
    await request('/notifications/read-all', { method: 'PUT' });
  },
};

// =============================================
// NEWS API
// =============================================

export const newsApi = {
  async getNews(category?: string, page = 1, limit = 10): Promise<{ news: any[]; total: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.set('category', category);
    const result = await request<any[]>(`/news?${params}`);
    return {
      news: result.data || [],
      total: (result as any).pagination?.total || 0,
    };
  },

  async getNewsBySlug(slug: string): Promise<any | null> {
    const result = await request<any>(`/news/${slug}`);
    return result.success ? result.data : null;
  },
};

// =============================================
// ADMIN API
// =============================================

export const adminApi = {
  async getStats(): Promise<any> {
    const result = await request<any>('/admin/stats');
    return result.data || {};
  },

  async getUsers(page = 1, limit = 20): Promise<{ users: any[]; total: number }> {
    const result = await request<any[]>(`/admin/users?page=${page}&limit=${limit}`);
    return {
      users: result.data || [],
      total: (result as any).pagination?.total || 0,
    };
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<boolean> {
    const result = await request('/admin/users/${userId}/status', {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return result.success;
  },

  async getPendingDeposits(page = 1, limit = 20): Promise<{ deposits: any[]; total: number }> {
    const result = await request<any[]>(`/admin/deposits?page=${page}&limit=${limit}`);
    return {
      deposits: result.data || [],
      total: (result as any).pagination?.total || 0,
    };
  },

  async approveDeposit(id: string): Promise<boolean> {
    const result = await request(`/admin/deposits/${id}/approve`, { method: 'POST' });
    return result.success;
  },

  async rejectDeposit(id: string): Promise<boolean> {
    const result = await request(`/admin/deposits/${id}/reject`, { method: 'POST' });
    return result.success;
  },

  async getPendingWithdrawals(page = 1, limit = 20): Promise<{ withdrawals: any[]; total: number }> {
    const result = await request<any[]>(`/admin/withdrawals?page=${page}&limit=${limit}`);
    return {
      withdrawals: result.data || [],
      total: (result as any).pagination?.total || 0,
    };
  },

  async approveWithdraw(id: string): Promise<boolean> {
    const result = await request(`/admin/withdrawals/${id}/approve`, { method: 'POST' });
    return result.success;
  },

  async rejectWithdraw(id: string): Promise<boolean> {
    const result = await request(`/admin/withdrawals/${id}/reject`, { method: 'POST' });
    return result.success;
  },

  async adjustBalance(userId: string, amount: number, action: 'add' | 'subtract', note: string): Promise<boolean> {
    const result = await request('/admin/wallet/adjust', {
      method: 'POST',
      body: JSON.stringify({ userId, amount, action, note }),
    });
    return result.success;
  },

  async getAllTransactions(page = 1, limit = 20, type?: string): Promise<{ transactions: any[]; total: number }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) params.set('type', type);
    const result = await request<any[]>(`/admin/transactions?${params}`);
    return {
      transactions: result.data || [],
      total: (result as any).pagination?.total || 0,
    };
  },

  async getPackages(): Promise<any[]> {
    const result = await request<any[]>('/admin/packages');
    return result.data || [];
  },

  async updatePackage(id: string, data: any): Promise<boolean> {
    const result = await request(`/admin/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.success;
  },

  async getNews(page = 1, limit = 20): Promise<{ news: any[]; total: number }> {
    const result = await request<any[]>(`/admin/news?page=${page}&limit=${limit}`);
    return {
      news: result.data || [],
      total: (result as any).pagination?.total || 0,
    };
  },

  async createNews(data: any): Promise<string | null> {
    const result = await request<{ id: string }>('/admin/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.success ? result.data?.id || null : null;
  },

  async updateNews(id: string, data: any): Promise<boolean> {
    const result = await request(`/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.success;
  },

  async deleteNews(id: string): Promise<boolean> {
    const result = await request(`/admin/news/${id}`, { method: 'DELETE' });
    return result.success;
  },
};
