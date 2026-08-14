/**
 * Reinvestment Store - Zustand store for reinvestment state management
 */

import { create } from 'zustand';
import {
  reinvestmentApi,
  ReinvestmentInvestment,
  ReinvestmentPackage,
  ReinvestmentPreview,
  ReinvestmentHistory,
} from '../lib/api';

interface ReinvestmentState {
  // Investment list
  investments: ReinvestmentInvestment[];
  investmentsLoading: boolean;

  // Options for selected investment
  selectedInvestment: ReinvestmentInvestment | null;
  optionsLoading: boolean;
  availablePackages: ReinvestmentPackage[];
  availableProfit: number;

  // Preview & Execute
  preview: ReinvestmentPreview | null;
  previewLoading: boolean;
  executeLoading: boolean;

  // History
  history: ReinvestmentHistory[];
  historyStats: {
    totalReinvestments: number;
    totalAmount: number;
    totalProfitUsed: number;
    totalCashAdded: number;
  };
  historyLoading: boolean;
  historyPage: number;
  historyTotal: number;

  // Form state
  selectedPackage: ReinvestmentPackage | null;
  profitToUse: number;
  cashToAdd: number;

  error: string | null;

  // Actions
  fetchInvestments: () => Promise<void>;
  fetchOptions: (investmentId: string) => Promise<void>;
  previewReinvestment: () => Promise<void>;
  executeReinvestment: () => Promise<boolean>;
  fetchHistory: (page?: number) => Promise<void>;

  // Form actions
  setSelectedPackage: (pkg: ReinvestmentPackage | null) => void;
  setProfitToUse: (amount: number) => void;
  setCashToAdd: (amount: number) => void;
  resetForm: () => void;
  reset: () => void;
}

export const useReinvestmentStore = create<ReinvestmentState>((set, get) => ({
  investments: [],
  investmentsLoading: false,
  selectedInvestment: null,
  optionsLoading: false,
  availablePackages: [],
  availableProfit: 0,
  preview: null,
  previewLoading: false,
  executeLoading: false,
  history: [],
  historyStats: {
    totalReinvestments: 0,
    totalAmount: 0,
    totalProfitUsed: 0,
    totalCashAdded: 0,
  },
  historyLoading: false,
  historyPage: 1,
  historyTotal: 0,
  selectedPackage: null,
  profitToUse: 0,
  cashToAdd: 0,
  error: null,

  fetchInvestments: async () => {
    set({ investmentsLoading: true, error: null });
    try {
      const investments = await reinvestmentApi.getMyInvestments();
      set({ investments, investmentsLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch investments', investmentsLoading: false });
    }
  },

  fetchOptions: async (investmentId: string) => {
    set({ optionsLoading: true, error: null });
    try {
      const options = await reinvestmentApi.getOptions(investmentId);
      if (options) {
        const investment = get().investments.find(i => i.id === investmentId);
        set({
          selectedInvestment: investment || null,
          availablePackages: options.packages,
          availableProfit: options.availableProfit,
          optionsLoading: false,
        });
      } else {
        set({ error: 'Failed to fetch options', optionsLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch options', optionsLoading: false });
    }
  },

  previewReinvestment: async () => {
    const { selectedInvestment, selectedPackage, profitToUse, cashToAdd } = get();
    if (!selectedInvestment || !selectedPackage) return;

    set({ previewLoading: true, error: null });
    try {
      const preview = await reinvestmentApi.preview(
        selectedInvestment.id,
        selectedPackage.id,
        profitToUse,
        cashToAdd
      );
      set({ preview, previewLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to preview', previewLoading: false });
    }
  },

  executeReinvestment: async () => {
    const { selectedInvestment, selectedPackage, profitToUse, cashToAdd } = get();
    if (!selectedInvestment || !selectedPackage) return false;

    set({ executeLoading: true, error: null });
    try {
      const result = await reinvestmentApi.execute(
        selectedInvestment.id,
        selectedPackage.id,
        profitToUse,
        cashToAdd
      );

      if (result.success) {
        // Refresh investments and history
        await get().fetchInvestments();
        await get().fetchHistory();
        set({
          executeLoading: false,
          selectedInvestment: null,
          selectedPackage: null,
          profitToUse: 0,
          cashToAdd: 0,
          preview: null,
        });
        return true;
      } else {
        set({ error: result.error || 'Failed to execute', executeLoading: false });
        return false;
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to execute', executeLoading: false });
      return false;
    }
  },

  fetchHistory: async (page = 1) => {
    set({ historyLoading: true, error: null });
    try {
      const result = await reinvestmentApi.getHistory(page);
      set({
        history: result.history,
        historyStats: result.stats,
        historyPage: page,
        historyTotal: result.total,
        historyLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch history', historyLoading: false });
    }
  },

  setSelectedPackage: (pkg) => {
    set({ selectedPackage: pkg, preview: null });
  },

  setProfitToUse: (amount) => {
    const maxProfit = get().availableProfit;
    set({ profitToUse: Math.min(Math.max(0, amount), maxProfit), preview: null });
  },

  setCashToAdd: (amount) => {
    set({ cashToAdd: Math.max(0, amount), preview: null });
  },

  resetForm: () => {
    set({
      selectedInvestment: null,
      selectedPackage: null,
      profitToUse: 0,
      cashToAdd: 0,
      preview: null,
      error: null,
    });
  },

  reset: () => {
    set({
      investments: [],
      investmentsLoading: false,
      selectedInvestment: null,
      optionsLoading: false,
      availablePackages: [],
      availableProfit: 0,
      preview: null,
      previewLoading: false,
      executeLoading: false,
      history: [],
      historyStats: {
        totalReinvestments: 0,
        totalAmount: 0,
        totalProfitUsed: 0,
        totalCashAdded: 0,
      },
      historyLoading: false,
      historyPage: 1,
      historyTotal: 0,
      selectedPackage: null,
      profitToUse: 0,
      cashToAdd: 0,
      error: null,
    });
  },
}));
