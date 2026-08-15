/**
 * Reinvestment Page - Trang tái đầu tư
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, RefreshCw, Package, DollarSign, Calendar, TrendingUp,
  Check, ChevronRight, Clock, AlertCircle, ArrowRight, Loader2,
  Wallet, BarChart3, History
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAuthStore } from '../stores/authStore';
import { useReinvestmentStore } from '../stores/reinvestmentStore';
import { useWalletStore } from '../stores/walletStore';
import { formatCurrency } from '../lib/format';

const Reinvestment: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { balance } = useWalletStore();
  const {
    investments,
    investmentsLoading,
    selectedInvestment,
    availablePackages,
    availableProfit,
    preview,
    previewLoading,
    executeLoading,
    history,
    historyStats,
    historyLoading,
    historyPage,
    historyTotal,
    selectedPackage,
    profitToUse,
    cashToAdd,
    error,
    fetchInvestments,
    fetchOptions,
    previewReinvestment,
    executeReinvestment,
    fetchHistory,
    setSelectedPackage,
    setProfitToUse,
    setCashToAdd,
    resetForm,
  } = useReinvestmentStore();

  const [step, setStep] = useState<'select' | 'package' | 'amount' | 'confirm' | 'success' | 'history'>('select');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestments();
    fetchHistory(1);
  }, []);

  useEffect(() => {
    const invId = searchParams.get('investmentId');
    if (invId && investments.length > 0) {
      handleSelectInvestment(invId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, investments]);

  const handleSelectInvestment = async (investmentId: string) => {
    setSelectedInvestmentId(investmentId);
    await fetchOptions(investmentId);
    setStep('package');
  };

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setStep('amount');
  };

  const handlePreview = async () => {
    await previewReinvestment();
    setStep('confirm');
  };

  const handleExecute = async () => {
    const success = await executeReinvestment();
    if (success) {
      setStep('success');
    }
  };

  const handleDone = () => {
    resetForm();
    setStep('select');
    fetchInvestments();
  };

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
    return new Date(dateStr).toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getPackageTypeLabel = (type: string) => {
    const keyMap: Record<string, string> = {
      VIC: 'reinvestment.pkgVIC',
      DC: 'reinvestment.pkgDC',
      GIFT_CARD: 'reinvestment.pkgGiftCard',
      REGULAR: 'reinvestment.pkgRegular',
    };
    return keyMap[type] ? t(keyMap[type]) : type;
  };

  const getPackageTypeColor = (type: string) => {
    switch (type) {
      case 'VIC': return 'bg-primary/10 text-primary';
      case 'DC': return 'bg-info-subtle text-info-strong';
      case 'GIFT_CARD': return 'bg-brand-energy-orange/20 text-brand-energy-orange';
      default: return 'bg-muted text-foreground';
    }
  };

  const reinvestableInvestments = investments.filter(
    (inv) => inv.status === 'active' || inv.status === 'completed'
  );

  const stepLabels = [
    t('reinvestment.stepSelect'),
    t('reinvestment.stepPackage'),
    t('reinvestment.stepAmount'),
    t('reinvestment.stepConfirm'),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="px-4 py-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (step === 'select' || step === 'history' || step === 'success') {
                navigate(-1);
              } else {
                if (step === 'confirm') setStep('amount');
                else if (step === 'amount') setStep('package');
                else setStep('select');
              }
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('reinvestment.title')}</span>
          </button>
          <button
            onClick={() => {
              setStep(step === 'history' ? 'select' : 'history');
            }}
            className={`p-2 rounded-lg ${step === 'history' ? 'bg-success-subtle text-primary' : 'text-muted-foreground hover:text-primary'}`}
            aria-label={t('reinvestment.history')}
          >
            {step === 'history' ? <ArrowLeft className="w-5 h-5" /> : <History className="w-5 h-5" />}
          </button>
        </div>

        {/* Step Indicator */}
        {step !== 'history' && step !== 'success' && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {stepLabels.map((label, idx) => {
              const stepNames = ['select', 'package', 'amount', 'confirm'];
              const currentIdx = stepNames.indexOf(step);
              const isActive = currentIdx === idx;
              const isPast = currentIdx > idx;

              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive ? 'bg-primary text-white' :
                      isPast ? 'bg-primary text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {isPast ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className={`text-xs whitespace-nowrap hidden sm:block ${
                      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-0.5 min-w-[20px] ${
                      isPast ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* History View */}
        {step === 'history' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-xl p-4 shadow-card">
                <p className="text-sm text-muted-foreground">{t('reinvestment.totalRounds')}</p>
                <p className="text-xl font-bold text-foreground">{historyStats.totalReinvestments}</p>
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <p className="text-sm text-muted-foreground">{t('reinvestment.totalValue')}</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(historyStats.totalAmount)}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{t('reinvestment.profitUsed')}</p>
                <p className="font-medium text-info">{formatCurrency(historyStats.totalProfitUsed)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t('reinvestment.extraCash')}</p>
                <p className="font-medium text-warning-strong">{formatCurrency(historyStats.totalCashAdded)}</p>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="bg-card rounded-xl p-8 shadow-card text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <RefreshCw className="h-7 w-7" />
                </div>
                <p className="font-medium text-foreground">{t('reinvestment.noHistory')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('reinvestment.noHistoryHint')}
                </p>
              </div>
            ) : (
              <div className="bg-card rounded-xl shadow-card overflow-hidden">
                <div className="divide-y divide-border">
                  {history.map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPackageTypeColor(item.package_type)}`}>
                            {getPackageTypeLabel(item.package_type)}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {item.package_name || 'N/A'}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t('reinvestment.dateLabel', { date: formatDate(item.created_at) })}</span>
                        <span>{t('reinvestment.profitSplit', { profit: formatCurrency(item.profit_used), cash: formatCurrency(item.cash_added) })}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {historyTotal > 10 && (
                  <div className="p-4 border-t border-border flex items-center justify-center gap-2">
                    <button
                      onClick={() => fetchHistory(historyPage - 1)}
                      disabled={historyPage <= 1}
                      className="px-3 py-1 border border-border rounded text-sm disabled:opacity-40"
                    >
                      ←
                    </button>
                    <span className="text-sm text-muted-foreground">
                      {t('reinvestment.pageInfo', { page: historyPage, total: Math.ceil(historyTotal / 10) })}
                    </span>
                    <button
                      onClick={() => fetchHistory(historyPage + 1)}
                      disabled={historyPage >= Math.ceil(historyTotal / 10)}
                      className="px-3 py-1 border border-border rounded text-sm disabled:opacity-40"
                    >
                      →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Success View */}
        {step === 'success' && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-8 shadow-card text-center">
              <div className="w-16 h-16 bg-success-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">{t('reinvestment.successTitle')}</h2>
              <p className="text-muted-foreground text-sm mb-6">
                {t('reinvestment.successDesc')}
              </p>
              <button
                onClick={handleDone}
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary transition-colors"
              >
                {t('reinvestment.viewInvestments')}
              </button>
            </div>
          </div>
        )}

        {/* Select Investment Step */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-brand-primary-600 to-brand-primary-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-8 h-8" />
                <div>
                  <h2 className="text-lg font-bold">{t('reinvestment.smartTitle')}</h2>
                  <p className="text-sm text-primary-foreground">{t('reinvestment.smartSubtitle')}</p>
                </div>
              </div>
            </div>

            {investmentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : reinvestableInvestments.length === 0 ? (
              <div className="bg-card rounded-xl p-8 shadow-card text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-info-subtle text-info">
                  <Package className="h-7 w-7" />
                </div>
                <p className="font-medium text-foreground">{t('reinvestment.noReinvestable')}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('reinvestment.noReinvestableHint')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reinvestableInvestments.map((inv) => {
                  const daysRemaining = getDaysRemaining(inv.end_date);
                  const isNearMaturity = daysRemaining <= 7 && daysRemaining > 0;

                  return (
                    <div
                      key={inv.id}
                      onClick={() => handleSelectInvestment(inv.id)}
                      className="bg-card rounded-xl p-4 shadow-card cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPackageTypeColor(inv.package_type)}`}>
                            {getPackageTypeLabel(inv.package_type)}
                          </span>
                          <span className="font-semibold text-foreground">{inv.package_name}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('reinvestment.value')}</p>
                          <p className="font-bold text-foreground">{formatCurrency(inv.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('reinvestment.availableProfit')}</p>
                          <p className="font-bold text-primary">{formatCurrency(inv.availableProfit)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {inv.status === 'completed'
                              ? t('reinvestment.statusCompleted')
                              : t('reinvestment.daysRemaining', { count: daysRemaining })}
                          </span>
                        </div>
                        {isNearMaturity && (
                          <span className="px-2 py-0.5 bg-warning-subtle text-warning-strong rounded text-xs font-medium">
                            {t('reinvestment.nearMaturity')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Select Package Step */}
        {step === 'package' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 shadow-card">
              <p className="text-sm text-muted-foreground mb-1">{t('reinvestment.originalInvestment')}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedInvestment?.package_name || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('reinvestment.valueLabel', { amount: formatCurrency(selectedInvestment?.amount || 0) })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t('reinvestment.profit')}</p>
                  <p className="font-bold text-primary">
                    {formatCurrency(selectedInvestment?.accumulated_profit || 0)}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-foreground">{t('reinvestment.chooseNewPackage')}</h3>

            <div className="space-y-3">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className="bg-card rounded-xl p-4 shadow-card cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-primary"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPackageTypeColor(pkg.type)}`}>
                        {getPackageTypeLabel(pkg.type)}
                      </span>
                      <span className="font-semibold text-foreground">{pkg.name}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('reinvestment.dailyProfitPct')}</p>
                      <p className="font-bold text-primary">{pkg.daily_profit}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('reinvestment.term')}</p>
                      <p className="font-medium">{t('reinvestment.days', { count: pkg.investment_period })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('reinvestment.minInvestment')}</p>
                      <p className="font-medium">{formatCurrency(pkg.min_investment || 0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amount Step */}
        {step === 'amount' && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPackageTypeColor(selectedPackage?.type || '')}`}>
                  {getPackageTypeLabel(selectedPackage?.type || '')}
                </span>
                <span className="font-semibold text-foreground">{selectedPackage?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('reinvestment.dailyProfitPct')}</p>
                  <p className="font-bold text-primary">{selectedPackage?.daily_profit}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('reinvestment.term')}</p>
                  <p className="font-medium">{t('reinvestment.days', { count: selectedPackage?.investment_period })}</p>
                </div>
              </div>
            </div>

            <div className="bg-info-subtle rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-info" />
                <span className="text-sm text-info font-medium">{t('reinvestment.availableProfit')}</span>
              </div>
              <p className="text-2xl font-bold text-info-strong">{formatCurrency(availableProfit)}</p>
            </div>

            <div className="bg-card rounded-xl p-4 shadow-card space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('reinvestment.profitToUse')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={profitToUse || ''}
                    onChange={(e) => setProfitToUse(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => setProfitToUse(availableProfit)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-success-subtle px-2 py-1 text-xs font-medium text-success-strong hover:bg-success/30"
                  >
                    {t('reinvestment.all')}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('reinvestment.maximum', { amount: formatCurrency(availableProfit) })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('reinvestment.cashFromWallet')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={cashToAdd || ''}
                    onChange={(e) => setCashToAdd(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => setCashToAdd(Math.min(balance, availableProfit * 2))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-warning-subtle px-2 py-1 text-xs font-medium text-warning-strong hover:bg-warning/30"
                  >
                    {t('reinvestment.max')}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('reinvestment.walletBalance', { amount: formatCurrency(balance) })}
                </p>
              </div>

              <div className="bg-background rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">{t('reinvestment.totalNewInvestment')}</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatCurrency(profitToUse + cashToAdd)}
                  </span>
                </div>
                {selectedPackage?.min_investment && (profitToUse + cashToAdd) < selectedPackage.min_investment && (
                  <div className="flex items-center gap-1 text-warning-strong text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {t('reinvestment.minAmount', { amount: formatCurrency(selectedPackage.min_investment) })}
                  </div>
                )}
              </div>

              <button
                onClick={handlePreview}
                disabled={
                  (profitToUse + cashToAdd) <= 0 ||
                  (selectedPackage?.min_investment && (profitToUse + cashToAdd) < selectedPackage.min_investment)
                }
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('common.continue')}
              </button>
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && preview && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-4 shadow-card">
              <h3 className="font-semibold text-foreground mb-4">{t('reinvestment.confirmTitle')}</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('reinvestment.packageLabel')}</span>
                  <span className="font-medium text-foreground">{preview.newInvestment.packageName}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('reinvestment.profitUsed')}</span>
                  <span className="font-medium text-info">-{formatCurrency(preview.newInvestment.profitUsed)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('reinvestment.cashFromWallet')}</span>
                  <span className="font-medium text-warning-strong">-{formatCurrency(preview.newInvestment.cashAdded)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('reinvestment.totalNewInvestment')}</span>
                  <span className="font-bold text-primary text-lg">
                    {formatCurrency(preview.newInvestment.totalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('reinvestment.dailyProfitAmount')}</span>
                  <span className="font-medium text-primary">
                    {formatCurrency(parseFloat(preview.newInvestment.dailyProfit))}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('reinvestment.term')}</span>
                  <span className="font-medium">{t('reinvestment.days', { count: preview.newInvestment.investmentPeriod })}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">{t('reinvestment.endDate')}</span>
                  <span className="font-medium">{formatDate(preview.newInvestment.endDate)}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">{t('reinvestment.expectedProfit')}</span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(parseFloat(preview.newInvestment.totalProfit))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-warning-subtle border border-warning/20 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-warning-strong flex-shrink-0 mt-0.5" />
                <div className="text-sm text-warning-strong">
                  <p className="font-medium">{t('reinvestment.warningTitle')}</p>
                  <p>{t('reinvestment.warningDesc')}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-danger-subtle border border-danger/20 rounded-xl p-4">
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('amount')}
                className="flex-1 py-3 border border-input text-foreground rounded-xl font-medium hover:bg-background transition-colors"
              >
                {t('common.back')}
              </button>
              <button
                onClick={handleExecute}
                disabled={executeLoading}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {executeLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('common.processing')}
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {t('reinvestment.confirm')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Reinvestment;
