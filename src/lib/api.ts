/**
 * API Client - Kết nối frontend với backend server
 * Backend: http://localhost:3001
 */

const API_BASE = (typeof process !== 'undefined' && (process as any).env?.VITE_API_URL)
  || 'http://localhost:3001/api';

let authToken: string | null = null;
let refreshAuthToken: string | null = localStorage.getItem('vgreen_refresh');

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setRefreshToken(token: string | null) {
  refreshAuthToken = token;
  if (token) localStorage.setItem('vgreen_refresh', token);
  else localStorage.removeItem('vgreen_refresh');
}

export function getAuthToken(): string | null {
  return authToken;
}

export function getRefreshToken(): string | null {
  return refreshAuthToken;
}

type RequestOptions = RequestInit & { _retry?: boolean };

async function doRequest<T= any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<Response> {
  const url = `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return fetch(url, { ...options, headers });
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshAuthToken) return false;
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshAuthToken }),
    });
    const json = await response.json();
    if (response.ok && json.data?.tokens?.accessToken) {
      authToken = json.data.tokens.accessToken;
      setRefreshToken(json.data.tokens.refreshToken);
      return true;
    }
  } catch {
    // network offline — keep existing token
    return false;
  }
  return false;
}

async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ success: boolean; data?: T; error?: string; errors?: any[] }> {
  let response = await doRequest(endpoint, options);

  // Token expired -> try to refresh once and retry
  if (response.status === 401 && refreshAuthToken && !options._retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed && authToken) {
      response = await doRequest(endpoint, { ...options, _retry: true });
    }
  }

  try {
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
  role: 'user' | 'admin' | 'super_admin';
  referralCode: string;
  referredBy?: string;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  bankAccount?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  permissions?: Record<string, boolean>;
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

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const result = await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return { success: result.success, error: result.error };
  },

  async getReferrals(): Promise<{ referred: any[]; totalCommission: number; commissionCount: number }> {
    const result = await request<{ referred: any[]; totalCommission: number; commissionCount: number }>('/auth/referrals');
    return result.data || { referred: [], totalCommission: 0, commissionCount: 0 };
  },

  async logout(): Promise<void> {
    try {
      if (authToken || refreshAuthToken) {
        await doRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: refreshAuthToken }),
        });
      }
    } catch {}
    setAuthToken(null);
    setRefreshToken(null);
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
// SETTINGS API
// =============================================

const parseSettingValue = (v: any): any => {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return null; }
  }
  return v;
};

export const settingsApi = {
  async getBankInfo(): Promise<{ name: string; account: string; holder: string } | null> {
    const result = await request<{ value: any }>('/settings/bank_info');
    if (!result.success || !result.data?.value) return null;
    return parseSettingValue(result.data.value);
  },

  async getMinAmounts(): Promise<{ minDeposit: number; minWithdraw: number }> {
    const defaults = { minDeposit: 100000, minWithdraw: 100000 };
    try {
      const list = await request<any[]>('/settings');
      if (!list.success) return defaults;
      const parsed: any = {};
      for (const s of (list.data || [])) {
        const v = parseSettingValue(s.value);
        if (s.id === 'min_deposit') parsed.minDeposit = parseFloat(v?.amount) || defaults.minDeposit;
        if (s.id === 'min_withdraw') parsed.minWithdraw = parseFloat(v?.amount) || defaults.minWithdraw;
      }
      return { minDeposit: parsed.minDeposit || defaults.minDeposit, minWithdraw: parsed.minWithdraw || defaults.minWithdraw };
    } catch {
      return defaults;
    }
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
    const result = await request(`/admin/users/${userId}/status`, {
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

  async approveDeposit(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const result = await request(`/admin/deposits/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return { success: result.success, error: result.error };
  },

  async rejectDeposit(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const result = await request(`/admin/deposits/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return { success: result.success, error: result.error };
  },

  async getPendingWithdrawals(page = 1, limit = 20): Promise<{ withdrawals: any[]; total: number }> {
    const result = await request<any[]>(`/admin/withdrawals?page=${page}&limit=${limit}`);
    return {
      withdrawals: result.data || [],
      total: (result as any).pagination?.total || 0,
    };
  },

  async approveWithdraw(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const result = await request(`/admin/withdrawals/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return { success: result.success, error: result.error };
  },

  async rejectWithdraw(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const result = await request(`/admin/withdrawals/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    return { success: result.success, error: result.error };
  },

  async adjustBalance(
    userId: string,
    amount: number,
    action: 'add' | 'subtract',
    note: string
  ): Promise<{ success: boolean; error?: string; reference?: string; newBalance?: number; oldBalance?: number }> {
    const result = await request<{ reference: string; newBalance: number; oldBalance: number }>(
      '/admin/wallet/adjust',
      {
        method: 'POST',
        body: JSON.stringify({ userId, amount, action, note }),
      }
    );
    if (!result.success) {
      return { success: false, error: result.error || 'Điều chỉnh thất bại' };
    }
    return {
      success: true,
      reference: result.data?.reference,
      newBalance: result.data?.newBalance,
      oldBalance: result.data?.oldBalance,
    };
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

// =============================================
// CHAT API
// =============================================

export interface ApiChatMessage {
  id: string;
  conversation_id: string;
  sender: 'user' | 'admin';
  text: string;
  is_read: boolean;
  created_at: string;
}

export interface ApiChatConversation {
  id: string;
  client_ref: string;
  user_id: string | null;
  user_name: string;
  user_full_name?: string | null;
  user_phone?: string | null;
  status: 'open' | 'closed';
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

function getClientRef(): string {
  let ref = localStorage.getItem('vgreen_chat_ref');
  if (!ref) {
    ref = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('vgreen_chat_ref', ref);
  }
  return ref;
}

export const chatApi = {
  async getConversation(): Promise<{ conversation: ApiChatConversation; messages: ApiChatMessage[] } | null> {
    const result = await request<{ conversation: ApiChatConversation; messages: ApiChatMessage[] }>(
      '/chat/conversation',
      { headers: { 'X-Client-Ref': getClientRef() } as any }
    );
    return result.success ? result.data! : null;
  },

  async sendMessage(text: string): Promise<ApiChatMessage | null> {
    const result = await request<ApiChatMessage>('/chat/messages', {
      method: 'POST',
      headers: { 'X-Client-Ref': getClientRef() } as any,
      body: JSON.stringify({ text }),
    });
    return result.success ? result.data : null;
  },

  // Admin endpoints
  async adminGetConversations(): Promise<{ conversations: ApiChatConversation[]; totalUnread: number }> {
    const result = await request<{ conversations: ApiChatConversation[]; totalUnread: number }>(
      '/admin/chat/conversations'
    );
    return result.success ? result.data! : { conversations: [], totalUnread: 0 };
  },

  async adminGetMessages(conversationId: string): Promise<{ conversation: ApiChatConversation; messages: ApiChatMessage[] } | null> {
    const result = await request<{ conversation: ApiChatConversation; messages: ApiChatMessage[] }>(
      `/admin/chat/conversations/${conversationId}/messages`
    );
    return result.success ? result.data! : null;
  },

  async adminReply(conversationId: string, text: string): Promise<ApiChatMessage | null> {
    const result = await request<ApiChatMessage>(`/admin/chat/conversations/${conversationId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return result.success ? result.data : null;
  },

  async adminCloseConversation(conversationId: string): Promise<boolean> {
    const result = await request(`/admin/chat/conversations/${conversationId}/close`, { method: 'POST' });
    return result.success;
  },
};

// =============================================
// REFERRAL API
// =============================================

export interface ReferralStats {
  referralCode: string;
  referralCount: number;
  totalEarnings: number;
  pendingCount: number;
  pendingAmount: number;
  referredUsers: ReferredUser[];
}

export interface ReferredUser {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  total_bonus: number;
  bonus_count: number;
}

export interface ReferralBonus {
  id: string;
  referrer_id: string;
  referred_id: string;
  investment_id: string | null;
  bonus_amount: number;
  bonus_type: 'signup' | 'first_investment' | 'milestone';
  status: 'pending' | 'credited' | 'cancelled' | 'expired';
  description: string;
  created_at: string;
  credited_at: string | null;
  referred_user_name?: string;
  referred_user_phone?: string;
}

export const referralApi = {
  async getStats(): Promise<ReferralStats | null> {
    const result = await request<ReferralStats>('/referrals/stats');
    return result.success ? result.data! : null;
  },

  async getBonuses(page = 1, limit = 20): Promise<{ bonuses: ReferralBonus[]; total: number }> {
    const result = await request<{ bonuses: ReferralBonus[]; total: number }>(
      `/referrals/bonuses?page=${page}&limit=${limit}`
    );
    return result.success ? result.data! : { bonuses: [], total: 0 };
  },

  async claimBonus(bonusId: string): Promise<{ success: boolean; error?: string }> {
    const result = await request(`/referrals/claim-bonus/${bonusId}`, { method: 'POST' });
    return { success: result.success, error: result.error };
  },

  async getReferredUsers(page = 1, limit = 20): Promise<{ users: ReferredUser[]; total: number }> {
    const result = await request<{ users: ReferredUser[]; total: number }>(
      `/referrals/referred-users?page=${page}&limit=${limit}`
    );
    return result.success ? result.data! : { users: [], total: 0 };
  },

  async validateCode(code: string): Promise<{ valid: boolean; referrerName?: string; error?: string }> {
    const result = await request<{ valid: boolean; referrerName: string }>('/referrals/validate-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    return result.success ? result.data! : { valid: false, error: result.error };
  },
};

// =============================================
// REINVESTMENT API
// =============================================

export interface ReinvestmentInvestment {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  package_type: string;
  image_url?: string;
  package_default_amount: number;
  min_investment?: number;
  max_investment?: number;
  amount: number;
  daily_profit: number;
  accumulated_profit: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'paused';
  reference: string;
  daysRemaining: number;
  canReinvest: boolean;
  isMatured: boolean;
  availableProfit: number;
}

export interface ReinvestmentPackage {
  id: string;
  slug: string;
  name: string;
  type: string;
  power?: string;
  category: string;
  daily_profit: number;
  investment_period: number;
  investment_amount: number;
  min_investment?: number;
  max_investment?: number;
  image_url?: string;
  description?: string;
  status: string;
}

export interface ReinvestmentPreview {
  originalInvestment: {
    id: string;
    amount: number;
    accumulatedProfit: number;
  };
  newInvestment: {
    packageId: string;
    packageName: string;
    totalAmount: number;
    profitUsed: number;
    cashAdded: number;
    dailyProfit: string;
    investmentPeriod: number;
    totalProfit: string;
    startDate: string;
    endDate: string;
  };
  summary: {
    profitRemaining: number;
    expectedROI: string;
    dailyProfitRate: number;
  };
}

export interface ReinvestmentHistory {
  id: string;
  user_id: string;
  original_investment_id: string;
  new_investment_id: string;
  amount: number;
  profit_used: number;
  cash_added: number;
  package_id: string;
  package_name?: string;
  package_type?: string;
  original_reference?: string;
  original_amount?: number;
  new_reference?: string;
  new_amount?: number;
  status: string;
  created_at: string;
}

export const reinvestmentApi = {
  async getMyInvestments(): Promise<ReinvestmentInvestment[]> {
    const result = await request<{ investments: ReinvestmentInvestment[] }>('/reinvestments/my-investments');
    return result.success ? (result.data?.investments || []) : [];
  },

  async getOptions(investmentId: string): Promise<{
    investment: ReinvestmentInvestment;
    packages: ReinvestmentPackage[];
    availableProfit: number;
    canUseFullProfit: boolean;
  } | null> {
    const result = await request<any>(`/reinvestments/options/${investmentId}`);
    return result.success ? result.data : null;
  },

  async preview(investmentId: string, packageId: string, profitToUse: number, cashToAdd: number): Promise<ReinvestmentPreview | null> {
    const result = await request<ReinvestmentPreview>('/reinvestments/preview', {
      method: 'POST',
      body: JSON.stringify({ investmentId, packageId, profitToUse, cashToAdd }),
    });
    return result.success ? result.data : null;
  },

  async execute(investmentId: string, packageId: string, profitToUse: number, cashToAdd: number): Promise<{
    success: boolean;
    newInvestmentId?: string;
    newInvestment?: any;
    error?: string;
  }> {
    const result = await request<any>('/reinvestments/execute', {
      method: 'POST',
      body: JSON.stringify({ investmentId, packageId, profitToUse, cashToAdd }),
    });
    return {
      success: result.success,
      newInvestmentId: result.data?.newInvestmentId,
      newInvestment: result.data?.newInvestment,
      error: result.error,
    };
  },

  async getHistory(page = 1, limit = 20): Promise<{
    history: ReinvestmentHistory[];
    total: number;
    stats: {
      totalReinvestments: number;
      totalAmount: number;
      totalProfitUsed: number;
      totalCashAdded: number;
    };
  }> {
    const result = await request<any>(`/reinvestments/history?page=${page}&limit=${limit}`);
    return result.success ? result.data : {
      history: [],
      total: 0,
      stats: { totalReinvestments: 0, totalAmount: 0, totalProfitUsed: 0, totalCashAdded: 0 },
    };
  },

  async getPackages(): Promise<ReinvestmentPackage[]> {
    const result = await request<{ packages: ReinvestmentPackage[] }>('/reinvestments/packages');
    return result.success ? (result.data?.packages || []) : [];
  },
};
