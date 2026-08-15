/**
 * Trang lịch sử giao dịch
 * Kết nối backend API + fallback localStorage
 * Đã tinh chỉnh: status badge token semantic, dùng SkeletonList + EmptyState + PageHeader.
 */

import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/ui/PageHeader';
import { Loading } from '../components/ui/StateViews';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRow } from '../components/ui/skeleton';
import { EmptyWallet } from '../assets/illustrations';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore, TransactionType, TransactionStatus } from '../stores/walletStore';
import { formatCurrency, formatDate } from '../lib/format';
import { cn } from '../lib/utils';

const STATUS_CLASS: Record<TransactionStatus, string> = {
  pending: 'bg-warning-subtle text-warning-strong',
  completed: 'bg-success-subtle text-success-strong',
  failed: 'bg-danger-subtle text-danger-strong',
  cancelled: 'bg-muted text-muted-foreground',
};

const OUT_TYPES: TransactionType[] = ['withdraw', 'investment', 'admin_debit', 'reinvestment'];

const TransactionHistory: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user)!;
  const { transactions, refresh } = useWalletStore();
  const [filter, setFilter] = useState<'all' | TransactionType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    };
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const typeLabel = (type: TransactionType | 'all') => {
    if (type === 'all') return t('transactionHistory.filterAll');
    const keyMap: Record<TransactionType, string> = {
      deposit: 'transactionHistory.typeDeposit',
      withdraw: 'transactionHistory.typeWithdraw',
      investment: 'transactionHistory.typeInvestment',
      profit: 'transactionHistory.typeProfit',
      bonus: 'transactionHistory.typeBonus',
      referral: 'transactionHistory.typeReferral',
      admin_credit: 'transactionHistory.typeAdminCredit',
      admin_debit: 'transactionHistory.typeAdminDebit',
      reinvestment: 'transactionHistory.typeReinvestment',
    };
    return t(keyMap[type]);
  };

  const statusLabel = (status: TransactionStatus) => {
    const keyMap: Record<TransactionStatus, string> = {
      pending: 'transactionHistory.status.pending',
      completed: 'transactionHistory.status.completed',
      failed: 'transactionHistory.status.failed',
      cancelled: 'transactionHistory.status.cancelled',
    };
    return t(keyMap[status]);
  };

  const userTransactions = transactions.filter((tx) => tx.userId === user.id);
  const filteredTransactions = userTransactions.filter(
    (tx) => filter === 'all' || tx.type === filter,
  );

  const filterTypes: Array<'all' | TransactionType> = ['all', 'deposit', 'withdraw', 'investment', 'profit'];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <PageHeader
        title={t('transactionHistory.title')}
        subtitle={t('transactionHistory.count', { count: userTransactions.length })}
        backTo="/my-account"
        rightAction={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label={t('common.refresh')}
          >
            <RefreshCw className={cn('h-5 w-5', refreshing && 'animate-spin')} />
          </button>
        }
      />

      <div className="px-4 pb-24">
        {/* Filter */}
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          {filterTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors',
                filter === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-border bg-card text-muted-foreground hover:bg-muted',
              )}
            >
              {typeLabel(type)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            illustration={<EmptyWallet size={140} />}
            title={t('transactionHistory.emptyTitle')}
            description={t('transactionHistory.emptyDesc')}
          />
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const isOut = OUT_TYPES.includes(tx.type as TransactionType);
              return (
                <div
                  key={tx.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-card"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {typeLabel(tx.type)}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.reference}</p>
                    </div>
                    <span
                      className={cn(
                        'whitespace-nowrap rounded-full px-2 py-0.5 text-xs',
                        STATUS_CLASS[tx.status] || 'bg-muted text-muted-foreground',
                      )}
                    >
                      {statusLabel(tx.status)}
                    </span>
                  </div>
                  {tx.description && (
                    <p className="mb-2 text-sm text-muted-foreground">{tx.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</span>
                    <span
                      className={cn(
                        'font-bold',
                        isOut ? 'text-danger' : 'text-success-strong',
                      )}
                    >
                      {isOut ? '-' : '+'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default TransactionHistory;
