/**
 * Trang lịch sử giao dịch
 * Kết nối backend API + fallback localStorage
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Filter, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore, TransactionType, TransactionStatus } from '../stores/walletStore';
import { formatCurrency, formatDate } from '../lib/format';

const TYPE_LABELS: Record<TransactionType, string> = {
  deposit: 'Nạp tiền',
  withdraw: 'Rút tiền',
  investment: 'Đầu tư',
  profit: 'Lợi nhuận',
  bonus: 'Thưởng',
  referral: 'Giới thiệu',
  admin_credit: 'Admin cộng tiền',
  admin_debit: 'Admin trừ tiền',
  reinvestment: 'Tái đầu tư',
};

const STATUS_LABELS: Record<TransactionStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ duyệt', className: 'bg-warning-subtle text-orange-700' },
  completed: { label: 'Hoàn thành', className: 'bg-success-subtle text-primary' },
  failed: { label: 'Thất bại', className: 'bg-danger-subtle text-danger-strong' },
  cancelled: { label: 'Đã hủy', className: 'bg-muted text-foreground' },
};

const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
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

  const userTransactions = transactions.filter((tx) => tx.userId === user.id);
  const filteredTransactions = userTransactions.filter(
    (tx) => filter === 'all' || tx.type === filter
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="px-4 py-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/my-account')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-muted-foreground hover:text-primary disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <h1 className="text-xl font-bold text-foreground mb-4">Lịch sử giao dịch</h1>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {(['all', 'deposit', 'withdraw', 'investment', 'profit'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                filter === type ? 'bg-primary text-white' : 'bg-card text-muted-foreground border'
              }`}
            >
              {type === 'all' ? 'Tất cả' : TYPE_LABELS[type as TransactionType] || type}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Đang tải...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-card rounded-xl shadow-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {TYPE_LABELS[tx.type] || tx.type}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.reference}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_LABELS[tx.status]?.className || ''}`}>
                    {STATUS_LABELS[tx.status]?.label || tx.status}
                  </span>
                </div>
                {tx.description && (
                  <p className="text-sm text-muted-foreground mb-2">{tx.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</span>
                  <span
                    className={`font-bold ${
                      ['withdraw', 'investment', 'admin_debit'].includes(tx.type)
                        ? 'text-danger'
                        : 'text-primary'
                    }`}
                  >
                    {['withdraw', 'investment', 'admin_debit'].includes(tx.type) ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default TransactionHistory;
