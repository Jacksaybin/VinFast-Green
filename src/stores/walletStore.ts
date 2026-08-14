/**
 * Wallet Store - Kết nối với backend API
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { walletApi } from '../lib/api';
import { generateReference } from '../lib/format';

export type TransactionType =
  | 'deposit'
  | 'withdraw'
  | 'investment'
  | 'profit'
  | 'bonus'
  | 'admin_credit'
  | 'admin_debit';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

interface WalletState {
  balance: number;
  lockedBalance: number;
  transactions: Transaction[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  requestDeposit: (userId: string, amount: number, note?: string) => Promise<{ success: boolean; error?: string; transaction?: Transaction }>;
  requestWithdraw: (userId: string, amount: number, note?: string) => Promise<{ success: boolean; error?: string; transaction?: Transaction }>;
  deductBalance: (userId: string, amount: number, type: TransactionType, description: string) => { success: boolean; error?: string; transaction?: Transaction };
  creditBalance: (userId: string, amount: number, type: TransactionType, description: string) => Transaction;
  approveTransaction: (transactionId: string) => void;
  rejectTransaction: (transactionId: string) => void;
  getUserTransactions: (userId: string) => Transaction[];
  initDemoBalance: (userId: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 0,
      lockedBalance: 0,
      transactions: [],
      isLoading: false,

      refresh: async () => {
        set({ isLoading: true });
        try {
          const wallet = await walletApi.getWallet();
          if (wallet) {
            set({
              balance: wallet.balance,
              lockedBalance: wallet.lockedBalance,
            });
          }
          // Fetch transactions
          const { transactions } = await walletApi.getTransactions();
          if (transactions.length > 0) {
            set({ transactions: transactions.map((t: any) => ({
              id: t.id,
              userId: t.user_id || t.userId,
              type: t.type,
              amount: parseFloat(t.amount),
              status: t.status,
              reference: t.reference,
              description: t.description || '',
              createdAt: t.created_at || t.createdAt,
            })) });
          }
        } catch (e) {
          // Backend offline, use local data
        }
        set({ isLoading: false });
      },

      requestDeposit: async (userId, amount, note) => {
        // Try API first
        const result = await walletApi.requestDeposit(amount, note);
        if (result.success) {
          // Refresh wallet
          const wallet = await walletApi.getWallet();
          if (wallet) set({ balance: wallet.balance, lockedBalance: wallet.lockedBalance });

          const tx: Transaction = {
            id: `tx_${Date.now()}`,
            userId,
            type: 'deposit',
            amount,
            status: 'pending',
            reference: result.reference || generateReference('DP'),
            description: note || 'Yêu cầu nạp tiền',
            createdAt: new Date().toISOString(),
          };
          set((state) => ({ transactions: [tx, ...state.transactions] }));
          return { success: true, transaction: tx };
        }

        // Fallback local
        const tx: Transaction = {
          id: `tx_${Date.now()}`,
          userId,
          type: 'deposit',
          amount,
          status: 'pending',
          reference: generateReference('DP'),
          description: note || 'Yêu cầu nạp tiền',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
        return { success: true, transaction: tx };
      },

      requestWithdraw: async (userId, amount, note) => {
        if (amount <= 0) {
          return { success: false, error: 'Số tiền không hợp lệ' };
        }
        if (amount > get().balance) {
          return { success: false, error: 'Số dư không đủ' };
        }
        if (amount < 100_000) {
          return { success: false, error: 'Số tiền rút tối thiểu 100.000 ₫' };
        }

        // Try API first
        const result = await walletApi.requestWithdraw(amount, note);
        if (result.success) {
          const wallet = await walletApi.getWallet();
          if (wallet) set({ balance: wallet.balance, lockedBalance: wallet.lockedBalance });

          const tx: Transaction = {
            id: `tx_${Date.now()}`,
            userId,
            type: 'withdraw',
            amount,
            status: 'pending',
            reference: result.reference || generateReference('WD'),
            description: note || 'Yêu cầu rút tiền',
            createdAt: new Date().toISOString(),
          };
          set((state) => ({ transactions: [tx, ...state.transactions] }));
          return { success: true, transaction: tx };
        }

        // Fallback local
        const tx: Transaction = {
          id: `tx_${Date.now()}`,
          userId,
          type: 'withdraw',
          amount,
          status: 'pending',
          reference: generateReference('WD'),
          description: note || 'Yêu cầu rút tiền',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          balance: state.balance - amount,
          lockedBalance: state.lockedBalance + amount,
          transactions: [tx, ...state.transactions],
        }));
        return { success: true, transaction: tx };
      },

      deductBalance: (userId, amount, type, description) => {
        const state = get();
        if (amount > state.balance) {
          return { success: false, error: 'Số dư không đủ để thực hiện giao dịch' };
        }

        const tx: Transaction = {
          id: `tx_${Date.now()}`,
          userId,
          type,
          amount,
          status: 'completed',
          reference: generateReference('TX'),
          description,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          balance: state.balance - amount,
          lockedBalance: type === 'investment' ? state.lockedBalance + amount : state.lockedBalance,
          transactions: [tx, ...state.transactions],
        }));
        return { success: true, transaction: tx };
      },

      creditBalance: (userId, amount, type, description) => {
        const tx: Transaction = {
          id: `tx_${Date.now()}`,
          userId,
          type,
          amount,
          status: 'completed',
          reference: generateReference('TX'),
          description,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          balance: state.balance + amount,
          transactions: [tx, ...state.transactions],
        }));
        return tx;
      },

      approveTransaction: (transactionId) => {
        set((state) => {
          const tx = state.transactions.find((t) => t.id === transactionId);
          if (!tx || tx.status !== 'pending') return state;

          const updated = state.transactions.map((t) =>
            t.id === transactionId ? { ...t, status: 'completed' as TransactionStatus } : t
          );

          if (tx.type === 'deposit') {
            return { balance: state.balance + tx.amount, transactions: updated };
          }
          if (tx.type === 'withdraw') {
            return { lockedBalance: Math.max(0, state.lockedBalance - tx.amount), transactions: updated };
          }
          return { transactions: updated };
        });
      },

      rejectTransaction: (transactionId) => {
        set((state) => {
          const tx = state.transactions.find((t) => t.id === transactionId);
          if (!tx || tx.status !== 'pending') return state;

          const updated = state.transactions.map((t) =>
            t.id === transactionId ? { ...t, status: 'failed' as TransactionStatus } : t
          );

          if (tx.type === 'withdraw') {
            return {
              balance: state.balance + tx.amount,
              lockedBalance: Math.max(0, state.lockedBalance - tx.amount),
              transactions: updated,
            };
          }
          return { transactions: updated };
        });
      },

      getUserTransactions: (userId) => {
        return get().transactions.filter((t) => t.userId === userId);
      },

      initDemoBalance: (userId) => {
        const state = get();
        if (state.balance > 0 || state.transactions.some((t) => t.userId === userId)) return;

        const tx: Transaction = {
          id: `tx_${Date.now()}`,
          userId,
          type: 'deposit',
          amount: 500_000_000,
          status: 'completed',
          reference: generateReference('DP'),
          description: 'Số dư khởi tạo tài khoản demo',
          createdAt: new Date().toISOString(),
        };

        set({
          balance: 500_000_000,
          transactions: [tx, ...state.transactions],
        });
      },
    }),
    {
      name: 'vgreen-wallet',
    }
  )
);
