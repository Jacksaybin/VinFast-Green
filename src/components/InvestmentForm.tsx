/**
 * Investment form component - Processes investment transactions with store integration
 */

import React, { useState } from 'react';
import { X, Calculator, Shield, AlertTriangle, CheckCircle, CreditCard, Wallet, Building2 } from 'lucide-react';
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

const InvestmentForm: React.FC<InvestmentFormProps> = ({ pkg, isOpen, onClose, onSuccess }) => {
  const user = useAuthStore((s) => s.user);
  const { balance } = useWalletStore();
  const { createInvestment } = useInvestmentStore();
  const { addNotification } = useNotificationStore();

  const [step, setStep] = useState<'amount' | 'payment' | 'confirm' | 'success'>('amount');
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
      name: 'Số dư ví V-GREEN',
      icon: <Wallet className="w-5 h-5" />,
      description: 'Thanh toán từ số dư khả dụng',
      fee: '0 VND',
      recommended: true,
    },
    {
      id: 'bank' as const,
      name: 'Chuyển khoản ngân hàng',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Chuyển khoản qua ngân hàng',
      fee: '0 VND',
      recommended: false,
    },
    {
      id: 'card' as const,
      name: 'Thẻ tín dụng',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Thanh toán bằng thẻ',
      fee: '1.5%',
      recommended: false,
    },
  ];

  const handleConfirmInvestment = async () => {
    if (!user) {
      setError('Vui lòng đăng nhập để tiếp tục');
      return;
    }

    if (investmentAmount < minAmount) {
      setError(`Số tiền tối thiểu là ${formatCurrency(minAmount)}`);
      return;
    }

    if (paymentMethod === 'wallet' && balance < investmentAmount) {
      setError(`Số dư ví không đủ. Bạn cần ${formatCurrency(investmentAmount - balance)} nữa`);
      return;
    }

    setIsProcessing(true);
    setError('');

    // Backend handles wallet deduction atomically inside createInvestment.
    // Do not call deductBalance locally to avoid double-spend.
    const result = await createInvestment(user.id, pkg, investmentAmount);

    if (!result.success) {
      setError(result.error || 'Không thể thực hiện đầu tư');
      setIsProcessing(false);
      return;
    }

    // Refresh wallet balance to reflect backend deduction
    if (paymentMethod === 'wallet') {
      useWalletStore.getState().refresh?.();
    }

    addNotification({
      userId: user.id,
      title: 'Đầu tư thành công',
      message: `Bạn đã đầu tư ${formatCurrency(investmentAmount)} vào gói ${pkg.name.split('(')[0].trim()}.`,
      type: 'transaction',
      link: '/my-account',
    });

    setStep('success');
    setIsProcessing(false);
    onSuccess?.();
  };

  const handleClose = () => {
    if (step !== 'success') {
      if (!confirm('Bạn có chắc muốn hủy đầu tư không?')) return;
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
        <h3 className="text-lg font-semibold text-foreground mb-3">Chọn số tiền đầu tư</h3>

        {/* Package Info */}
        <div className="bg-success-subtle p-4 rounded-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-success-strong">{pkg.name.split('(')[0].trim()}</h4>
            <span className="text-xs bg-green-200 text-success-strong px-2 py-0.5 rounded-full font-medium">
              {pkg.category === 'premium' ? 'Premium' : pkg.category === 'standard' ? 'Standard' : 'Basic'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="text-primary">Lãi/ngày:</span>
              <span className="font-bold text-success-strong">{pkg.dailyProfit}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-primary">Kỳ hạn:</span>
              <span className="font-bold text-success-strong">{pkg.investmentPeriod} ngày</span>
            </div>
          </div>
          {pkg.details?.schedulingBonus && (
            <div className="mt-2 text-xs text-success-strong bg-success-subtle rounded px-2 py-1 inline-block">
              Thưởng đặt lịch: +{formatCurrency(pkg.details.schedulingBonus)}
            </div>
          )}
        </div>

        {/* Balance check */}
        {paymentMethod === 'wallet' && (
          <div className="flex items-center justify-between text-sm bg-info-subtle p-3 rounded-lg mb-3">
            <span className="text-blue-700">Số dư ví:</span>
            <span className="font-bold text-blue-900">{formatCurrency(balance)}</span>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Số tiền đầu tư (VND)
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
              Tối thiểu: {formatCurrency(minAmount)}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-foreground">
                Số gói ({formatCurrency(pkg.investmentAmount)}/gói)
              </label>
              <span className="text-xs text-muted-foreground">Tối đa: {maxShares} gói</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSharesChange(shares - 1)}
                className="w-10 h-10 bg-gray-100 rounded-xl font-bold text-foreground hover:bg-gray-200 transition-colors"
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
                className="w-10 h-10 bg-gray-100 rounded-xl font-bold text-foreground hover:bg-gray-200 transition-colors"
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
            <span className="font-medium text-foreground text-sm">Ước tính lợi nhuận</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lãi hàng ngày:</span>
              <span className="font-medium text-primary">{formatCurrency(profit.dailyProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng lãi ({pkg.investmentPeriod} ngày):</span>
              <span className="font-medium text-primary">{formatCurrency(profit.totalProfit)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium text-foreground">Tổng thu về:</span>
              <span className="font-bold text-primary">{formatCurrency(profit.totalReturn)}</span>
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
          className="flex-1 bg-gray-200 text-foreground py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={() => { setError(''); setStep('payment'); }}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Phương thức thanh toán</h3>

        {/* Wallet balance reminder */}
        <div className="flex items-center justify-between text-sm bg-info-subtle p-3 rounded-xl mb-4">
          <span className="text-blue-700">Số dư ví khả dụng:</span>
          <span className="font-bold text-blue-900">{formatCurrency(balance)}</span>
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
                      : 'bg-gray-100 text-muted-foreground'
                  }`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{method.name}</h4>
                      {method.recommended && !isDisabled && (
                        <span className="text-xs bg-green-200 text-success-strong px-1.5 py-0.5 rounded font-medium">
                          Đề xuất
                        </span>
                      )}
                      {isDisabled && (
                        <span className="text-xs bg-danger-subtle text-danger-strong px-1.5 py-0.5 rounded font-medium">
                          Không đủ
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">Phí: {method.fee}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-info-subtle p-4 rounded-xl mt-4">
          <h4 className="font-medium text-blue-900 mb-2 text-sm">Tóm tắt</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <div className="flex justify-between">
              <span>Gói:</span>
              <span className="font-medium">{pkg.name.split('(')[0].trim()}</span>
            </div>
            <div className="flex justify-between">
              <span>Số tiền:</span>
              <span className="font-medium">{formatCurrency(investmentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Số gói:</span>
              <span className="font-medium">{shares}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('amount')}
          className="flex-1 bg-gray-200 text-foreground py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
        >
          Quay lại
        </button>
        <button
          onClick={() => setStep('confirm')}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Xác nhận đầu tư</h3>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl mb-4">
          <h4 className="font-semibold text-foreground mb-3">Chi tiết đầu tư</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gói đầu tư:</span>
              <span className="font-medium">{pkg.name.split('(')[0].trim()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số tiền:</span>
              <span className="font-bold text-primary">{formatCurrency(investmentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lãi suất:</span>
              <span className="font-medium text-primary">{pkg.dailyProfit}%/ngày</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kỳ hạn:</span>
              <span className="font-medium">{pkg.investmentPeriod} ngày</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thanh toán:</span>
              <span className="font-medium">
                {paymentMethod === 'wallet' ? 'Số dư ví' : paymentMethod === 'bank' ? 'Ngân hàng' : 'Thẻ tín dụng'}
              </span>
            </div>
            {paymentMethod === 'wallet' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sau khi trừ:</span>
                <span className="font-bold text-orange-600">
                  {formatCurrency(balance - investmentAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold text-foreground">Tổng thu về dự kiến:</span>
              <span className="font-bold text-primary">{formatCurrency(profit.totalReturn)}</span>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="bg-warning-subtle p-4 rounded-xl border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-warning-strong mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Cảnh báo rủi ro</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Đầu tư có thể mang lại lợi nhuận nhưng cũng có rủi ro</li>
                <li>• Chỉ đầu tư số tiền bạn có thể chấp nhận mất</li>
                <li>• Đọc kỹ điều khoản trước khi đầu tư</li>
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
            Tôi đã đọc và đồng ý với{' '}
            <a href="#" className="text-primary hover:text-primary">
              điều khoản và điều kiện
            </a>{' '}
            của V-GREEN. Tôi hiểu rằng đầu tư có thể có rủi ro.
          </label>
        </div>

        {error && (
          <div className="p-3 bg-danger-subtle text-danger-strong text-sm rounded-lg">{error}</div>
        )}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('payment')}
          className="flex-1 bg-gray-200 text-foreground py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
        >
          Quay lại
        </button>
        <button
          onClick={handleConfirmInvestment}
          disabled={!agreedTerms || isProcessing}
          className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            'Xác nhận đầu tư'
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
        <h3 className="text-xl font-bold text-foreground mb-2">Đầu tư thành công!</h3>
        <p className="text-muted-foreground">
          Bạn đã đầu tư <span className="font-semibold text-primary">{formatCurrency(investmentAmount)}</span>{' '}
          vào gói <span className="font-semibold">{pkg.name.split('(')[0].trim()}</span>
        </p>
      </div>

      <div className="bg-success-subtle p-4 rounded-xl text-left">
        <h4 className="font-semibold text-success-strong mb-3">Thông tin đầu tư</h4>
        <div className="space-y-2 text-sm text-success-strong">
          <div className="flex justify-between">
            <span>Mã giao dịch:</span>
            <span className="font-mono font-medium">INV{pkg.id.slice(0, 4).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span>Số tiền:</span>
            <span className="font-bold">{formatCurrency(investmentAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ngày bắt đầu:</span>
            <span className="font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Ngày đáo hạn:</span>
            <span className="font-medium">
              {new Date(Date.now() + pkg.investmentPeriod * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Lãi/ngày:</span>
            <span className="font-medium text-primary">{formatCurrency(profit.dailyProfit)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-info-subtle p-3 rounded-xl">
        <Shield className="w-5 h-5 text-info flex-shrink-0" />
        <p className="text-xs text-info-strong text-left">
          Lợi nhuận sẽ được cộng vào ví hàng ngày. Bạn có thể theo dõi trong mục "Tài khoản của tôi".
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleClose}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary transition-colors"
        >
          Xem danh sách đầu tư
        </button>
        <button
          onClick={handleClose}
          className="w-full text-muted-foreground py-2 text-sm hover:text-foreground transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );

  const stepLabels = {
    amount: 'Số tiền',
    payment: 'Thanh toán',
    confirm: 'Xác nhận',
    success: 'Thành công',
  };

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
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            {(['amount', 'payment', 'confirm', 'success'] as const).map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    ['amount', 'payment', 'confirm', 'success'].indexOf(step) >= i
                      ? 'bg-primary'
                      : 'bg-gray-200'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Số tiền</span>
            <span>Thanh toán</span>
            <span>Xác nhận</span>
            <span>Xong</span>
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
