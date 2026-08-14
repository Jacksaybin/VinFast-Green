/**
 * Trang tài khoản người dùng - Dashboard đầy đủ với stats, biểu đồ, và danh sách đầu tư
 * Kết nối backend API + fallback localStorage
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Wallet, TrendingUp, Clock, BarChart3, ChevronRight,
  Plus, PiggyBank, Gift, Eye, ArrowUpRight, ArrowDownRight, RefreshCw,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore } from '../stores/walletStore';
import { useInvestmentStore } from '../stores/investmentStore';
import { useNotificationStore } from '../stores/notificationStore';
import { formatCurrency, formatShortCurrency, formatDate } from '../lib/format';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';

const MyAccount: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { balance, lockedBalance, transactions, refresh: refreshWallet } = useWalletStore();
  const { investments, refresh: refreshInvestments, getUserInvestments, getActiveInvestments, getTotalInvested, getTotalProfit } = useInvestmentStore();
  const { seedWelcomeNotifications, refresh: refreshNotifications, getUserNotifications, markAsRead } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      refreshNotifications();
      seedWelcomeNotifications(user.id);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshWallet(), refreshInvestments()]);
    if (user) refreshNotifications();
    setRefreshing(false);
  };

  if (!user) return null;

  const activeInvestments = getActiveInvestments(user.id);
  const allInvestments = getUserInvestments(user.id);
  const totalInvested = getTotalInvested(user.id);
  const totalProfit = getTotalProfit(user.id);
  const totalAssets = balance + lockedBalance + totalInvested;

  const stats = [
    {
      label: 'Số dư khả dụng',
      value: formatShortCurrency(balance),
      icon: <Wallet className="w-5 h-5 text-success-strong" />,
      bg: 'bg-success-subtle',
      color: 'text-success-strong',
      action: () => navigate('/wallet'),
      actionLabel: 'Nạp/Rút',
    },
    {
      label: 'Đang đầu tư',
      value: formatShortCurrency(totalInvested),
      icon: <TrendingUp className="w-5 h-5 text-info" />,
      bg: 'bg-info-subtle',
      color: 'text-info-strong',
      action: () => navigate('/investment'),
      actionLabel: 'Đầu tư thêm',
    },
    {
      label: 'Lợi nhuận',
      value: `+${formatShortCurrency(totalProfit)}`,
      icon: <BarChart3 className="w-5 h-5 text-warning-strong" />,
      bg: 'bg-warning-subtle',
      color: 'text-warning-strong',
      action: () => navigate('/interest-calculator'),
      actionLabel: 'Tính lãi',
    },
    {
      label: 'Đang chờ rút',
      value: formatShortCurrency(lockedBalance),
      icon: <Clock className="w-5 h-5 text-warning-strong" />,
      bg: 'bg-warning-subtle',
      color: 'text-orange-700',
      action: () => navigate('/transactions'),
      actionLabel: 'Lịch sử',
    },
  ];

  const quickActions = [
    {
      label: 'Nạp tiền',
      icon: <ArrowDownRight className="w-5 h-5" />,
      color: 'bg-success-strong',
      onClick: () => navigate('/wallet'),
    },
    {
      label: 'Đầu tư',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-info',
      onClick: () => navigate('/investment'),
    },
    {
      label: 'Thưởng',
      icon: <Gift className="w-5 h-5" />,
      color: 'bg-warning',
      onClick: () => navigate('/benefits'),
    },
    {
      label: 'Tính lãi',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-brand-accent-600',
      onClick: () => navigate('/interest-calculator'),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="px-4 pb-24">
        {/* Back button + refresh */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-muted-foreground hover:text-success-strong disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* User greeting */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Xin chào, {user.fullName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Mã giới thiệu: <span className="font-semibold text-success-strong">{user.referralCode}</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/personal-info')}
            className="text-sm text-success-strong hover:underline font-medium"
          >
            Hồ sơ
          </button>
        </div>

        {/* Total Assets Card */}
        <div className="bg-gradient-hero rounded-2xl p-5 text-white mb-4 shadow-elevated">
          <div className="flex items-center justify-between mb-1">
            <span className="text-primary-foreground/80 text-sm">Tổng tài sản</span>
            <button
              onClick={handleLogout}
              className="text-xs text-primary-foreground/80 hover:text-white underline"
            >
              Đăng xuất
            </button>
          </div>
          <div className="text-2xl font-bold mb-4">{formatCurrency(totalAssets)}</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-card/10 rounded-lg p-2">
              <div className="text-xs text-primary-foreground/80">Khả dụng</div>
              <div className="text-sm font-semibold">{formatShortCurrency(balance)}</div>
            </div>
            <div className="bg-card/10 rounded-lg p-2">
              <div className="text-xs text-primary-foreground/80">Đầu tư</div>
              <div className="text-sm font-semibold">{formatShortCurrency(totalInvested)}</div>
            </div>
            <div className="bg-card/10 rounded-lg p-2">
              <div className="text-xs text-primary-foreground/80">Lợi nhuận</div>
              <div className="text-sm font-semibold text-primary-foreground/80">+{formatShortCurrency(totalProfit)}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-1 p-3 bg-card rounded-xl shadow-sm hover:shadow transition-shadow"
            >
              <div className={`${action.color} w-10 h-10 rounded-full flex items-center justify-center text-white`}>
                {action.icon}
              </div>
              <span className="text-xs text-foreground font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={stat.action}
              className="bg-card rounded-xl p-4 text-left shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 ${stat.bg} rounded-full flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-success-strong mt-1">{stat.actionLabel} →</div>
            </button>
          ))}
        </div>

        {/* Active Investments */}
        <div className="bg-card rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success-strong" />
              Đầu tư đang hoạt động
            </h2>
            <span className="text-xs text-success-strong font-medium bg-success-subtle px-2 py-1 rounded-full">
              {activeInvestments.length} gói
            </span>
          </div>

          {activeInvestments.length === 0 ? (
            <div className="text-center py-8">
              <PiggyBank className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm mb-3">Bạn chưa có gói đầu tư nào</p>
              <button
                onClick={() => navigate('/investment')}
                className="bg-success-strong text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-success-strong transition-colors"
              >
                Khám phá gói đầu tư
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInvestments.map((inv) => {
                const daysLeft = Math.max(
                  0,
                  Math.ceil(
                    (new Date(inv.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                );
                const progress = Math.min(
                  100,
                  Math.round(
                    ((Date.now() - new Date(inv.startDate).getTime()) /
                      (new Date(inv.endDate).getTime() - new Date(inv.startDate).getTime())) *
                      100
                  )
                );
                const dailyProfit = (inv.amount * inv.dailyProfit) / 100;

                return (
                  <div
                    key={inv.id}
                    className="border border-border rounded-lg p-3 hover:bg-background transition-colors cursor-pointer"
                    onClick={() => navigate('/investment')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-foreground text-sm">{inv.packageCode}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{inv.packageName.split('(')[0]}</span>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-success-subtle text-success-strong">
                        Đang hoạt động
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                      <div>
                        <div className="text-muted-foreground">Số tiền</div>
                        <div className="font-medium text-foreground">{formatShortCurrency(inv.amount)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Lãi/ngày</div>
                        <div className="font-medium text-success-strong">+{formatCurrency(dailyProfit)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Còn lại</div>
                        <div className="font-medium text-warning-strong">{daysLeft} ngày</div>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success-subtle0 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">{formatDate(inv.startDate)}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(inv.endDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-info" />
              Giao dịch gần đây
            </h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-success-strong hover:underline font-medium flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <button
              onClick={() => navigate('/investment')}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-success hover:text-success-strong transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Đầu tư ngay</span>
            </button>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => {
                const isIn = tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'bonus' || tx.type === 'referral' || tx.type === 'admin_credit';
                const labels: Record<string, string> = {
                  deposit: 'Nạp tiền',
                  withdraw: 'Rút tiền',
                  investment: 'Đầu tư',
                  profit: 'Lợi nhuận',
                  bonus: 'Thưởng',
                  referral: 'Hoa hồng',
                  admin_credit: 'Cộng tiền',
                  admin_debit: 'Trừ tiền',
                };
                return (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isIn ? 'bg-success-subtle text-success-strong' : 'bg-danger-subtle text-danger'}`}>
                        {isIn ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{labels[tx.type] || tx.type}</p>
                        <p className="text-xs text-muted-foreground truncate">{tx.reference}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isIn ? 'text-success-strong' : 'text-danger'}`}>
                        {isIn ? '+' : '-'}{formatShortCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Menu Links */}
        <div className="bg-card rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => navigate('/personal-info')}
            className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-info-subtle rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-info" />
              </div>
              <span className="font-medium text-foreground">Thông tin cá nhân</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-warning-subtle rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4 text-warning-strong" />
              </div>
              <span className="font-medium text-foreground">Thông báo</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/benefits')}
            className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-foreground">Phúc lợi & Thưởng</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/referral')}
            className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-success-strong" />
              </div>
              <span className="font-medium text-foreground">Giới thiệu bạn bè</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/reinvest')}
            className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-info-subtle rounded-full flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-info" />
              </div>
              <span className="font-medium text-foreground">Tái đầu tư</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/introduction')}
            className="w-full flex items-center justify-between p-4 hover:bg-background transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="font-medium text-foreground">Giới thiệu V-GREEN</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyAccount;
