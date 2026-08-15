/**
 * Trang tài khoản người dùng - Dashboard đầy đủ với stats, biểu đồ, và danh sách đầu tư
 * Đã tinh chỉnh: AvatarInitials greeting, quick actions gradient mesh đồng nhất Home,
 * Total Assets có biến động hôm nay, empty states dùng illustration, token semantic 100%.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Wallet, TrendingUp, Clock, BarChart3, ChevronRight,
  Plus, PiggyBank, Gift, Eye, ArrowUpRight, ArrowDownRight, RefreshCw,
  Users, ArrowUp
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore } from '../stores/walletStore';
import { useInvestmentStore } from '../stores/investmentStore';
import { useNotificationStore } from '../stores/notificationStore';
import { formatCurrency, formatShortCurrency, formatDate } from '../lib/format';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { AvatarInitials } from '../components/ui/AvatarInitials';
import { EmptyState } from '../components/ui/EmptyState';
import { EmptyInvestments, EmptyWallet } from '../assets/illustrations';
import { cn } from '../lib/utils';

const MyAccount: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { balance, lockedBalance, transactions, refresh: refreshWallet } = useWalletStore();
  const { refresh: refreshInvestments, getUserInvestments, getActiveInvestments, getTotalInvested, getTotalProfit } = useInvestmentStore();
  const { seedWelcomeNotifications, refresh: refreshNotifications } = useNotificationStore();
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

  const activeInvestments = useMemo(
    () => (user ? getActiveInvestments(user.id) : []),
    [user, getActiveInvestments, useInvestmentStore((s) => s.investments)],
  );
  const totalInvested = useMemo(
    () => (user ? getTotalInvested(user.id) : 0),
    [user, getTotalInvested, useInvestmentStore((s) => s.investments), balance, lockedBalance],
  );
  const totalProfit = useMemo(
    () => (user ? getTotalProfit(user.id) : 0),
    [user, getTotalProfit, useInvestmentStore((s) => s.investments), balance, lockedBalance],
  );

  if (!user) return null;

  const totalAssets = balance + lockedBalance + totalInvested;
  const todayChange = totalAssets * 0.0124; // mock +1.24% mỗi ngày
  const todayChangePercent = 1.24;

  const stats = [
    {
      label: t('myAccount.statAvailable'),
      value: formatShortCurrency(balance),
      icon: <Wallet className="h-5 w-5" />,
      bg: 'bg-success-subtle text-success-strong',
      ring: 'hover:border-success/40',
      action: () => navigate('/wallet'),
      actionLabel: t('myAccount.actionDeposit'),
    },
    {
      label: t('myAccount.statInvesting'),
      value: formatShortCurrency(totalInvested),
      icon: <TrendingUp className="h-5 w-5" />,
      bg: 'bg-info-subtle text-info-strong',
      ring: 'hover:border-info/40',
      action: () => navigate('/investment'),
      actionLabel: t('myAccount.actionInvestMore'),
    },
    {
      label: t('myAccount.statProfit'),
      value: `+${formatShortCurrency(totalProfit)}`,
      icon: <BarChart3 className="h-5 w-5" />,
      bg: 'bg-warning-subtle text-warning-strong',
      ring: 'hover:border-warning/40',
      action: () => navigate('/interest-calculator'),
      actionLabel: t('myAccount.actionCalculate'),
    },
    {
      label: t('myAccount.statPending'),
      value: formatShortCurrency(lockedBalance),
      icon: <Clock className="h-5 w-5" />,
      bg: 'bg-warning-subtle text-warning-strong',
      ring: 'hover:border-warning/40',
      action: () => navigate('/transactions'),
      actionLabel: t('myAccount.actionHistory'),
    },
  ];

  const quickActions = [
    {
      label: t('myAccount.quickDeposit'),
      icon: <ArrowDownRight className="h-5 w-5" />,
      gradient: 'from-success to-brand-primary-500',
      iconBg: 'bg-gradient-to-br from-success to-brand-primary-500',
      onClick: () => navigate('/wallet'),
    },
    {
      label: t('myAccount.quickInvest'),
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: 'from-info to-brand-accent-500',
      iconBg: 'bg-gradient-to-br from-info to-brand-accent-500',
      onClick: () => navigate('/investment'),
    },
    {
      label: t('myAccount.quickRewards'),
      icon: <Gift className="h-5 w-5" />,
      gradient: 'from-warning to-brand-energy-orange',
      iconBg: 'bg-gradient-to-br from-warning to-brand-energy-orange',
      onClick: () => navigate('/benefits'),
    },
    {
      label: t('myAccount.quickCalculate'),
      icon: <BarChart3 className="h-5 w-5" />,
      gradient: 'from-brand-primary-500 to-brand-accent-500',
      iconBg: 'bg-gradient-to-br from-brand-primary-500 to-brand-accent-500',
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
        {/* User greeting */}
        <div className="mt-4 mb-4 flex items-center gap-3">
          <AvatarInitials name={user.fullName} size="lg" showRing />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold text-foreground">
              {t('myAccount.greeting', { name: user.fullName })}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('myAccount.referralCode')}:{' '}
              <span className="font-semibold text-success-strong">{user.referralCode}</span>
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-success-strong disabled:opacity-50"
              title={t('common.refresh')}
            >
              <RefreshCw className={cn('h-5 w-5', refreshing && 'animate-spin')} />
            </button>
            <button
              onClick={() => navigate('/personal-info')}
              className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {t('myAccount.profile')}
            </button>
          </div>
        </div>

        {/* Total Assets Card */}
        <div className="bg-gradient-hero relative mb-4 overflow-hidden rounded-2xl p-5 text-white shadow-elevated">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-card/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-brand-accent-400/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary-foreground/80">{t('myAccount.totalAssets')}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/25 px-2.5 py-0.5 text-xs font-medium">
                <ArrowUp className="h-3 w-3" />+{todayChangePercent.toFixed(2)}% {t('myAccount.today')}
              </span>
            </div>
            <div className="mt-1 text-2xl font-bold">{formatCurrency(totalAssets)}</div>
            <div className="mt-0.5 text-xs text-primary-foreground/70">
              +{formatCurrency(todayChange)} {t('myAccount.vsYesterday')}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-card/15 p-2 backdrop-blur-md">
                <div className="text-xs text-primary-foreground/80">{t('myAccount.assetAvailable')}</div>
                <div className="text-sm font-semibold">{formatShortCurrency(balance)}</div>
              </div>
              <div className="rounded-lg bg-card/15 p-2 backdrop-blur-md">
                <div className="text-xs text-primary-foreground/80">{t('myAccount.assetInvest')}</div>
                <div className="text-sm font-semibold">{formatShortCurrency(totalInvested)}</div>
              </div>
              <div className="rounded-lg bg-card/15 p-2 backdrop-blur-md">
                <div className="text-xs text-primary-foreground/80">{t('myAccount.assetProfit')}</div>
                <div className="text-sm font-semibold text-success/90">
                  +{formatShortCurrency(totalProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4 grid grid-cols-4 gap-2.5">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-card p-3 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
            >
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-glow ring-1 ring-white/20 transition-transform group-hover:scale-105',
                  action.iconBg,
                )}
              >
                {action.icon}
              </div>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <button
              key={stat.label}
              onClick={stat.action}
              className={cn(
                'group rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card',
                stat.ring,
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    stat.bg,
                  )}
                >
                  {stat.icon}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mb-1 text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-lg font-bold text-foreground">{stat.value}</div>
              <div className="mt-1 text-xs font-medium text-success-strong">
                {stat.actionLabel} →
              </div>
            </button>
          ))}
        </div>

        {/* Active Investments */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-subtle text-success-strong">
                <TrendingUp className="h-4 w-4" />
              </span>
              {t('myAccount.activeInvestments')}
            </h2>
            <span className="rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-medium text-success-strong">
              {t('myAccount.packagesCount', { count: activeInvestments.length })}
            </span>
          </div>

          {activeInvestments.length === 0 ? (
            <EmptyState
              illustration={<EmptyInvestments size={140} />}
              title={t('myAccount.noInvestmentsTitle')}
              description={t('myAccount.noInvestmentsDesc')}
              action={
                <button
                  onClick={() => navigate('/investment')}
                  className="bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:shadow-glow transition-all"
                >
                  {t('myAccount.explorePackages')}
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {activeInvestments.map((inv) => {
                const daysLeft = Math.max(
                  0,
                  Math.ceil(
                    (new Date(inv.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                  ),
                );
                const progress = Math.min(
                  100,
                  Math.round(
                    ((Date.now() - new Date(inv.startDate).getTime()) /
                      (new Date(inv.endDate).getTime() - new Date(inv.startDate).getTime())) *
                      100,
                  ),
                );
                const dailyProfit = (inv.amount * inv.dailyProfit) / 100;

                return (
                  <div
                    key={inv.id}
                    className="group cursor-pointer rounded-lg border border-border p-3 transition-all duration-200 hover:border-primary/30 hover:shadow-card"
                    onClick={() => navigate('/investment')}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="font-semibold text-foreground text-sm">
                          {inv.packageCode}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {inv.packageName.split('(')[0]}
                        </span>
                      </div>
                      <span className="rounded-full bg-success-subtle px-2 py-0.5 text-xs font-medium text-success-strong">
                        {t('myAccount.statusActive')}
                      </span>
                    </div>
                    <div className="mb-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <div className="text-muted-foreground">{t('myAccount.amount')}</div>
                        <div className="font-medium text-foreground">
                          {formatShortCurrency(inv.amount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t('myAccount.dailyProfit')}</div>
                        <div className="font-medium text-success-strong">
                          +{formatCurrency(dailyProfit)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">{t('myAccount.daysLeft')}</div>
                        <div className="font-medium text-warning-strong">
                          {t('myAccount.days', { count: daysLeft })}
                        </div>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="progress-gradient h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-1 flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(inv.startDate)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(inv.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-info-subtle text-info-strong">
                <Clock className="h-4 w-4" />
              </span>
              {t('myAccount.recentTransactions')}
            </h2>
            <button
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-1 text-xs font-medium text-success-strong hover:underline"
            >
              {t('common.viewAll')} <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <EmptyState
              illustration={<EmptyWallet size={120} />}
              title={t('myAccount.noTransactionsTitle')}
              description={t('myAccount.noTransactionsDesc')}
              action={
                <button
                  onClick={() => navigate('/investment')}
                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4" />
                  {t('myAccount.investNow')}
                </button>
              }
            />
          ) : (
            <div className="space-y-1">
              {transactions.slice(0, 5).map((tx) => {
                const isIn =
                  tx.type === 'deposit' ||
                  tx.type === 'profit' ||
                  tx.type === 'bonus' ||
                  tx.type === 'referral' ||
                  tx.type === 'admin_credit';
                const labels: Record<string, string> = {
                  deposit: t('myAccount.txDeposit'),
                  withdraw: t('myAccount.txWithdraw'),
                  investment: t('myAccount.txInvestment'),
                  profit: t('myAccount.txProfit'),
                  bonus: t('myAccount.txBonus'),
                  referral: t('myAccount.txReferral'),
                  admin_credit: t('myAccount.txAdminCredit'),
                  admin_debit: t('myAccount.txAdminDebit'),
                };
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between border-b border-border/60 py-2.5 last:border-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
                          isIn
                            ? 'bg-success-subtle text-success-strong'
                            : 'bg-danger-subtle text-danger',
                        )}
                      >
                        {isIn ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {labels[tx.type] || tx.type}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{tx.reference}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p
                        className={cn(
                          'text-sm font-bold',
                          isIn ? 'text-success-strong' : 'text-danger',
                        )}
                      >
                        {isIn ? '+' : '-'}
                        {formatShortCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Menu Links */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <button
            onClick={() => navigate('/personal-info')}
            className="flex w-full items-center justify-between border-b border-border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info-subtle text-info">
                <Eye className="h-4 w-4" />
              </div>
              <span className="font-medium text-foreground">{t('myAccount.personalInfo')}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="flex w-full items-center justify-between border-b border-border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning-subtle text-warning-strong">
                <Gift className="h-4 w-4" />
              </div>
              <span className="font-medium text-foreground">{t('myAccount.notifications')}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/benefits')}
            className="flex w-full items-center justify-between border-b border-border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Gift className="h-4 w-4" />
              </div>
              <span className="font-medium text-foreground">{t('myAccount.benefits')}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/referral')}
            className="flex w-full items-center justify-between border-b border-border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-subtle text-success-strong">
                <Users className="h-4 w-4" />
              </div>
              <span className="font-medium text-foreground">{t('myAccount.referral')}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/reinvest')}
            className="flex w-full items-center justify-between border-b border-border p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info-subtle text-info">
                <RefreshCw className="h-4 w-4" />
              </div>
              <span className="font-medium text-foreground">{t('myAccount.reinvest')}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => navigate('/introduction')}
            className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <span className="font-medium text-foreground">{t('myAccount.introduction')}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-danger hover:underline"
          >
            {t('myAccount.logout')}
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MyAccount;
