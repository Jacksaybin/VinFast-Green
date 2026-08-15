/**
 * Customer Service Contact page for password recovery
 * Đã tinh chỉnh: design token (bg-background, text-foreground, semantic colors),
 * gradient hero V-GREEN (thay vì blue), thêm SecurityShield icon với animation.
 * Hỗ trợ i18n.
 */

import React from 'react';
import { ArrowLeft, Phone, MessageCircle, Mail, Clock, HelpCircle, Shield, Users, Headphones, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LogoVGreen } from '../components/ui/illustrations';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handlePhoneCall = () => {
    window.location.href = 'tel:1900123456';
  };

  const handleEmailContact = () => {
    window.location.href = 'mailto:support@v-green.com';
  };

  const handleLiveChat = () => {
    alert(t('auth.forgotAlertChat'));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border relative">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/login')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base md:text-lg font-semibold text-foreground tracking-wide">{t('auth.forgotTitle')}</h1>
          <div className="w-9 h-9" />
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-44 bg-gradient-hero flex items-center justify-center overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-card/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-brand-accent-400/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-card/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-white/30 animate-float">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">{t('auth.forgotHeroTitle')}</h2>
          <p className="text-white/90 text-sm">{t('auth.forgotHeroDesc')}</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-6xl mx-auto">
        {/* Main Support Card */}
        <div className="bg-card rounded-2xl shadow-card border border-border p-6 -mt-8 relative z-10">
          <div className="text-center mb-6">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-success to-brand-primary-600 rounded-full" />
              <div className="absolute inset-0 bg-success/40 rounded-full blur-xl animate-pulse-slow" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-success to-brand-primary-700 rounded-full flex items-center justify-center shadow-glow">
                <Shield className="w-10 h-10 text-white" />
                <Lock className="w-3 h-3 text-warning-strong absolute -bottom-1 -right-1 rotate-12" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{t('auth.forgotSecurityTitle')}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('auth.forgotSecurityDesc')}
            </p>
          </div>

          <div className="bg-info-subtle rounded-xl p-4 mb-6 border border-info/20">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-info" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-info-strong mb-1">{t('auth.forgotStepsTitle')}</h4>
                <ul className="text-sm text-info-strong/80 space-y-1">
                  <li>• {t('auth.forgotSteps.0')}</li>
                  <li>• {t('auth.forgotSteps.1')}</li>
                  <li>• {t('auth.forgotSteps.2')}</li>
                  <li>• {t('auth.forgotSteps.3')}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-center mb-4">{t('auth.forgotChooseContact')}</h4>

            {/* Live Chat */}
            <button
              onClick={handleLiveChat}
              className="w-full bg-gradient-primary text-primary-foreground p-4 rounded-xl hover:shadow-glow transition-all shadow-card group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-card/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{t('auth.forgotLiveChatTitle')}</p>
                  <p className="text-white/80 text-xs">{t('auth.forgotLiveChatDesc')}</p>
                </div>
                <div className="text-white/80">
                  <span className="text-xs font-medium px-2 py-1 bg-card/20 rounded-full">{t('auth.forgotLiveChatBadge')}</span>
                </div>
              </div>
            </button>

            {/* Email Support */}
            <button
              onClick={handleEmailContact}
              className="w-full bg-gradient-to-r from-brand-accent-600 to-brand-accent-700 text-white p-4 rounded-xl hover:shadow-glow transition-all shadow-card group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-card/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{t('auth.forgotEmailTitle')}</p>
                  <p className="text-white/80 text-xs">{t('auth.forgotEmailDesc')}</p>
                </div>
                <div className="text-white/80">
                  <span className="text-xs font-medium px-2 py-1 bg-card/20 rounded-full">{t('auth.forgotEmailBadge')}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Working Hours */}
        <div className="mt-6 bg-card rounded-xl shadow-card border border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-warning-subtle rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning-strong" />
            </div>
            <h4 className="font-semibold text-foreground">{t('auth.forgotWorkingHours')}</h4>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('auth.forgotHotline')}</span>
              <span className="font-medium text-foreground">{t('auth.forgotHotlineValue')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('auth.forgotChatHours')}</span>
              <span className="font-medium text-foreground">{t('auth.forgotChatHoursValue')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('auth.forgotEmailHours')}</span>
              <span className="font-medium text-foreground">{t('auth.forgotEmailHoursValue')}</span>
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div className="mt-6 bg-card rounded-xl shadow-card border border-border p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-info-subtle rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
            <h4 className="font-semibold text-foreground">{t('auth.forgotTeamTitle')}</h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-medium text-sm">CS</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{t('auth.forgotTeamCSName')}</p>
                <p className="text-sm text-muted-foreground">{t('auth.forgotTeamCSDesc')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success to-brand-primary-700 rounded-full flex items-center justify-center shadow-glow">
                <span className="text-white font-medium text-sm">ST</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{t('auth.forgotTeamSecurityName')}</p>
                <p className="text-sm text-muted-foreground">{t('auth.forgotTeamSecurityDesc')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-accent-500 to-brand-accent-700 rounded-full flex items-center justify-center shadow-glow">
                <span className="text-white font-medium text-sm">TC</span>
              </div>
              <div>
                <p className="font-medium text-foreground">{t('auth.forgotTeamTechName')}</p>
                <p className="text-sm text-muted-foreground">{t('auth.forgotTeamTechDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-6 bg-card rounded-xl shadow-card border border-border p-4">
          <h4 className="font-semibold text-foreground mb-3">{t('auth.forgotFaqTitle')}</h4>

          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-4">
              <h5 className="font-medium text-foreground mb-1">{t('auth.forgotFaq1Q')}</h5>
              <p className="text-sm text-muted-foreground">{t('auth.forgotFaq1A')}</p>
            </div>

            <div className="border-l-4 border-success pl-4">
              <h5 className="font-medium text-foreground mb-1">{t('auth.forgotFaq2Q')}</h5>
              <p className="text-sm text-muted-foreground">{t('auth.forgotFaq2A')}</p>
            </div>

            <div className="border-l-4 border-info pl-4">
              <h5 className="font-medium text-foreground mb-1">{t('auth.forgotFaq3Q')}</h5>
              <p className="text-sm text-muted-foreground">{t('auth.forgotFaq3A')}</p>
            </div>
          </div>
        </div>

        {/* Back to Login + V-GREEN brand footer */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            {t('auth.forgotBackToLogin')}
          </button>
          <div className="text-xs text-muted-foreground">
            {t('auth.forgotPoweredBy')}
          </div>
          <LogoVGreen variant="full" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;