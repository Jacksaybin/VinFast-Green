/**
 * Package Store - Nguồn dữ liệu duy nhất cho các gói đầu tư
 * Ưu tiên lấy từ backend API, fallback về dữ liệu tĩnh khi offline
 */

import { create } from 'zustand';
import { InvestmentPackage } from '../types';
import { investmentApi } from '../lib/api';
import { investmentPackages } from '../data/investmentPackages';

interface PackageState {
  packages: InvestmentPackage[];
  isLoading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  getAll: () => InvestmentPackage[];
  getByCategory: (category: 'premium' | 'standard' | 'basic' | 'all') => InvestmentPackage[];
  getHomePackages: () => InvestmentPackage[];
  getById: (id: string) => InvestmentPackage | undefined;
  getCategoryStats: () => {
    premium: { count: number; totalValue: number };
    standard: { count: number; totalValue: number };
    basic: { count: number; totalValue: number };
  };
}

function mapApiPackage(pkg: any): InvestmentPackage {
  return {
    id: pkg.id,
    name: pkg.name,
    type: pkg.type as InvestmentPackage['type'],
    power: pkg.power,
    dailyProfit: parseFloat(pkg.dailyProfit ?? pkg.daily_profit ?? 0),
    investmentPeriod: pkg.investmentPeriod ?? pkg.investment_period ?? 30,
    investmentAmount: parseFloat(pkg.investmentAmount ?? pkg.investment_amount ?? pkg.minInvestment ?? pkg.min_investment ?? 0),
    projectScale: parseFloat(pkg.projectScale ?? pkg.project_scale ?? 0),
    progress: pkg.progress ?? 0,
    image: pkg.image ?? pkg.imageUrl ?? pkg.image_url ?? '',
    description: pkg.description ?? '',
    status: pkg.status ?? 'active',
    category: pkg.category as InvestmentPackage['category'],
    showOnHome: pkg.showOnHome ?? pkg.show_on_home ?? true,
    details: pkg.details ?? undefined,
  };
}

export const usePackageStore = create<PackageState>()((set, get) => ({
  packages: investmentPackages,
  isLoading: false,
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    set({ isLoading: true });
    try {
      const list = await investmentApi.getPackages();
      if (list && list.length > 0) {
        set({ packages: list.map(mapApiPackage), loaded: true });
      }
    } catch {
      // Backend offline - keep static fallback
    }
    set({ isLoading: false });
  },

  getAll: () => get().packages,

  getByCategory: (category) => {
    if (category === 'all') return get().packages;
    return get().packages.filter((pkg) => pkg.category === category);
  },

  getHomePackages: () => get().packages.filter((pkg) => pkg.showOnHome),

  getById: (id) => get().packages.find((pkg) => pkg.id === id),

  getCategoryStats: () => {
    const byCat = (cat: 'premium' | 'standard' | 'basic') =>
      get().packages.filter((pkg) => pkg.category === cat);
    const stat = (list: InvestmentPackage[]) => ({
      count: list.length,
      totalValue: list.reduce((sum, p) => sum + p.investmentAmount, 0),
    });
    return {
      premium: stat(byCat('premium')),
      standard: stat(byCat('standard')),
      basic: stat(byCat('basic')),
    };
  },
}));