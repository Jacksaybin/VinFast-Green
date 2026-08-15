/**
 * Investment form component - Processes investment transactions with store integration
 */

import React, { useState } from 'react';
import { X, Calculator, Shield, AlertTriangle, CheckCircle, CreditCard, Wallet, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InvestmentPackage as PkgType } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useWalletStore } from '../stores/walletStore';
import { useInvestmentStore } from '../stores/investmentStore';
import { useNotificationStore } from '../stores/notificationStore';
import { formatCurrency } from '../lib/format';

interface InvestmentFormProps {
  pkg: PkgType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type StepKey = 'amount' | 'payment' | 'confirm' | 'success';

const InvestmentForm: React.FC<InvestmentFormProps> = ({ pkg, isOpen, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'vi';
  const user = useAuthStore((s) => s.user);
  const { balance } = useWalletStore();
  const { createInvestment } = useInvestmentStore();
  const { addNotification } = useNotificationStore();

  const [step, setStep] = useState<StepKey>('amount');
  const [investmentAmount, setInvestmentAmount] = useState<number>(pkg.investmentAmount);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'wallet' | 'card'>('wallet');
  const [shares, setShares] = useState<number>(1);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const minAmount = pkg.details?.minimumInvestment ?? pkg.investmentAmount;
  const maxShares = pkg.details?.maxPurchaseLimit ?? 999;

  const calculateProfit = () => {
    const dailyProfit = (investmentAmount * pkg.dailyProfit) / 100;
    const totalProfit = dailyProfit * pkg.investmentPeriod;
    const totalReturn = investmentAmount + totalProfit;
    return { dailyProfit, totalProfit, totalReturn };
  };

  const profit = calculateProfit();

  const handleAmountChange = (value: number) => {
    const safeValue = Math.max(minAmount, value);
    const newShares = Math.floor(safeValue / pkg.investmentAmount);
    setShares(newShares);
    setInvestmentAmount(safeValue);
  };

  const handleSharesChange = (value: number) => {
    const safeShares = Math.max(1, Math.min(value, maxShares));
    setShares(safeShares);
    setInvestmentAmount(safeShares * pkg.investmentAmount);
  };

  const paymentMethods = [
    {
      id: 'wallet' as const,
      name: t('investmentForm.walletMethod'),
      icon: <Wallet className="w-5 h-5" />,
      description: t('investmentForm.walletMethodDesc'),
      fee: '0 VND',
      recommended: true,
    },
    {
      id: 'bank' as const,
      name: t('investmentForm.bankMethod'),
      icon: <Building2 className="w-5 h-5" />,
      description: t('investmentForm.bankMethodDesc'),
      fee: '0 VND',
      recommended: false,
    },
    {
      id: 'card' as const,
      name: t('investmentForm.cardMethod'),
      icon: <CreditCard className="w-5 h-5" />,
      description: t('investmentForm.cardMethodDesc'),
      fee: '1.5%',
      recommended: false,
    },
  ];

  const handleConfirmInvestment = async () => {
    if (!user) {
      setError(t('investmentForm.loginRequired'));
      return;
    }

    if (investmentAmount < minAmount) {
      setError(t('investmentForm.minAmount', { amount: formatCurrency(minAmount, locale) }));
      return;
    }

    if (paymentMethod === 'wallet' && balance < investmentAmount) {
      setError(t('investmentForm.insufficientBalance', { amount: formatCurrency(investmentAmount - balance, locale) }));
      return;
    }

    setIsProcessing(true);
    setError('');

    const result = await createInvestment(user.id, pkg, investmentAmount);

    if (!result.success) {
      setError(result.error || t('investmentForm.failed'));
      setIsProcessing(false);
      return;
    }

    if (paymentMethod === 'wallet') {
      useWalletStore.getState().refresh?.();
    }

    addNotification({
      userId: user.id,
      title: t('investmentForm.successTitle'),
      message: t('investmentForm.successMessage', { amount: formatCurrency(investmentAmount, locale), pkg: pkg.name.split('(')[0].trim() }),
      type: 'transaction',
      link: '/my-account',
    });

    setStep('success');
    setIsProcessing(false);
    onSuccess?.();
  };

  const handleClose = () => {
    if (step !== 'success') {
      if (!confirm(t('investmentForm.confirmCancel'))) return;
    }
    setStep('amount');
    setInvestmentAmount(pkg.investmentAmount);
    setShares(1);
    setAgreedTerms(false);
    setError('');
    onClose();
  };

  const renderAmountStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">{t('investmentForm.chooseAmount')}</h3>

        {/* Package Info */}
        <div className="bg-success-subtle p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-success-strong">{pkg.name.split('(')[0].trim()}</h4>
            <span className="rounded-full bg-success px-2 py-0.5 text-xs font-medium text-primary-foreground">
              {pkg.category === 'premium' ? 'Premium' : pkg.category === 'standard' ? 'Standard' : 'Basic'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-primary">{t('investmentForm.dailyProfitLabel')}:</span>
              <span className="font-bold text-success-strong">{pkg.dailyProfit}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary">{t('investmentForm.termLabel')}:</span>
              <span className="font-bold text-success-strong">{pkg.investmentPeriod} {t('investmentForm.days')}</span>
            </div>
          </div>
          {pkg.details?.schedulingBonus && (
            <div className="mt-2 text-xs text-success-strong bg-success-subtle rounded px-2 py-1 inline-block">
              {t('investmentForm.schedulingBonus', { amount: formatCurrency(pkg.details.schedulingBonus, locale) })}
            </div>
          )}
        </div>

        {/* Balance check */}
        {paymentMethod === 'wallet' && (
          <div className="flex items-center justify-between rounded-lg bg-info-subtle p-3 text-sm">
            <span className="text-info">{t('investmentForm.walletBalance')}:</span>
            <span className="font-bold text-info-strong">{formatCurrency(balance, locale)}</span>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('investmentForm.amountLabel')}
            </label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              min={minAmount}
              step={pkg.investmentAmount}
              className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('investmentForm.minimumLabel')}: {formatCurrency(minAmount, locale)}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">
                {t('investmentForm.sharesLabel', { amount: formatCurrency(pkg.investmentAmount, locale) })}
              </label>
              <span className="text-xs text-muted-foreground">{t('investmentForm.maxShares', { count: maxShares })}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSharesChange(shares - 1)}
                className="w-10 h-10  rounded-xl font-bold text-foreground  transition-colors"
                aria-label={t('common.decrease')}
              >
                −
              </button>
              <input
                type="number"
                value={shares}
                onChange={(e) => handleSharesChange(Number(e.target.value))}
                min={1}
                max={maxShares}
                className="flex-1 px-4 py-2 border border-input rounded-xl text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => handleSharesChange(shares + 1)}
                className="w-10 h-10  rounded-xl font-bold text-foreground  transition-colors"
                aria-label={t('common.increase')}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Profit Calculation */}
        <div className="bg-background p-4 rounded-xl mt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground text-sm">{t('investmentForm.estimatedProfit')}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('investmentForm.dailyInterest')}:</span>
              <span className="font-medium text-primary">{formatCurrency(profit.dailyProfit, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('investmentForm.totalInterest', { days: pkg.investmentPeriod })}:</span>
              <span className="font-medium text-primary">{formatCurrency(profit.totalProfit, locale)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium text-foreground">{t('investmentForm.totalReturn')}:</span>
              <span className="font-bold text-primary">{formatCurrency(profit.totalReturn, locale)}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger-subtle text-danger-strong text-sm rounded-lg">{error}</div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={handleClose}
          className="flex-1 bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-muted/70 transition-colors"
        >
          {t('investmentForm.cancel')}
        </button>
        <button
          onClick={() => { setError(''); setStep('payment'); }}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors"
        >
          {t('investmentForm.continue')}
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">{t('investmentForm.paymentMethod')}</h3>

        {/* Wallet balance reminder */}
        <div className="flex items-center justify-between text-sm bg-info-subtle p-3 rounded-xl mb-4">
          <span className="text-info">{t('investmentForm.availableBalance')}:</span>
          <span className="font-bold text-info-strong">{formatCurrency(balance, locale)}</span>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const isDisabled = method.id === 'wallet' && balance < investmentAmount;
            return (
              <div
                key={method.id}
                onClick={() => !isDisabled && setPaymentMethod(method.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  isDisabled
                    ? 'border-border opacity-50 cursor-not-allowed'
                    : paymentMethod === method.id
                    ? 'border-primary bg-success-subtle'
                    : 'border-border hover:border-input'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    paymentMethod === method.id && !isDisabled
                      ? 'bg-success-subtle text-primary'
                      : ' text-muted-foreground'
                  }`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{method.name}</h4>
                      {method.recommended && !isDisabled && (
                        <span className="rounded bg-success/30 px-1.5 py-0.5 text-xs font-medium text-success-strong">
                          {t('investmentForm.recommended')}
                        </span>
                      )}
                      {isDisabled && (
                        <span className="text-xs bg-danger-subtle text-danger-strong px-1.5 py-0.5 rounded font-medium">
                          {t('investmentForm.insufficient')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{t('investmentForm.fee')}: {method.fee}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-info-subtle p-4 rounded-xl mt-4">
          <h4 className="font-medium text-info-strong mb-2 text-sm">{t('investmentForm.summary')}</h4>
          <div className="space-y-1 text-sm text-info">
            <div className="flex justify-between">
              <span>{t('investmentForm.package')}:</span>
              <span className="font-medium">{pkg.name.split('(')[0].trim()}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('investmentForm.amount')}:</span>
              <span className="font-medium">{formatCurrency(investmentAmount, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('investmentForm.shares')}:</span>
              <span className="font-medium">{shares}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('amount')}
          className="flex-1 bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-muted/70 transition-colors"
        >
          {t('common.back')}
        </button>
        <button
          onClick={() => setStep('confirm')}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors"
        >
          {t('investmentForm.continue')}
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">{t('investmentForm.confirmTitle')}</h3>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-brand-primary-50 to-brand-accent-50 p-4 rounded-xl mb-4 border border-brand-primary-200">
          <h4 className="font-semibold text-foreground mb-3">{t('investmentForm.investmentDetails')}</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('investmentForm.packageLabel')}:</span>
              <span className="font-medium">{pkg.name.split('(')[0].trim()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('investmentForm.amountLabel')}:</span>
              <span className="font-bold text-primary">{formatCurrency(investmentAmount, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('investmentForm.interestRate')}:</span>
              <span className="font-medium text-primary">{pkg.dailyProfit}%/{t('investmentForm.day')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('investmentForm.term')}:</span>
              <span className="font-medium">{pkg.investmentPeriod} {t('investmentForm.days')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('investmentForm.paymentLabel')}:</span>
              <span className="font-medium">
                {paymentMethod === 'wallet' ? t('investmentForm.walletMethod') : paymentMethod === 'bank' ? t('investmentForm.bankMethod') : t('investmentForm.cardMethod')}
              </span>
            </div>
            {paymentMethod === 'wallet' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('investmentForm.afterDeduction')}:</span>
                <span className="font-bold text-warning-strong">
                  {formatCurrency(balance - investmentAmount, locale)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold text-foreground">{t('investmentForm.expectedReturn')}:</span>
              <span className="font-bold text-primary">{formatCurrency(profit.totalReturn, locale)}</span>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="bg-warning-subtle p-4 rounded-xl border border-warning/30">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-warning-strong mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium  mb-1">{t('investmentForm.riskWarning')}</h4>
              <ul className="text-sm text-warning/85 space-y-1">
                <li>• {t('investmentForm.risk1')}</li>
                <li>• {t('investmentForm.risk2')}</li>
                <li>• {t('investmentForm.risk3')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-3 mt-4">
          <input
            type="checkbox"
            id="terms"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary"
          />
          <label htmlFor="terms" className="text-sm text-foreground leading-5">
            {t('investmentForm.termsPrefix')}{' '}
            <a href="#" className="text-primary hover:text-primary">
              {t('investmentForm.termsLink')}
            </a>{' '}
            {t('investmentForm.termsSuffix')}
          </label>
        </div>

        {error && (
          <div className="p-3 bg-danger-subtle text-danger-strong text-sm rounded-lg">{error}</div>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('payment')}
          className="flex-1 bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-muted/70 transition-colors"
        >
          {t('common.back')}
        </button>
        <button
          onClick={handleConfirmInvestment}
          disabled={!agreedTerms || isProcessing}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('investmentForm.processing')}</span>
            </>
          ) : (
            t('investmentForm.confirmInvestment')
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-5">
      <div className="w-20 h-20 bg-success-subtle rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-primary" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-foreground mb-2">{t('investmentForm.successHeading')}</h3>
        <p className="text-muted-foreground">
          {t('investmentForm.successDesc', {
            amount: formatCurrency(investmentAmount, locale),
            pkg: pkg.name.split('(')[0].trim(),
          })}
        </p>
      </div>

      <div className="bg-success-subtle p-4 rounded-xl text-left">
        <h4 className="font-semibold text-success-strong mb-3">{t('investmentForm.investmentInfo')}</h4>
        <div className="space-y-2 text-sm text-success-strong">
          <div className="flex justify-between">
            <span>{t('investmentForm.transactionCode')}:</span>
            <span className="font-mono font-medium">INV{pkg.id.slice(0, 4).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('investmentForm.amount')}:</span>
            <span className="font-bold">{formatCurrency(investmentAmount, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('investmentForm.startDate')}:</span>
            <span className="font-medium">{new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('investmentForm.maturityDate')}:</span>
            <span className="font-medium">
              {new Date(Date.now() + pkg.investmentPeriod * 24 * 60 * 60 * 1000).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('investmentForm.dailyProfitLabel')}:</span>
            <span className="font-medium text-primary">{formatCurrency(profit.dailyProfit, locale)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-info-subtle p-3 rounded-xl">
        <Shield className="w-5 h-5 text-info flex-shrink-0" />
        <p className="text-xs text-info-strong text-left">
          {t('investmentForm.successNote')}
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleClose}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary transition-colors"
        >
          {t('investmentForm.viewList')}
        </button>
        <button
          onClick={handleClose}
          className="w-full text-muted-foreground py-2 text-sm hover:text-foreground transition-colors"
        >
          {t('investmentForm.close')}
        </button>
      </div>
    </div>
  );

  const stepLabels: Record<StepKey, string> = {
    amount: t('investmentForm.stepAmount'),
    payment: t('investmentForm.stepPayment'),
    confirm: t('investmentForm.stepConfirm'),
    success: t('investmentForm.stepSuccess'),
  };
  const steps: StepKey[] = ['amount', 'payment', 'confirm', 'success'];
  const currentIndex = steps.indexOf(step);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {stepLabels[step]}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{pkg.name.split('(')[0].trim()}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover: rounded-full transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    currentIndex >= i
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{t('investmentForm.stepAmount')}</span>
            <span>{t('investmentForm.stepPayment')}</span>
            <span>{t('investmentForm.stepConfirm')}</span>
            <span>{t('investmentForm.stepDone')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {step === 'amount' && renderAmountStep()}
          {step === 'payment' && renderPaymentStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default InvestmentForm;
