/**
 * Investment Overview component - Displays investment summary cards
 */

import React from 'react';
import { TrendingUp, Eye, Clock } from 'lucide-react';

const InvestmentOverview: React.FC = () => {
  const investments = [
    {
      id: 'VIC07',
      amount: '1.0 tỷ',
      profit: '+45 triệu',
      profitPercent: '4.5%',
      type: 'Gói 12 tháng',
      status: 'Đang hoạt động',
      date: '15/03/2024'
    },
    {
      id: 'VIC08', 
      amount: '500 triệu',
      profit: '+15 triệu',
      profitPercent: '3.0%',
      type: 'Gói 6 tháng',
      status: 'Hoàn thành',
      date: '01/01/2024'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
          Gói đầu tư nổi bật
        </h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
          <Eye className="w-4 h-4 mr-1" />
          Xem tất cả
        </button>
      </div>

      <div className="space-y-3">
        {investments.map((investment) => (
          <div key={investment.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{investment.id}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                investment.status === 'Đang hoạt động' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {investment.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex space-x-4">
                <div>
                  <p className="text-gray-600">{investment.amount}</p>
                  <p className="text-xs text-gray-500">{investment.type}</p>
                </div>
                <div>
                  <p className="font-medium text-green-600">{investment.profit}</p>
                  <p className="text-xs text-gray-500">({investment.profitPercent})</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {investment.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">Tổng lợi nhuận</p>
            <p className="text-lg font-bold text-green-600">+60 triệu VND</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-700">Tỷ suất trung bình</p>
            <p className="text-lg font-bold text-green-600">3.75%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentOverview;
