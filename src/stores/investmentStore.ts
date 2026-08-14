/**
 * Investment Store - Kết nối với backend API
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InvestmentPackage } from '../types';
import { investmentApi } from '../lib/api';
import { generateReference } from '../lib/format';

export interface UserInvestment {
  id: string;
  userId: string;
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
}

interface InvestmentState {
  investments: UserInvestment[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createInvestment: (
    userId: string,
    pkg: InvestmentPackage,
    amount: number
  ) => Promise<{ success: boolean; error?: string; investment?: UserInvestment }>;
  getUserInvestments: (userId: string) => UserInvestment[];
  getActiveInvestments: (userId: string) => UserInvestment[];
  getTotalInvested: (userId: string) => number;
  getTotalProfit: (userId: string) => number;
}

function extractPackageCode(name: string): string {
  const match = name.match(/\(([^)]+)\)/);
  return match ? match[1] : 'VIC';
}

function calcProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now >= end) return 100;
  if (now <= start) return 0;
  return Math.round(((now - start) / (end - start)) * 100);
}

export { calcProgress };

export const useInvestmentStore = create<InvestmentState>()(
  persist(
    (set, get) => ({
      investments: [],
      isLoading: false,

      refresh: async () => {
        set({ isLoading: true });
        try {
          const investments = await investmentApi.getMyInvestments();
          if (investments.length > 0) {
            set({ investments: investments.map((inv: any) => ({
              id: inv.id,
              userId: inv.userId || inv.user_id,
              packageId: inv.packageId || inv.package_id,
              packageName: inv.packageName || inv.package_name,
              packageCode: inv.packageCode || inv.package_slug || extractPackageCode(inv.package_name || 'VIC'),
              amount: parseFloat(inv.amount),
              dailyProfit: parseFloat(inv.dailyProfit || inv.daily_profit || 0),
              investmentPeriod: inv.investmentPeriod || inv.investment_period || 30,
              accumulatedProfit: parseFloat(inv.accumulatedProfit || inv.accumulated_profit || 0),
              startDate: inv.startDate || inv.start_date,
              endDate: inv.endDate || inv.end_date,
              status: inv.status,
            })) });
          }
        } catch (e) {
          // Backend offline
        }
        set({ isLoading: false });
      },

      createInvestment: async (userId, pkg, amount) => {
        // Try API first
        const result = await investmentApi.invest(pkg.id, amount);

        if (result.success) {
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + pkg.investmentPeriod * 24 * 60 * 60 * 1000);
          const dailyProfitAmount = (amount * pkg.dailyProfit) / 100;

          const investment: UserInvestment = {
            id: generateReference('INV'),
            userId,
            packageId: pkg.id,
            packageName: pkg.name,
            packageCode: extractPackageCode(pkg.name),
            amount,
            dailyProfit: pkg.dailyProfit,
            investmentPeriod: pkg.investmentPeriod,
            accumulatedProfit: dailyProfitAmount,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: 'active',
          };

          set((state) => ({ investments: [investment, ...state.investments] }));
          return { success: true, investment };
        }

        // Fallback local (when backend offline)
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + pkg.investmentPeriod * 24 * 60 * 60 * 1000);
        const dailyProfitAmount = (amount * pkg.dailyProfit) / 100;

        const investment: UserInvestment = {
          id: generateReference('INV'),
          userId,
          packageId: pkg.id,
          packageName: pkg.name,
          packageCode: extractPackageCode(pkg.name),
          amount,
          dailyProfit: pkg.dailyProfit,
          investmentPeriod: pkg.investmentPeriod,
          accumulatedProfit: dailyProfitAmount,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'active',
        };

        set((state) => ({ investments: [investment, ...state.investments] }));
        return { success: true, investment };
      },

      getUserInvestments: (userId) => {
        return get().investments.filter((inv) => inv.userId === userId);
      },

      getActiveInvestments: (userId) => {
        return get()
          .investments.filter((inv) => inv.userId === userId && inv.status === 'active');
      },

      getTotalInvested: (userId) => {
        return get()
          .investments.filter((inv) => inv.userId === userId && inv.status === 'active')
          .reduce((sum, inv) => sum + inv.amount, 0);
      },

      getTotalProfit: (userId) => {
        return get()
          .investments.filter((inv) => inv.userId === userId)
          .reduce((sum, inv) => sum + inv.accumulatedProfit, 0);
      },
    }),
    {
      name: 'vgreen-investments',
    }
  )
);
