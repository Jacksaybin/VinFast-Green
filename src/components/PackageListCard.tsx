/**
 * Thẻ hiển thị gói đầu tư trên trang Investment
 */

import React from 'react';
import { TrendingUp, Clock, Zap } from 'lucide-react';
import { InvestmentPackage } from '../types';
import { formatCurrency } from '../lib/format';

interface PackageListCardProps {
  pkg: InvestmentPackage;
  onInvest: (pkg: InvestmentPackage) => void;
  onViewDetail: (pkg: InvestmentPackage) => void;
}

const PackageListCard: React.FC<PackageListCardProps> = ({ pkg, onInvest, onViewDetail }) => {
  const categoryColors = {
    premium: 'from-purple-500 to-purple-600',
    standard: 'from-blue-500 to-blue-600',
    basic: 'from-green-500 to-green-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-40 h-32 sm:h-auto flex-shrink-0">
          <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium text-white rounded bg-gradient-to-r ${categoryColors[pkg.category]}`}
              >
                {pkg.category.toUpperCase()}
              </span>
              <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">{pkg.name}</h3>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-green-600">{pkg.dailyProfit}%</div>
              <div className="text-xs text-gray-500">/ ngày</div>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{pkg.description}</p>

          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-gray-500">Tối thiểu</div>
              <div className="font-semibold text-gray-900">{formatCurrency(pkg.investmentAmount)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Kỳ hạn
              </div>
              <div className="font-semibold text-gray-900">{pkg.investmentPeriod} ngày</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-gray-500 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> Quy mô
              </div>
              <div className="font-semibold text-gray-900">{formatCurrency(pkg.projectScale)}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewDetail(pkg)}
              className="flex-1 py-2 px-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Chi tiết
            </button>
            <button
              onClick={() => onInvest(pkg)}
              className="flex-1 py-2 px-3 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
            >
              <TrendingUp className="w-4 h-4" />
              Đầu tư
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageListCard;
