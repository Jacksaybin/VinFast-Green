/**
 * Investment Overview component - Displays investment summary cards
 */

import React from 'react';
import { TrendingUp, Eye, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InvestmentOverview: React.FC = () => {
  const { t } = useTranslation();

  const investments = [
    {
      id: 'VIC07',
      amount: t('investmentOverview.amount1'),
      profit: t('investmentOverview.profit1'),
      profitPercent: '4.5%',
      type: t('investmentOverview.package12m'),
      status: 'active' as const,
      date: '15/03/2024',
    },
    {
      id: 'VIC08',
      amount: t('investmentOverview.amount2'),
      profit: t('investmentOverview.profit2'),
      profitPercent: '3.0%',
      type: t('investmentOverview.package6m'),
      status: 'completed' as const,
      date: '01/01/2024',
    },
  ];

  return (
    <div className="bg-card rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <TrendingUp className="w-5 h-5 text-primary mr-2" />
          {t('investmentOverview.title')}
        </h3>
        <button className="text-info hover:underline text-sm font-medium flex items-center">
          <Eye className="w-4 h-4 mr-1" />
          {t('investmentOverview.viewAll')}
        </button>
      </div>

      <div className="space-y-3">
        {investments.map((investment) => (
          <div key={investment.id} className="p-3 border border-border rounded-lg hover:bg-background transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-foreground">{investment.id}</h4>
              <span className={`rounded-full px-2 py-1 text-xs ${
                investment.status === 'active'
                  ? 'bg-success-subtle text-success-strong'
                  : 'bg-info-subtle text-info'
              }`}>
                {investment.status === 'active' ? t('investmentOverview.active') : t('investmentOverview.completed')}
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
            <p className="text-sm font-medium text-success-strong">{t('investmentOverview.totalProfit')}</p>
            <p className="text-lg font-bold text-primary">{t('investmentOverview.totalProfitValue')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary">{t('investmentOverview.avgYield')}</p>
            <p className="text-lg font-bold text-primary">3.75%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentOverview;
