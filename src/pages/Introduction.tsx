/**
 * Introduction page component - Detailed information about V-GREEN and VinFast
 */

import React from 'react';
import { ArrowLeft, Globe, Factory, Zap, Users, TrendingUp, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import LiveChat from '../components/LiveChat';

const Introduction: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const regionKeys = ['asia', 'europe', 'northAmerica', 'middleEast', 'africa'] as const;
  const regionCountriesKeys: Record<typeof regionKeys[number], string[]> = {
    asia: ['india', 'indonesia', 'thailand', 'philippines'],
    europe: ['germany', 'france', 'netherlands', 'norway'],
    northAmerica: ['usa', 'canada'],
    middleEast: ['uae', 'qatar', 'saudi'],
    africa: ['nigeria', 'ghana', 'southAfrica'],
  };

  const globalMarkets = regionKeys.map((region) => ({
    region: t(`introduction.regions.${region}`),
    countries: regionCountriesKeys[region].map((code) => t(`introduction.countries.${code}`)),
  }));

  const achievements = [
    { icon: <Globe className="w-6 h-6" />, title: t('introduction.achievements.countries'), desc: t('introduction.achievements.countriesDesc') },
    { icon: <Factory className="w-6 h-6" />, title: t('introduction.achievements.factories'), desc: t('introduction.achievements.factoriesDesc') },
    { icon: <Zap className="w-6 h-6" />, title: t('introduction.achievements.stations'), desc: t('introduction.achievements.stationsDesc') },
    { icon: <Users className="w-6 h-6" />, title: t('introduction.achievements.customers'), desc: t('introduction.achievements.customersDesc') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

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

        <div className="relative h-48 bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 flex items-center justify-center">
          <img
            src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/71892c63-ed97-452d-a8c5-bbdb8572827f.jpg"
            alt="VinFast Global Factory"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-2xl font-bold text-white mb-2">{t('introduction.title')}</h1>
            <p className="text-primary-foreground text-sm">{t('introduction.titleSuffix')}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        {/* CEO Quote Section */}
        <div className="bg-card rounded-xl shadow-card p-6 -mt-6 relative z-10 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary-500 to-brand-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
              <img
                src="https://pub-cdn.sider.ai/u/U0E5HLZKXNK/web-coder/68750791b1dac45b18d4a236/resource/69aeb199-0ff9-42b8-83d0-da6476f0ef31.jpg"
                alt="CEO"
                className="w-14 h-14 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{t('introduction.ceoName')}</h3>
              <p className="text-sm text-primary mb-3">{t('introduction.ceoTitle')}</p>
              <div className="bg-success-subtle p-4 rounded-lg border-l-4 border-primary">
                <p className="text-sm text-foreground leading-relaxed italic">
                  "{t('introduction.ceoQuote')}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-success-subtle rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t('introduction.missionTitle')}</h2>
          </div>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            {t('introduction.missionBody')}
          </p>
          <div className="bg-gradient-to-r from-brand-primary-500 to-brand-primary-700 p-4 rounded-lg">
            <p className="text-white text-sm font-medium text-center">
              {t('introduction.missionGoal')}
            </p>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">{t('introduction.achievementsTitle')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center p-4 bg-background rounded-lg">
                <div className="w-12 h-12 bg-success-subtle rounded-full flex items-center justify-center mx-auto mb-2">
                  <div className="text-primary">
                    {achievement.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{achievement.title}</h3>
                <p className="text-xs text-muted-foreground">{achievement.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Global Expansion */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-info-subtle rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-info" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t('introduction.globalTitle')}</h2>
          </div>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            {t('introduction.globalDesc')}
          </p>

          <div className="space-y-4">
            {globalMarkets.map((market, index) => (
              <div key={index} className="border-l-4 border-primary pl-4 bg-success-subtle p-3 rounded-r-lg">
                <h4 className="font-medium text-foreground mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  {market.region}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {market.countries.map((country, countryIndex) => (
                    <span
                      key={countryIndex}
                      className="px-2 py-1 bg-success-subtle text-primary text-xs rounded-full"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manufacturing Plants */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-warning-subtle rounded-full flex items-center justify-center">
              <Factory className="w-5 h-5 text-warning-strong" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{t('introduction.plantsTitle')}</h2>
          </div>
          <p className="text-foreground text-sm leading-relaxed mb-4">
            {t('introduction.plantsDesc')}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-info-subtle rounded-lg border border-info/20">
              <h4 className="font-medium text-info-strong text-sm mb-1">{t('introduction.plantVietnam')}</h4>
              <p className="text-info-strong/80 text-xs">{t('introduction.plantVietnamStatus')}</p>
            </div>
            <div className="p-3 bg-success-subtle rounded-lg border border-success/20">
              <h4 className="font-medium text-success-strong text-sm mb-1">{t('introduction.plantUsa')}</h4>
              <p className="text-success-strong text-xs">{t('introduction.plantUsaStatus')}</p>
            </div>
            <div className="p-3 bg-warning-subtle rounded-lg border border-warning/30">
              <h4 className="font-medium text-warning-strong text-sm mb-1">{t('introduction.plantIndia')}</h4>
              <p className="text-warning-strong/85 text-xs">{t('introduction.plantIndiaStatus')}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-medium text-primary text-sm mb-1">{t('introduction.plantIndonesia')}</h4>
              <p className="text-primary text-xs">{t('introduction.plantIndonesiaStatus')}</p>
            </div>
          </div>
        </div>

        {/* Vision Statement */}
        <div className="bg-gradient-to-br from-brand-primary-600 to-brand-primary-700 rounded-xl shadow-elevated p-6 text-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-card/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-3">{t('introduction.visionTitle')}</h2>
            <p className="text-primary-foreground text-sm leading-relaxed">
              {t('introduction.visionBody')}
            </p>
          </div>
        </div>
      </div>

      <BottomNavigation />
      <LiveChat />
    </div>
  );
};

export default Introduction;
