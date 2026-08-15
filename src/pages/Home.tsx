/**
 * Trang chủ - Landing page với thông tin tổng quan và các gói đầu tư nổi bật
 * Đã tinh chỉnh: Hero gradient mesh + SVG illustration, FeatureIcon thay emoji, design token toàn bộ.
 * Hỗ trợ i18n: toàn bộ chuỗi hiển thị dịch qua react-i18next.
 */

import React, { useEffect } from 'react';
import { ArrowRight, Users, Zap, TrendingUp, Star, ShieldCheck, Wallet, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import InvestmentCard from '../components/InvestmentCard';
import { ChargingStationHero, EnergyDashboard, Illustration } from '../assets/illustrations/index';
import { FeatureIcon } from '../components/ui/illustrations';
import { useAuthStore } from '../stores/authStore';
import { usePackageStore } from '../stores/packageStore';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const packages = usePackageStore((s) => s.packages);
  const loadPackages = usePackageStore((s) => s.load);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const featuredPackages = packages
    .filter((pkg) => pkg.status === 'active')
    .slice(0, 3);

  const stats = [
    { label: t('home.statsUsers'), value: t('home.statsUsersValue'), icon: <Users className="w-5 h-5" />, color: 'primary' },
    { label: t('home.statsStations'), value: t('home.statsStationsValue'), icon: <Zap className="w-5 h-5" />, color: 'accent' },
    { label: t('home.statsFund'), value: t('home.statsFundValue'), icon: <TrendingUp className="w-5 h-5" />, color: 'success' },
    { label: t('home.statsRating'), value: t('home.statsRatingValue'), icon: <Star className="w-5 h-5" />, color: 'warning' },
  ];

  const benefits = [
    {
      title: t('home.benefits.investment.title'),
      desc: t('home.benefits.investment.desc'),
      icon: 'Investment' as const,
      gradient: 'from-success to-brand-primary-500',
    },
    {
      title: t('home.benefits.safety.title'),
      desc: t('home.benefits.safety.desc'),
      icon: 'Safety' as const,
      gradient: 'from-info to-brand-accent-500',
    },
    {
      title: t('home.benefits.wallet.title'),
      desc: t('home.benefits.wallet.desc'),
      icon: 'Wallet' as const,
      gradient: 'from-warning to-brand-energy-orange',
    },
    {
      title: t('home.benefits.support.title'),
      desc: t('home.benefits.support.desc'),
      icon: 'Support' as const,
      gradient: 'from-brand-primary-500 to-brand-accent-500',
    },
  ];

  const statBgMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-brand-accent-500/10 text-brand-accent-600',
    success: 'bg-success/10 text-success-strong',
    warning: 'bg-warning/10 text-warning-strong',
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <div className="relative bg-gradient-hero text-white overflow-hidden">
        {/* Decorative mesh + pattern */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-primary-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand-accent-400/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left content */}
          <div className="max-w-xl animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm mb-5 border border-white/20">
              <Zap className="w-4 h-4 text-warning-strong" />
              <span>{t('home.badge')}</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 tracking-tight">
              {t('home.titleStart')}
              <br />
              <span className="bg-gradient-to-r from-brand-energy-yellow via-brand-primary-200 to-brand-accent-200 bg-clip-text text-transparent">
                {t('home.titleEnd')}
              </span>
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/investment')}
                className="group bg-white text-brand-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-white/95 transition-all flex items-center gap-2 shadow-elevated hover:shadow-glow-lg"
              >
                {t('home.ctaExplore')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                >
                  {t('home.ctaRegister')}
                </button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-primary-200" />
                <span>{t('home.trustVerified')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-primary-200" />
                <span>{t('home.trustWithdraw')}</span>
              </div>
            </div>
          </div>

          {/* Right illustration */}
          <div className="hidden md:block animate-fade-in">
            <ChargingStationHero className="drop-shadow-2xl" />
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 -mt-6 relative">
        {/* Stats */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl shadow-card border border-border p-4 text-center card-hover"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${statBgMap[stat.color]}`}>
                {stat.icon}
              </div>
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="max-w-6xl mx-auto mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
              {t('home.benefitsTitle')} <span className="text-gradient-primary">{t('home.benefitsTitleAccent')}</span>{t('home.benefitsTitleSuffix')}
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t('home.benefitsSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl shadow-card border border-border p-4 card-hover relative overflow-hidden group min-h-[148px] flex flex-col"
              >
                {/* Decorative gradient corner */}
                <div className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${b.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${b.gradient} flex items-center justify-center mb-3 shadow-glow`}>
                  <FeatureIcon name={b.icon} size={24} className="text-white" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold leading-tight text-foreground">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Investment Packages */}
        <div className="max-w-6xl mx-auto mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{t('home.featuredTitle')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t('home.featuredSubtitle')}</p>
            </div>
            <button
              onClick={() => navigate('/investment')}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              {t('common.viewAll')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => navigate('/investment')}
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
        </div>

        {/* Dashboard illustration teaser */}
        <div className="max-w-6xl mx-auto mb-10">
          <div className="bg-card rounded-3xl shadow-card border border-border p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center overflow-hidden relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-primary-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-3">
                <TrendingUp className="w-3 h-3" />
                <span>{t('home.dashboardBadge')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
                {t('home.dashboardTitle')}<br />{t('home.dashboardTitleBreak')}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('home.dashboardDesc')}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:shadow-glow transition-all flex items-center gap-2"
              >
                {t('home.dashboardCta')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <EnergyDashboard className="drop-shadow-2xl" />
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-hero rounded-3xl p-8 md:p-12 text-white text-center shadow-elevated">
            {/* Decorative SVG bg */}
            <div className="absolute -top-10 -left-10 opacity-20 pointer-events-none">
              <Illustration name="EVNetworkMap" size={200} />
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-20 pointer-events-none rotate-12">
              <Illustration name="EnergyDashboard" size={200} />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs mb-4 border border-white/20">
                <Zap className="w-3 h-3 text-warning-strong" />
                <span>{t('home.ctaBannerBadge')}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold mb-3">
                {t('home.ctaBannerTitle')}
              </h2>
              <p className="text-white/90 text-sm md:text-base mb-6 max-w-md mx-auto">
                {t('home.ctaBannerDesc')}
              </p>
              {!isAuthenticated ? (
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-white text-brand-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-white/95 transition-all shadow-elevated"
                  >
                    {t('home.ctaRegisterNow')}
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
                  >
                    {t('home.ctaLogin')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/investment')}
                  className="bg-white text-brand-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-white/95 transition-all flex items-center gap-2 mx-auto"
                >
                  {t('home.ctaInvestNow')} <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Home;