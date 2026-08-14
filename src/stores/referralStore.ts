/**
 * Referral Store - Zustand store for referral state management
 */

import { create } from 'zustand';
import { referralApi, ReferralStats, ReferralBonus, ReferredUser } from '../lib/api';

interface ReferralState {
  stats: ReferralStats | null;
  bonuses: ReferralBonus[];
  referredUsers: ReferredUser[];
  loading: boolean;
  error: string | null;
  totalBonuses: number;
  bonusPage: number;
  referredPage: number;

  // Actions
  fetchStats: () => Promise<void>;
  fetchBonuses: (page?: number) => Promise<void>;
  fetchReferredUsers: (page?: number) => Promise<void>;
  claimBonus: (bonusId: string) => Promise<boolean>;
  validateCode: (code: string) => Promise<{ valid: boolean; referrerName?: string; error?: string }>;
  reset: () => void;
}

export const useReferralStore = create<ReferralState>((set, get) => ({
  stats: null,
  bonuses: [],
  referredUsers: [],
  loading: false,
  error: null,
  totalBonuses: 0,
  bonusPage: 1,
  referredPage: 1,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await referralApi.getStats();
      if (stats) {
        set({ stats, loading: false });
      } else {
        set({ error: 'Failed to fetch stats', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Network error', loading: false });
    }
  },

  fetchBonuses: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const result = await referralApi.getBonuses(page);
      set({
        bonuses: result.bonuses,
        totalBonuses: result.total,
        bonusPage: page,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Network error', loading: false });
    }
  },

  fetchReferredUsers: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const result = await referralApi.getReferredUsers(page);
      set({
        referredUsers: result.users,
        referredPage: page,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Network error', loading: false });
    }
  },

  claimBonus: async (bonusId: string) => {
    set({ loading: true, error: null });
    try {
      const result = await referralApi.claimBonus(bonusId);
      if (result.success) {
        // Refresh stats and bonuses
        await get().fetchStats();
        await get().fetchBonuses(get().bonusPage);
        set({ loading: false });
        return true;
      } else {
        set({ error: result.error || 'Failed to claim bonus', loading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message || 'Network error', loading: false });
      return false;
    }
  },

  validateCode: async (code: string) => {
    try {
      return await referralApi.validateCode(code);
    } catch (err: any) {
      return { valid: false, error: err.message || 'Network error' };
    }
  },

  reset: () => {
    set({
      stats: null,
      bonuses: [],
      referredUsers: [],
      loading: false,
      error: null,
      totalBonuses: 0,
      bonusPage: 1,
      referredPage: 1,
    });
  },
}));
