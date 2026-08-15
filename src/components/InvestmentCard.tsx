/**
 * File: InvestmentCard.tsx
 * Purpose: Reusable card component to display investment package info.
 * Đã tinh chỉnh: semantic colors (success/warning/info), icon đa dạng (Plant/Battery/SolarPanel),
 * hover effect scale + shadow transition, progress bar gradient.
 */

import React from "react";
import { Activity, CheckCircle, Clock, Leaf, Battery, Zap, TrendingUp, Sun, Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

/**
 * Interface: InvestmentPackage
 * Purpose: Defines the shape of investment package data accepted by InvestmentCard.
 */
export interface InvestmentPackage {
  id: string;
  code: string;
  name: string;
  amount: string | number;
  duration: string;
  progress: number; // 0-100
  status: "active" | "completed" | "upcoming";
}

/**
 * Props for InvestmentCard component.
 */
interface InvestmentCardProps {
  pkg: InvestmentPackage;
  className?: string;
}

const ICON_BY_CODE: Record<string, React.ReactNode> = {
  VIC01: <Sprout className="h-6 w-6 text-success-strong" />,
  VIC02: <Battery className="h-6 w-6 text-info-strong" />,
  VIC03: <Zap className="h-6 w-6 text-warning-strong" />,
  VIC07: <Zap className="h-6 w-6 text-warning-strong" />,
  VIC08: <Sun className="h-6 w-6 text-warning-strong" />,
};

const STATUS_TOKEN: Record<string, { bg: string; text: string; fill: string }> = {
  VIC07: {
    bg: 'bg-gradient-to-r from-success to-brand-accent-500',
    text: 'text-primary-foreground',
    fill: 'bg-gradient-to-r from-success to-brand-accent-500',
  },
  VIC08: {
    bg: 'bg-gradient-to-r from-warning to-brand-energy-orange',
    text: 'text-primary-foreground',
    fill: 'bg-gradient-to-r from-warning to-brand-energy-orange',
  },
  default: {
    bg: 'bg-gradient-to-r from-info to-brand-accent-500',
    text: 'text-primary-foreground',
    fill: 'bg-gradient-to-r from-info to-brand-accent-500',
  },
  completed: {
    bg: 'bg-success',
    text: 'text-primary-foreground',
    fill: 'bg-success',
  },
  upcoming: {
    bg: 'bg-muted text-muted-foreground',
    text: 'text-muted-foreground',
    fill: 'bg-muted-foreground',
  },
};

/**
 * Component: InvestmentCard
 * Purpose: Display an investment package with visual cues: icon, status badge and progress bar.
 */
const InvestmentCard: React.FC<InvestmentCardProps> = ({ pkg, className = "" }) => {
  const { t, i18n } = useTranslation();
  const progress = Math.max(0, Math.min(100, pkg.progress));

  const statusKey = (s: InvestmentPackage["status"]) => {
    if (s === 'active') return 'investmentCard.statusActive';
    if (s === 'completed') return 'investmentCard.statusCompleted';
    return 'investmentCard.statusUpcoming';
  };
  const statusLabel = t(statusKey(pkg.status));

  const token =
    pkg.code === 'VIC07' || pkg.code === 'VIC08'
      ? STATUS_TOKEN[pkg.code]
      : pkg.status === 'completed'
        ? STATUS_TOKEN.completed
        : pkg.status === 'upcoming'
          ? STATUS_TOKEN.upcoming
          : STATUS_TOKEN.default;

  const icon = ICON_BY_CODE[pkg.code] ?? <TrendingUp className="h-6 w-6 text-primary" />;

  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN';
  const displayAmount =
    typeof pkg.amount === 'number'
      ? new Intl.NumberFormat(locale).format(pkg.amount) + ' ₫'
      : pkg.amount;

  return (
    <div
      className={cn(
        'group rounded-xl border border-border bg-card text-card-foreground shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-primary/30 p-4 flex flex-col gap-3 transition-all duration-300',
        className
      )}
      role="article"
      aria-labelledby={`pkg-${pkg.id}-title`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-card border border-primary/20 group-hover:scale-105 transition-transform duration-300">
            {icon}
          </div>
          <div>
            <h3 id={`pkg-${pkg.id}-title`} className="text-sm font-semibold text-foreground">
              {pkg.name}
            </h3>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <span className="font-medium text-primary">{pkg.code}</span>
              <span className="text-border">•</span>
              <span>{pkg.duration}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={cn('px-2.5 py-1 text-xs font-semibold rounded-md shadow-sm', token.bg, token.text)}>
            {statusLabel}
          </div>
          <div className="text-sm font-bold text-foreground">{displayAmount}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span>{t('investmentCard.progress', { percent: progress })}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>{pkg.duration}</span>
        </div>
      </div>

      <div className="w-full">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700 ease-out', token.fill)}
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            role="progressbar"
            aria-label={`${t('investmentCard.progressLabel')} ${pkg.name}`}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>{t('investmentCard.init')}</span>
          <span>{t('investmentCard.target')}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {pkg.status === 'completed' ? (
          <div className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-success-strong bg-success-subtle">
            <CheckCircle className="h-4 w-4" />
            {t('investmentCard.doneLabel')}
          </div>
        ) : pkg.status === 'upcoming' ? (
          <div className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground bg-muted">
            <Clock className="h-4 w-4" />
            {t('investmentCard.soonLabel')}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-info-strong bg-info-subtle">
            <Activity className="h-4 w-4" />
            {t('investmentCard.inProgressLabel')}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentCard;