/**
 * File: BottomNavigation.tsx
 * Purpose: Footer component với nhận diện V-GREEN, design token, gradient.
 * Đã tinh chỉnh: gradient mesh, link active glow, social pill, divider gradient.
 * Hỗ trợ i18n: tất cả các chuỗi hiển thị dịch qua react-i18next.
 */

import React from "react";
import { Link, useLocation } from "react-router";
import { LogoVGreen } from "./ui/illustrations";
import { Leaf, Mail, Phone, MapPin, Facebook, Youtube, Globe, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

const NAV_LINK_KEYS = [
  { to: "/", key: "header.navHome" },
  { to: "/investment", key: "header.navInvestment" },
  { to: "/news", key: "header.navNews" },
  { to: "/benefits", key: "header.navBenefits" },
  { to: "/introduction", key: "header.navIntroduction" },
] as const;

const BottomNavigation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  return (
    <footer className="relative mt-12 bg-gradient-to-br from-brand-primary-900 via-brand-primary-800 to-brand-accent-900 text-white overflow-hidden">
      {/* Decorative gradient mesh */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(at 20% 20%, rgba(74, 222, 128, 0.4) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(34, 211, 238, 0.3) 0px, transparent 50%)",
        }}
      />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary-400 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <LogoVGreen variant="full" />
            </div>
            <p className="text-sm text-white/80 leading-relaxed flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 text-brand-primary-300 flex-shrink-0" />
              <span>{t('footer.tagline')}</span>
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-brand-primary-200">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {NAV_LINK_KEYS.map((l) => {
                const active = location.pathname === l.to;
                return (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className={cn(
                        'text-sm transition-colors flex items-center gap-2 group',
                        active ? 'text-white font-medium' : 'text-white/80 hover:text-white'
                      )}
                    >
                      <Leaf className={cn(
                        'w-3 h-3 transition-transform',
                        active ? 'text-brand-primary-300' : 'text-brand-primary-400 group-hover:scale-110'
                      )} />
                      {t(l.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-brand-primary-200">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-primary-300 flex-shrink-0" />
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-primary-300 flex-shrink-0" />
                <span>{t('footer.hotline')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-primary-300 flex-shrink-0" />
                <span>{t('footer.email')}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-brand-primary-200">{t('footer.followUs')}</h4>
            <div className="flex items-center gap-3 mb-4">
              <a
                href="#"
                aria-label={t('footer.ariaFacebook')}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary-400/30 hover:scale-110 flex items-center justify-center transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label={t('footer.ariaYoutube')}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary-400/30 hover:scale-110 flex items-center justify-center transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label={t('footer.ariaWebsite')}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary-400/30 hover:scale-110 flex items-center justify-center transition-all"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
            <div className="text-xs text-white/60">
              {t('footer.license')}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-white/70">
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </div>
          <div className="flex items-center gap-4 text-xs text-white/70">
            <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
            <span className="text-white/30">•</span>
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
            <span className="text-white/30">•</span>
            <a href="#" className="hover:text-white transition-colors">{t('footer.support')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomNavigation;