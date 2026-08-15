/**
 * Investment detail modal component - Shows detailed information about investment packages
 */

import React from 'react';
import { X, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InvestmentPackage } from '../types';

interface InvestmentDetailModalProps {
  package: InvestmentPackage;
  isOpen: boolean;
  onClose: () => void;
}

const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({ package: pkg, isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  if (!isOpen) return null;

  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(locale).format(amount) + ' VND';
  };

  const formatPercent = (percent: number): string => {
    return `${percent}%`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t('investmentDetail.title')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Detailed Information */}
          {pkg.details && (
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.profitSharingMethod')}</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{pkg.details.profitSharingMethod}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.minimumInvestment')}</span>
                <span className="text-sm font-medium text-primary">{formatCurrency(pkg.details.minimumInvestment)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.riskFree')}</span>
                <span className="text-sm font-medium text-primary">{formatPercent(pkg.details.riskFree)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.projectAmount')}</span>
                <span className="text-sm font-medium">{formatCurrency(pkg.details.projectAmount)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.profit')}</span>
                <span className="text-sm font-medium">{t('investmentDetail.profitRate', { rate: pkg.details.profitRate })}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.maxPurchaseLimit')}</span>
                <span className="text-sm font-medium">{t('investmentDetail.shares', { count: pkg.details.maxPurchaseLimit })}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.profitCalculation')}</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{pkg.details.profitCalculation}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.redemptionMethod')}</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{pkg.details.redemptionMethod}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.settlementTime')}</span>
                <span className="text-sm font-medium">{pkg.details.settlementTime}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">{t('investmentDetail.investmentNumber')}</span>
                <span className="text-sm font-medium">{pkg.details.investmentNumber}</span>
              </div>

              {/* Project Summary */}
              <div className="bg-info-subtle p-4 rounded-lg">
                <h5 className="text-info-strong mb-2 flex items-center text-sm font-semibold">
                  <Award className="w-4 h-4 mr-2" />
                  {t('investmentDetail.projectSummary')}
                </h5>
                <p className="text-sm text-info">{pkg.details.projectSummary}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-muted text-foreground py-3 px-4 rounded-lg font-medium hover:bg-muted/70 transition-colors"
            >
              {t('investmentDetail.close')}
            </button>
            <button className="flex-1 bg-gradient-primary text-primary-foreground py-3 px-4 rounded-lg font-medium hover:shadow-glow transition-all">
              {t('investmentDetail.investNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDetailModal;
