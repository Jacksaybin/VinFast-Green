/**
 * Trang quản lý ví - nạp/rút tiền
 * Kết nối backend API + fallback localStorage
 */

import React, { useEffect, useState } from 'react';
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Lock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import PageHeader from '../components/ui/PageHeader';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore } from '../stores/walletStore';
import { useInvestmentStore } from '../stores/investmentStore';
import { useNotificationStore } from '../stores/notificationStore';
import { settingsApi } from '../lib/api';
import { formatCurrency } from '../lib/format';

const WalletPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user)!;
  const { balance, lockedBalance, requestDeposit, requestWithdraw, refresh } = useWalletStore();
  const totalInvested = useInvestmentStore((s) => s.getTotalInvested(user.id));
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bankInfo, setBankInfo] = useState<{ name: string; account: string; holder: string } | null>(null);
  const [minAmounts, setMinAmounts] = useState({ minDeposit: 100000, minWithdraw: 100000 });

  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';

  useEffect(() => {
    const load = async () => {
      setRefreshing(true);
      await refresh();
      setRefreshing(false);

      const [bank, mins] = await Promise.all([settingsApi.getBankInfo(), settingsApi.getMinAmounts()]);
      if (bank) setBankInfo(bank);
      setMinAmounts(mins);
    };
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const numAmount = parseFloat(amount.replace(/\D/g, ''));

    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: t('wallet.invalidAmount') });
      setLoading(false);
      return;
    }

    if (tab === 'deposit') {
      const result = await requestDeposit(user.id, numAmount, note || t('wallet.depositNoteDefault'));
      if (result.success) {
        addNotification({
          userId: user.id,
          title: t('wallet.notifDepositTitle'),
          message: t('wallet.notifDepositMsg', { ref: result.transaction?.reference }),
          type: 'transaction',
          link: '/transactions',
        });
        setMessage({ type: 'success', text: t('wallet.depositSuccess') });
      } else {
        setMessage({ type: 'error', text: result.error! });
      }
    } else {
      const result = await requestWithdraw(user.id, numAmount, note || t('wallet.withdrawNoteDefault'));
      if (result.success) {
        addNotification({
          userId: user.id,
          title: t('wallet.notifWithdrawTitle'),
          message: t('wallet.notifWithdrawMsg', { ref: result.transaction?.reference }),
          type: 'transaction',
          link: '/transactions',
        });
        setMessage({ type: 'success', text: t('wallet.withdrawSuccess') });
      } else {
        setMessage({ type: 'error', text: result.error! });
      }
    }

    setAmount('');
    setNote('');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <PageHeader
        title={t('wallet.title')}
        backTo="/my-account"
        rightAction={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            title={t('common.refresh')}
            aria-label={t('common.refresh')}
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="px-4 pb-24 max-w-6xl mx-auto">
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-hero p-6 text-white shadow-elevated">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-card/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-brand-accent-400/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <WalletIcon className="h-6 w-6" />
              <span className="text-primary-foreground/80">{t('wallet.available')}</span>
            </div>
            <div className="mb-4 text-3xl font-bold">{formatCurrency(balance)}</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-card/15 p-3 backdrop-blur-md">
                <div className="flex items-center gap-1 text-primary-foreground/80">
                  <Lock className="h-3 w-3" /> {t('wallet.invested')}
                </div>
                <div className="font-semibold">{formatCurrency(totalInvested)}</div>
              </div>
              <div className="rounded-lg bg-card/15 p-3 backdrop-blur-md">
                <div className="text-primary-foreground/80">{t('wallet.pending')}</div>
                <div className="font-semibold">{formatCurrency(lockedBalance)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => { setTab('deposit'); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                tab === 'deposit' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              {t('wallet.deposit')}
            </button>
            <button
              onClick={() => { setTab('withdraw'); setMessage(null); }}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                tab === 'withdraw' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              {t('wallet.withdraw')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {tab === 'deposit' && (
              <div className="bg-info-subtle rounded-xl p-3 text-sm text-info-strong border border-info/20">
                <p className="font-medium mb-1">{t('wallet.bankInfoTitle')}</p>
                <p>{t('wallet.bankNameLabel')}: {bankInfo?.name || 'Vietcombank'}</p>
                <p>{t('wallet.bankAccountLabel')}: {bankInfo ? `${bankInfo.account} - ${bankInfo.holder}` : t('wallet.bankFallback')}</p>
                <p>{t('wallet.bankTransferContent')}: NAP {user.phone}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('wallet.amountLabel')}</label>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={tab === 'deposit'
                  ? t('wallet.minDeposit', { amount: minAmounts.minDeposit.toLocaleString(locale) })
                  : t('wallet.minWithdraw', { amount: minAmounts.minWithdraw.toLocaleString(locale) })}
                className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('wallet.noteLabel')}</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('wallet.notePlaceholder')}
                className="w-full px-4 py-2 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-xl text-sm border ${
                  message.type === 'success'
                    ? 'bg-success-subtle text-success-strong border-success/20'
                    : 'bg-danger-subtle text-danger-strong border-danger/20'
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 font-semibold text-primary-foreground transition-all hover:shadow-glow disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {t('common.processing')}
                </>
              ) : tab === 'deposit' ? (
                t('wallet.submitDeposit')
              ) : (
                t('wallet.submitWithdraw')
              )}
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate('/transactions')}
          className="w-full mt-4 py-3 text-primary border border-primary rounded-xl font-medium hover:bg-primary/10 transition-colors"
        >
          {t('wallet.viewHistory')}
        </button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default WalletPage;
