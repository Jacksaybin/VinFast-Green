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
    <div className="bg-card rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <TrendingUp className="w-5 h-5 text-primary mr-2" />
          Gói đầu tư nổi bật
        </h3>
        <button className="text-info hover:text-blue-700 text-sm font-medium flex items-center">
          <Eye className="w-4 h-4 mr-1" />
          Xem tất cả
        </button>
      </div>

      <div className="space-y-3">
        {investments.map((investment) => (
          <div key={investment.id} className="p-3 border rounded-lg hover:bg-background transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground">{investment.id}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                investment.status === 'Đang hoạt động' 
                  ? 'bg-success-subtle text-primary' 
                  : 'bg-info-subtle text-blue-700'
              }`}>
                {investment.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex space-x-4">
                <div>
                  <p className="text-muted-foreground">{investment.amount}</p>
                  <p className="text-xs text-muted-foreground">{investment.type}</p>
                </div>
                <div>
                  <p className="font-medium text-primary">{investment.profit}</p>
                  <p className="text-xs text-muted-foreground">({investment.profitPercent})</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-muted-foreground flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {investment.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-success-subtle rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-success-strong">Tổng lợi nhuận</p>
            <p className="text-lg font-bold text-primary">+60 triệu VND</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary">Tỷ suất trung bình</p>
            <p className="text-lg font-bold text-primary">3.75%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentOverview;
