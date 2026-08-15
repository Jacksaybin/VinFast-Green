/**
 * Interest Calculator page component - Interest rate calculation and comparison
 * Hỗ trợ i18n.
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, Shield, Clock, Star, Calculator, Info } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import LiveChat from '../components/LiveChat';
import { usePackageStore } from '../stores/packageStore';

const InterestCalculator: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [investmentAmount, setInvestmentAmount] = useState<number>(50000000);

  const packages = usePackageStore((s) => s.packages);
  const loadPackages = usePackageStore((s) => s.load);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const calculateInterestRates = (dailyRate: number, period: number) => {
    const monthlyRate = dailyRate * 30;
    const yearlyRate = dailyRate * 365;
    const totalReturn = dailyRate * period;

    return {
      monthly: monthlyRate,
      yearly: yearlyRate,
      totalReturn: totalReturn,
    };
  };

  const calculateProfit = (packageId: string, amount: number) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return null;

    const dailyProfit = (amount * pkg.dailyProfit) / 100;
    const totalProfit = dailyProfit * pkg.investmentPeriod;

    return {
      dailyProfit,
      totalProfit,
      totalReturn: amount + totalProfit,
      percentage: (totalProfit / amount) * 100,
    };
  };

  const selectedPkg = packages.find((p) => p.id === selectedPackage);
  const profitCalculation = selectedPackage ? calculateProfit(selectedPackage, investmentAmount) : null;

  // Đơn vị ngày/tháng/năm theo ngôn ngữ.
  const periodUnit = i18n.language === 'vi' ? 'ngày' : 'days';
  const perDayUnit = i18n.language === 'vi' ? '/ngày' : '/day';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate('/')}
            className="bg-card/90 backdrop-blur-sm p-2 rounded-full shadow-elevated"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-hero">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(at 20% 50%, rgba(255,255,255,0.3) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(255,255,255,0.2) 0px, transparent 50%)",
            }}
          />
          <div className="relative z-10 px-4 text-center">
            <h1 className="text-2xl font-bold text-white">{t('interestCalculator.heroTitle')}</h1>
            <p className="mt-1 text-sm text-primary-foreground/90">{t('interestCalculator.heroSubtitle')}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* Interactive Calculator */}
        <div className="bg-card rounded-xl shadow-card p-6 -mt-6 relative z-10 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('interestCalculator.calcTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('interestCalculator.calcSubtitle')}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('interestCalculator.selectPackage')}
              </label>
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{t('interestCalculator.selectPackagePlaceholder')}</option>
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} - {pkg.dailyProfit}%{perDayUnit} - {pkg.investmentPeriod} {periodUnit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('interestCalculator.amountLabel')}
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full p-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('interestCalculator.amountPlaceholder')}
                min={selectedPkg?.investmentAmount || 50000000}
              />
              {selectedPkg && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t('interestCalculator.minAmount', { amount: selectedPkg.investmentAmount.toLocaleString() })}
                </p>
              )}
            </div>

            {profitCalculation && (
              <div className="bg-gradient-to-r from-brand-primary-50 to-brand-accent-50 p-4 rounded-lg border border-success/20">
                <h3 className="font-semibold text-success-strong mb-3">{t('interestCalculator.resultsTitle')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t('interestCalculator.dailyProfit')}</div>
                    <div className="text-lg font-bold text-primary">
                      {profitCalculation.dailyProfit.toLocaleString()} VND
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t('interestCalculator.totalProfit')}</div>
                    <div className="text-lg font-bold text-info">
                      {profitCalculation.totalProfit.toLocaleString()} VND
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t('interestCalculator.totalReturn')}</div>
                    <div className="text-lg font-bold text-primary">
                      {profitCalculation.totalReturn.toLocaleString()} VND
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">{t('interestCalculator.profitRate')}</div>
                    <div className="text-lg font-bold text-danger">
                      {profitCalculation.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interest Rate Table */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">{t('interestCalculator.tableTitle')}</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-xs text-muted-foreground">{t('interestCalculator.liveRates')}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {t('interestCalculator.tableDesc')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-foreground">{t('interestCalculator.tablePackage')}</th>
                  <th className="text-center py-3 px-2 font-medium text-foreground">{t('interestCalculator.tableDay')}</th>
                  <th className="text-center py-3 px-2 font-medium text-foreground">{t('interestCalculator.tableMonth')}</th>
                  <th className="text-center py-3 px-2 font-medium text-foreground">{t('interestCalculator.tableYear')}</th>
                  <th className="text-center py-3 px-2 font-medium text-foreground">{t('interestCalculator.tableTotal')}</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg, index) => {
                  const rates = calculateInterestRates(pkg.dailyProfit, pkg.investmentPeriod);
                  return (
                    <tr key={index} className="border-b border-border hover:bg-background">
                      <td className="py-3 px-2">
                        <div className="font-medium text-foreground text-xs">{pkg.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {pkg.investmentAmount >= 1000000000
                            ? `${(pkg.investmentAmount / 1000000000).toFixed(0)}B`
                            : `${(pkg.investmentAmount / 1000000).toFixed(0)}M`}
                        </div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="font-semibold text-primary">{pkg.dailyProfit}%</div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="font-semibold text-info">{rates.monthly.toFixed(1)}%</div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="font-semibold text-success-strong">{rates.yearly.toFixed(0)}%</div>
                      </td>
                      <td className="text-center py-3 px-2">
                        <div className="font-bold text-danger">{rates.totalReturn.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{pkg.investmentPeriod}d</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-success-subtle p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-primary">0.2% - 2.2%</div>
              <div className="text-xs text-primary">{t('interestCalculator.summaryDaily')}</div>
            </div>
            <div className="bg-info-subtle p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-info">6% - 66%</div>
              <div className="text-xs text-info-strong">{t('interestCalculator.summaryMonthly')}</div>
            </div>
            <div className="bg-info-subtle p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-info-strong">73% - 803%</div>
              <div className="text-xs text-info-strong">{t('interestCalculator.summaryYearly')}</div>
            </div>
          </div>
        </div>

        {/* Investment Benefits */}
        <div className="bg-gradient-to-r from-brand-primary-50 to-brand-accent-50 p-4 rounded-lg border border-success/20 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-success-strong text-sm mb-2">{t('interestCalculator.benefitsTitle')}</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-primary">
                      <strong>{t('interestCalculator.benefitDailyRate')}</strong> 0.2% - 2.2%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-info rounded-full"></div>
                    <span className="text-info-strong">
                      <strong>{t('interestCalculator.benefitMonthlyRate')}</strong> 6% - 66%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-warning-strong rounded-full"></div>
                    <span className="text-warning-strong">
                      <strong>{t('interestCalculator.benefitYearlyRate')}</strong> 73% - 803%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 text-primary" />
                    <span className="text-primary">
                      <strong>{t('interestCalculator.benefitSafe')}</strong> {t('interestCalculator.benefitSafeValue')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-info" />
                    <span className="text-info-strong">
                      <strong>{t('interestCalculator.benefitFlex')}</strong> {t('interestCalculator.benefitFlexValue')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-warning-strong" />
                    <span className="text-warning-strong">
                      <strong>{t('interestCalculator.benefitReputable')}</strong> {t('interestCalculator.benefitReputableValue')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Method */}
        <div className="bg-warning-subtle p-4 rounded-lg border border-warning/30 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-warning-subtle rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-warning-strong" />
            </div>
            <div>
              <h4 className="font-medium text-warning-strong text-sm mb-2">{t('interestCalculator.methodTitle')}</h4>
              <ul className="text-xs text-warning-strong space-y-1">
                <li>• <strong>{t('interestCalculator.methodDaily')}</strong> {t('interestCalculator.methodDailyDesc')}</li>
                <li>• <strong>{t('interestCalculator.methodMonthly')}</strong> {t('interestCalculator.methodMonthlyDesc')}</li>
                <li>• <strong>{t('interestCalculator.methodYearly')}</strong> {t('interestCalculator.methodYearlyDesc')}</li>
                <li>• <strong>{t('interestCalculator.methodTotal')}</strong> {t('interestCalculator.methodTotalDesc')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-brand-accent-600 to-brand-accent-700 rounded-xl shadow-elevated p-6 text-white text-center">
          <h2 className="text-lg font-bold mb-2">{t('interestCalculator.ctaTitle')}</h2>
          <p className="text-white/90 text-sm mb-4">
            {t('interestCalculator.ctaDesc')}
          </p>
          <button
            onClick={() => navigate('/investment')}
            className="bg-card text-primary px-6 py-3 rounded-lg font-semibold hover:shadow-elevated transition-colors"
          >
            {t('interestCalculator.ctaButton')}
          </button>
        </div>
      </div>

      <BottomNavigation />
      <LiveChat />
    </div>
  );
};

export default InterestCalculator;