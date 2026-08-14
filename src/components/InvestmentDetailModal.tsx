/**
 * Investment detail modal component - Shows detailed information about investment packages
 */

import React from 'react';
import { X, Award } from 'lucide-react';
import { InvestmentPackage } from '../types';

interface InvestmentDetailModalProps {
  package: InvestmentPackage;
  isOpen: boolean;
  onClose: () => void;
}

const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({ package: pkg, isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatPercent = (percent: number): string => {
    return `${percent}%`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Chi tiết gói đầu tư</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Detailed Information */}
          {pkg.details && (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Phương pháp chia lợi nhuận</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{pkg.details.profitSharingMethod}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Số tiền đầu tư tối thiểu</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(pkg.details.minimumInvestment)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Đầu tư không có rủi ro</span>
                <span className="text-sm font-medium text-green-600">{formatPercent(pkg.details.riskFree)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Số tiền dự án</span>
                <span className="text-sm font-medium">{formatCurrency(pkg.details.projectAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Lợi nhuận</span>
                <span className="text-sm font-medium">Tỷ lệ {formatPercent(pkg.details.profitRate)} thu nhập (vốn và lãi)</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Giới hạn mua</span>
                <span className="text-sm font-medium">{pkg.details.maxPurchaseLimit} phần</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Tính toán lợi nhuận</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{pkg.details.profitCalculation}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Phương pháp đổi khoản</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{pkg.details.redemptionMethod}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Thời gian giải quyết</span>
                <span className="text-sm font-medium">{pkg.details.settlementTime}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Số đầu tư</span>
                <span className="text-sm font-medium">{pkg.details.investmentNumber}</span>
              </div>

              {/* Project Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Bản tóm tắt dự án
                </h5>
                <p className="text-sm text-blue-700">{pkg.details.projectSummary}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Đóng
            </button>
            <button className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors">
              Đầu tư ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDetailModal;
