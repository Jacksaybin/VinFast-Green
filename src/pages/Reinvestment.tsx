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
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import { useAuthStore } from '../stores/authStore';
import { useReinvestmentStore } from '../stores/reinvestmentStore';
import { useWalletStore } from '../stores/walletStore';
import { formatCurrency } from '../lib/format';

const Reinvestment: React.FC = () => {
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

  // Load investments on mount
  useEffect(() => {
    fetchInvestments();
    fetchHistory(1);
  }, []);

  // Check for investmentId in URL params
  useEffect(() => {
    const invId = searchParams.get('investmentId');
    if (invId && investments.length > 0) {
      handleSelectInvestment(invId);
    }
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
    return new Date(dateStr).toLocaleDateString('vi-VN', {
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
    switch (type) {
      case 'VIC': return 'VIC';
      case 'DC': return 'DC';
      case 'GIFT_CARD': return 'Gift Card';
      case 'REGULAR': return 'Thường';
      default: return type;
    }
  };

  const getPackageTypeColor = (type: string) => {
    switch (type) {
      case 'VIC': return 'bg-purple-100 text-purple-700';
      case 'DC': return 'bg-blue-100 text-blue-700';
      case 'GIFT_CARD': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Reinvestable investments
  const reinvestableInvestments = investments.filter(
    (inv) => inv.status === 'active' || inv.status === 'completed'
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Tái đầu tư</span>
          </button>
          <button
            onClick={() => {
              setStep(step === 'history' ? 'select' : 'history');
            }}
            className={`p-2 rounded-lg ${step === 'history' ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:text-green-600'}`}
          >
            {step === 'history' ? <ArrowLeft className="w-5 h-5" /> : <History className="w-5 h-5" />}
          </button>
        </div>

        {/* Step Indicator */}
        {step !== 'history' && step !== 'success' && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {['Chọn đầu tư', 'Chọn gói', 'Số tiền', 'Xác nhận'].map((label, idx) => {
              const stepNames = ['select', 'package', 'amount', 'confirm'];
              const currentIdx = stepNames.indexOf(step);
              const isActive = currentIdx === idx;
              const isPast = currentIdx > idx;

              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      isActive ? 'bg-green-600 text-white' :
                      isPast ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isPast ? <Check className="w-3 h-3" /> : idx + 1}
                    </div>
                    <span className={`text-xs whitespace-nowrap hidden sm:block ${
                      isActive ? 'text-green-600 font-medium' : 'text-gray-400'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-0.5 min-w-[20px] ${
                      isPast ? 'bg-green-600' : 'bg-gray-200'
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
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-500">Tổng lần</p>
                <p className="text-xl font-bold text-gray-900">{historyStats.totalReinvestments}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-gray-500">Tổng giá trị</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(historyStats.totalAmount)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">Lợi nhuận sử dụng</p>
                <p className="font-medium text-blue-600">{formatCurrency(historyStats.totalProfitUsed)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Tiền mặt thêm</p>
                <p className="font-medium text-orange-600">{formatCurrency(historyStats.totalCashAdded)}</p>
              </div>
            </div>

            {/* History List */}
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : history.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Chưa có lịch sử tái đầu tư</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPackageTypeColor(item.package_type)}`}>
                            {getPackageTypeLabel(item.package_type)}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {item.package_name || 'N/A'}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Ngày: {formatDate(item.created_at)}</span>
                        <span>Sinh lời: {formatCurrency(item.profit_used)} | Thêm: {formatCurrency(item.cash_added)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {historyTotal > 10 && (
                  <div className="p-4 border-t border-gray-100 flex items-center justify-center gap-2">
                    <button
                      onClick={() => fetchHistory(historyPage - 1)}
                      disabled={historyPage <= 1}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                    >
                      ←
                    </button>
                    <span className="text-sm text-gray-500">
                      Trang {historyPage} / {Math.ceil(historyTotal / 10)}
                    </span>
                    <button
                      onClick={() => fetchHistory(historyPage + 1)}
                      disabled={historyPage >= Math.ceil(historyTotal / 10)}
                      className="px-3 py-1 border rounded text-sm disabled:opacity-40"
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
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tái đầu tư thành công!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Đầu tư mới của bạn đã được tạo thành công.
                <br />
                Lợi nhuận sẽ được cộng hàng ngày vào tài khoản.
              </p>
              <button
                onClick={handleDone}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                Xem danh sách đầu tư
              </button>
            </div>
          </div>
        )}

        {/* Select Investment Step */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-8 h-8" />
                <div>
                  <h2 className="text-lg font-bold">Tái đầu tư thông minh</h2>
                  <p className="text-sm text-green-100">Sử dụng lợi nhuận để tái đầu tư</p>
                </div>
              </div>
            </div>

            {investmentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : reinvestableInvestments.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Chưa có đầu tư nào có thể tái đầu tư</p>
                <p className="text-gray-400 text-xs mt-1">
                  Hãy đầu tư trước để có thể tái đầu tư sau
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
                      className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPackageTypeColor(inv.package_type)}`}>
                            {getPackageTypeLabel(inv.package_type)}
                          </span>
                          <span className="font-semibold text-gray-900">{inv.package_name}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Giá trị</p>
                          <p className="font-bold text-gray-900">{formatCurrency(inv.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Lợi nhuận khả dụng</p>
                          <p className="font-bold text-green-600">{formatCurrency(inv.availableProfit)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {inv.status === 'completed' ? (
                              'Đã kết thúc'
                            ) : (
                              `Còn ${daysRemaining} ngày`
                            )}
                          </span>
                        </div>
                        {isNearMaturity && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs font-medium">
                            Sắp đáo hạn
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
            {/* Selected Investment Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Đầu tư gốc</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedInvestment?.package_name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Giá trị: {formatCurrency(selectedInvestment?.amount || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Lợi nhuận</p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(selectedInvestment?.accumulated_profit || 0)}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900">Chọn gói đầu tư mới</h3>

            <div className="space-y-3">
              {availablePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => handleSelectPackage(pkg)}
                  className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-green-500"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPackageTypeColor(pkg.type)}`}>
                        {getPackageTypeLabel(pkg.type)}
                      </span>
                      <span className="font-semibold text-gray-900">{pkg.name}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Lợi nhuận/ngày</p>
                      <p className="font-bold text-green-600">{pkg.daily_profit}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Kỳ hạn</p>
                      <p className="font-medium">{pkg.investment_period} ngày</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Tối thiểu</p>
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
            {/* Package Info */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPackageTypeColor(selectedPackage?.type || '')}`}>
                  {getPackageTypeLabel(selectedPackage?.type || '')}
                </span>
                <span className="font-semibold text-gray-900">{selectedPackage?.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-400">Lợi nhuận/ngày</p>
                  <p className="font-bold text-green-600">{selectedPackage?.daily_profit}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Kỳ hạn</p>
                  <p className="font-medium">{selectedPackage?.investment_period} ngày</p>
                </div>
              </div>
            </div>

            {/* Available Profit */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Lợi nhuận khả dụng</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(availableProfit)}</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
              {/* Profit to use */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sử dụng lợi nhuận
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={profitToUse || ''}
                    onChange={(e) => setProfitToUse(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => setProfitToUse(availableProfit)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200"
                  >
                    Tất cả
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tối đa: {formatCurrency(availableProfit)}
                </p>
              </div>

              {/* Cash to add */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thêm tiền từ ví
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={cashToAdd || ''}
                    onChange={(e) => setCashToAdd(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => setCashToAdd(Math.min(balance, availableProfit * 2))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium hover:bg-orange-200"
                  >
                    Tối đa
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Số dư ví: {formatCurrency(balance)}
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Tổng đầu tư mới</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(profitToUse + cashToAdd)}
                  </span>
                </div>
                {selectedPackage?.min_investment && (profitToUse + cashToAdd) < selectedPackage.min_investment && (
                  <div className="flex items-center gap-1 text-orange-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Tối thiểu: {formatCurrency(selectedPackage.min_investment)}
                  </div>
                )}
              </div>

              <button
                onClick={handlePreview}
                disabled={
                  (profitToUse + cashToAdd) <= 0 ||
                  (selectedPackage?.min_investment && (profitToUse + cashToAdd) < selectedPackage.min_investment)
                }
                className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && preview && (
          <div className="space-y-4">
            {/* Preview Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Xác nhận tái đầu tư</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Gói đầu tư</span>
                  <span className="font-medium text-gray-900">{preview.newInvestment.packageName}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Lợi nhuận sử dụng</span>
                  <span className="font-medium text-blue-600">-{formatCurrency(preview.newInvestment.profitUsed)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tiền thêm từ ví</span>
                  <span className="font-medium text-orange-600">-{formatCurrency(preview.newInvestment.cashAdded)}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Tổng đầu tư mới</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(preview.newInvestment.totalAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Lợi nhuận/ngày</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(parseFloat(preview.newInvestment.dailyProfit))}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Kỳ hạn</span>
                  <span className="font-medium">{preview.newInvestment.investmentPeriod} ngày</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Ngày kết thúc</span>
                  <span className="font-medium">{formatDate(preview.newInvestment.endDate)}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Tổng lợi nhuận dự kiến</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(parseFloat(preview.newInvestment.totalProfit))}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Lưu ý:</p>
                  <p>Khi tái đầu tư, đầu tư cũ sẽ được đánh dấu là đã kết thúc và không còn sinh lời.</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('amount')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={handleExecute}
                disabled={executeLoading}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {executeLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Xác nhận
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
