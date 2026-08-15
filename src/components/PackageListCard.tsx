/**
 * Thẻ hiển thị gói đầu tư trên trang Investment
 */

import React from 'react';
import { TrendingUp, Clock, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InvestmentPackage } from '../types';
import { formatCurrency } from '../lib/format';

interface PackageListCardProps {
  pkg: InvestmentPackage;
  onInvest: (pkg: InvestmentPackage) => void;
  onViewDetail: (pkg: InvestmentPackage) => void;
}

const PackageListCard: React.FC<PackageListCardProps> = ({ pkg, onInvest, onViewDetail }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'vi';

  const categoryColors = {
    premium: 'from-warning to-brand-energy-orange',
    standard: 'from-brand-accent-500 to-brand-accent-700',
    basic: 'from-brand-primary-500 to-brand-primary-700',
  };

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
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
              <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-2">{pkg.name}</h3>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-primary">{pkg.dailyProfit}%</div>
              <div className="text-xs text-muted-foreground">{t('packageListCard.perDay')}</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{pkg.description}</p>

          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="bg-background rounded-lg p-2 text-center">
              <div className="text-muted-foreground">{t('packageListCard.minimum')}</div>
              <div className="font-semibold text-foreground">{formatCurrency(pkg.investmentAmount, locale)}</div>
            </div>
            <div className="bg-background rounded-lg p-2 text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> {t('packageListCard.term')}
              </div>
              <div className="font-semibold text-foreground">{pkg.investmentPeriod} {t('packageListCard.days')}</div>
            </div>
            <div className="bg-background rounded-lg p-2 text-center">
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" /> {t('packageListCard.scale')}
              </div>
              <div className="font-semibold text-foreground">{formatCurrency(pkg.projectScale, locale)}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewDetail(pkg)}
              className="flex-1 py-2 px-3 text-sm border border-border rounded-lg hover:bg-background transition-colors"
            >
              {t('packageListCard.detail')}
            </button>
            <button
              onClick={() => onInvest(pkg)}
              className="flex-1 py-2 px-3 text-sm bg-primary text-white rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-1"
            >
              <TrendingUp className="w-4 h-4" />
              {t('packageListCard.invest')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageListCard;
