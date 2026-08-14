/**
 * Trang tài khoản người dùng - Dashboard đầy đủ với stats, biểu đồ, và danh sách đầu tư
 * Kết nối backend API + fallback localStorage
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Wallet, TrendingUp, Clock, BarChart3, ChevronRight,
  Plus, PiggyBank, Gift, Eye, ArrowUpRight, ArrowDownRight, RefreshCw
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
  const { balance, lockedBalance, refresh: refreshWallet } = useWalletStore();
  const { investments, refresh: refreshInvestments, getUserInvestments, getActiveInvestments, getTotalInvested, getTotalProfit } = useInvestmentStore();
  const { seedWelcomeNotifications, getUserNotifications, markAsRead } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      seedWelcomeNotifications(user.id);
    }
  }, [user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshWallet(), refreshInvestments()]);
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
      icon: <Wallet className="w-5 h-5 text-green-600" />,
      bg: 'bg-green-50',
      color: 'text-green-700',
      action: () => navigate('/wallet'),
      actionLabel: 'Nạp/Rút',
    },
    {
      label: 'Đang đầu tư',
      value: formatShortCurrency(totalInvested),
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
      color: 'text-blue-700',
      action: () => navigate('/investment'),
      actionLabel: 'Đầu tư thêm',
    },
    {
      label: 'Lợi nhuận',
      value: `+${formatShortCurrency(totalProfit)}`,
      icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
      color: 'text-amber-700',
      action: () => navigate('/interest-calculator'),
      actionLabel: 'Tính lãi',
    },
    {
      label: 'Đang chờ rút',
      value: formatShortCurrency(lockedBalance),
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      bg: 'bg-orange-50',
      color: 'text-orange-700',
      action: () => navigate('/transactions'),
      actionLabel: 'Lịch sử',
    },
  ];

  const quickActions = [
    {
      label: 'Nạp tiền',
      icon: <ArrowDownRight className="w-5 h-5" />,
      color: 'bg-green-600',
      onClick: () => navigate('/wallet'),
    },
    {
      label: 'Đầu tư',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-blue-600',
      onClick: () => navigate('/investment'),
    },
    {
      label: 'Thưởng',
      icon: <Gift className="w-5 h-5" />,
      color: 'bg-amber-600',
      onClick: () => navigate('/benefits'),
    },
    {
      label: 'Tính lãi',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-purple-600',
      onClick: () => navigate('/interest-calculator'),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="px-4 pb-24">
        {/* Back button + refresh */}
        <div className="flex items-center justify-between mt-4 mb-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* User greeting */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Xin chào, {user.fullName}
            </h1>
            <p className="text-sm text-gray-500">
              Mã giới thiệu: <span className="font-semibold text-green-600">{user.referralCode}</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/personal-info')}
            className="text-sm text-green-600 hover:underline font-medium"
          >
            Hồ sơ
          </button>
        </div>

        {/* Total Assets Card */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white mb-4 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-green-100 text-sm">Tổng tài sản</span>
            <button
              onClick={handleLogout}
              className="text-xs text-green-200 hover:text-white underline"
            >
              Đăng xuất
            </button>
          </div>
          <div className="text-2xl font-bold mb-4">{formatCurrency(totalAssets)}</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-xs text-green-200">Khả dụng</div>
              <div className="text-sm font-semibold">{formatShortCurrency(balance)}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-xs text-green-200">Đầu tư</div>
              <div className="text-sm font-semibold">{formatShortCurrency(totalInvested)}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-2">
              <div className="text-xs text-green-200">Lợi nhuận</div>
              <div className="text-sm font-semibold text-green-200">+{formatShortCurrency(totalProfit)}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl shadow-sm hover:shadow transition-shadow"
            >
              <div className={`${action.color} w-10 h-10 rounded-full flex items-center justify-center text-white`}>
                {action.icon}
              </div>
              <span className="text-xs text-gray-700 font-medium">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={stat.action}
              className="bg-white rounded-xl p-4 text-left shadow-sm hover:shadow transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 ${stat.bg} rounded-full flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-green-600 mt-1">{stat.actionLabel} →</div>
            </button>
          ))}
        </div>

        {/* Active Investments */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Đầu tư đang hoạt động
            </h2>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
              {activeInvestments.length} gói
            </span>
          </div>

          {activeInvestments.length === 0 ? (
            <div className="text-center py-8">
              <PiggyBank className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-3">Bạn chưa có gói đầu tư nào</p>
              <button
                onClick={() => navigate('/investment')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Khám phá gói đầu tư
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeInvestments.slice(0, 3).map((inv) => {
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
                    className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/investment')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{inv.packageCode}</span>
                        <span className="ml-2 text-xs text-gray-500">{inv.packageName.split('(')[0]}</span>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Đang hoạt động
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                      <div>
                        <div className="text-gray-400">Số tiền</div>
                        <div className="font-medium text-gray-900">{formatShortCurrency(inv.amount)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Lãi/ngày</div>
                        <div className="font-medium text-green-600">+{formatCurrency(dailyProfit)}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Còn lại</div>
                        <div className="font-medium text-orange-600">{daysLeft} ngày</div>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">{formatDate(inv.startDate)}</span>
                        <span className="text-xs text-gray-400">{formatDate(inv.endDate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeInvestments.length > 3 && (
                <button
                  onClick={() => navigate('/transactions')}
                  className="w-full text-center text-sm text-green-600 hover:underline py-2"
                >
                  Xem tất cả ({activeInvestments.length} gói)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Giao dịch gần đây
            </h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-green-600 hover:underline font-medium flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={() => navigate('/investment')}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-green-400 hover:text-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Đầu tư ngay</span>
          </button>
        </div>

        {/* Menu Links */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => navigate('/personal-info')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Thông tin cá nhân</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-medium text-gray-900">Thông báo</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => navigate('/benefits')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">Phúc lợi & Thưởng</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => navigate('/introduction')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">Giới thiệu V-GREEN</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyAccount;
