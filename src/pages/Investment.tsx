/**
 * Investment page component - Investment packages and investment management
 * Đã tinh chỉnh: thay hero img ngoài CDN bằng ChargingStationHero SVG có sẵn,
 * dùng EmptyState + Skeleton, token semantic 100%.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Filter, Search, Award, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import InvestmentCard from '../components/InvestmentCard';
import InvestmentForm from '../components/InvestmentForm';
import LiveChat from '../components/LiveChat';
import { InvestmentPackage as PkgType } from '../types';
import { usePackageStore } from '../stores/packageStore';
import { ChargingStationHero } from '../assets/illustrations';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/skeleton';
import { EmptyInvestments } from '../assets/illustrations';
import { cn } from '../lib/utils';

/**
 * Investment - allows users to browse and filter investment packages
 */
const Investment: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'premium' | 'standard' | 'basic'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPkg, setSelectedPkg] = useState<PkgType | null>(null);

  const packages = usePackageStore((s) => s.packages);
  const getCategoryStats = usePackageStore((s) => s.getCategoryStats);
  const loadPackages = usePackageStore((s) => s.load);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Category stats for overview cards
  const categoryStats = getCategoryStats();

  // Categories cho quick filter cards
  const categories = [
    {
      id: 'standard',
      name: t('investment.categoryStandardName'),
      icon: <Award className="h-5 w-5" />,
      color: 'from-info to-brand-accent-500',
      bgColor: 'bg-info-subtle',
      textColor: 'text-info',
      description: t('investment.categoryStandardDesc'),
      count: categoryStats.standard.count,
      minProfit: t('investment.categoryStandardMin'),
    },
    {
      id: 'basic',
      name: t('investment.categoryBasicName'),
      icon: <Zap className="h-5 w-5" />,
      color: 'from-success to-brand-primary-500',
      bgColor: 'bg-success-subtle',
      textColor: 'text-primary',
      description: t('investment.categoryBasicDesc'),
      count: categoryStats.basic.count,
      minProfit: t('investment.categoryBasicMin'),
    },
  ];

  /**
   * Filter packages by search text and selected category
   */
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (selectedFilter === 'all') return matchesSearch;
      return matchesSearch && pkg.category === selectedFilter;
    });
  }, [packages, searchTerm, selectedFilter]);

  const isLoading = packages.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card/90 shadow-elevated backdrop-blur-sm transition-transform hover:scale-105"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-brand-primary-600 via-brand-primary-700 to-brand-accent-700 overflow-hidden">
          {/* Decorative pattern overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-10 flex w-full items-center justify-between px-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                {t('investment.heroTitle')}
              </h1>
              <p className="mt-1 text-sm text-primary-foreground/90">
                {t('investment.heroSubtitle')}
              </p>
            </div>
            <div className="hidden h-32 w-32 md:block">
              <ChargingStationHero className="h-full w-full opacity-90" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* Category Overview */}
        <div className="relative -mt-6 z-10 mb-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t('investment.categoriesTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {categories.map((category) => {
              const selected = selectedFilter === category.id;
              return (
                <div
                  key={category.id}
                  className={cn(
                    'rounded-xl border p-4 transition-all',
                    selected
                      ? 'border-primary/40 shadow-card-hover bg-primary/5'
                      : 'border-border hover:shadow-md',
                  )}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        category.bgColor,
                      )}
                    >
                      <div className={category.textColor}>{category.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {category.count} {t('investment.categoryPackagesSuffix')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('investment.categoryFromPrefix')} {category.minProfit}{t('investment.categoryPerDay')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFilter(category.id as 'all' | 'premium' | 'standard' | 'basic')}
                    className={cn(
                      'w-full rounded-lg py-2 px-4 font-medium transition-all',
                      selected
                        ? `bg-gradient-to-r ${category.color} text-white shadow-glow`
                        : 'bg-muted text-foreground hover:bg-muted/80',
                    )}
                  >
                    {selected ? 'Đang chọn' : `${t('investment.categoryViewCta')} ${category.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-card">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder={t('investment.searchPlaceholder')}
                className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {[
                  { id: 'all' as const, label: t('investment.filterAll'), cls: 'bg-primary text-white' },
                  { id: 'premium' as const, label: t('investment.filterPremium'), cls: 'bg-brand-accent-600 text-white' },
                  { id: 'standard' as const, label: t('investment.filterStandard'), cls: 'bg-info text-white' },
                  { id: 'basic' as const, label: t('investment.filterBasic'), cls: 'bg-primary text-white' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={cn(
                      'whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors',
                      selectedFilter === f.id ? f.cls : 'bg-muted text-muted-foreground hover:bg-muted/70',
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Investment Packages */}
        <div className="mb-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t('investment.packagesTitle', { count: filteredPackages.length })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedFilter === 'all'
                  ? t('investment.packagesAllDesc')
                  : `Gói ${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <SkeletonGrid count={4} />
          ) : filteredPackages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <EmptyState
                illustration={<EmptyInvestments size={140} />}
                title={t('investment.packagesEmpty')}
                description={t('investment.packagesEmpty')}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPackages.map((pkg) => (
<div
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                className="cursor-pointer"
              >
                <InvestmentCard
                  pkg={{
                    id: pkg.id,
                    code: pkg.name.match(/\(([^)]+)\)/)?.[1] || pkg.type,
                    name: pkg.name,
                    amount: pkg.investmentAmount,
                    duration: `${pkg.investmentPeriod} ngày`,
                    progress: Math.min(100, pkg.progress),
                    status: pkg.status === 'completed' ? 'completed' : pkg.status === 'paused' ? 'upcoming' : 'active',
                  }}
                />
              </div>
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-6 text-center text-white shadow-elevated md:p-8">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-card/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand-accent-400/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="mb-2 text-lg font-bold md:text-xl">{t('investment.ctaTitle')}</h2>
            <p className="mb-4 text-sm text-primary-foreground/90 md:text-base">
              {t('investment.ctaDesc')}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl bg-card px-6 py-3 font-semibold text-primary transition-all hover:scale-105 hover:shadow-elevated"
            >
              {t('investment.ctaButton')}
            </button>
          </div>
        </div>
      </div>

      <BottomNavigation />
      <LiveChat />

      {selectedPkg && (
        <InvestmentForm
          pkg={selectedPkg}
          isOpen={!!selectedPkg}
          onClose={() => setSelectedPkg(null)}
          onSuccess={() => setSelectedPkg(null)}
        />
      )}
    </div>
  );
};

export default Investment;
