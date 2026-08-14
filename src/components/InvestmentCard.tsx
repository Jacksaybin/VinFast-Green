/**
 * File: InvestmentCard.tsx
 * Purpose: Reusable card component to display investment package info including progress, status badge and small icons.
 */

import React from "react";
import { Activity, CheckCircle, Clock, TrendingUp } from "lucide-react";

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
  status: "Đang hoạt động" | "Hoàn thành" | "Sắp tới";
}

/**
 * Props for InvestmentCard component.
 */
interface InvestmentCardProps {
  pkg: InvestmentPackage;
  className?: string;
}

/**
 * Component: InvestmentCard
 * Purpose: Display an investment package with visual cues: icon, status badge and progress bar.
 */
const InvestmentCard: React.FC<InvestmentCardProps> = ({ pkg, className = "" }) => {
  const progress = Math.max(0, Math.min(100, pkg.progress));

  /**
   * Function: getStatusColor
   * Purpose: Return color classes for status badge and progress fill based on package code and status.
   */
  const getStatusColor = () => {
    // Special coloring for VIC07 and VIC08 as requested
    if (pkg.code === "VIC07") {
      return pkg.status === "Hoàn thành" ? "bg-emerald-600 text-white" : "bg-emerald-500 text-white";
    }
    if (pkg.code === "VIC08") {
      return pkg.status === "Hoàn thành" ? "bg-orange-600 text-white" : "bg-orange-500 text-white";
    }
    // Defaults
    if (pkg.status === "Hoàn thành") return "bg-sky-700 text-white";
    if (pkg.status === "Đang hoạt động") return "bg-indigo-500 text-white";
    return "bg-gray-300 text-gray-800";
  };

  const fillColor = (() => {
    if (pkg.code === "VIC07") return "bg-emerald-500";
    if (pkg.code === "VIC08") return "bg-orange-500";
    if (pkg.status === "Hoàn thành") return "bg-sky-500";
    return "bg-indigo-500";
  })();

  const displayAmount = typeof pkg.amount === 'number'
    ? new Intl.NumberFormat('vi-VN').format(pkg.amount) + ' ₫'
    : pkg.amount;

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-sm p-4 flex flex-col gap-3 ${className}`}
      role="article"
      aria-labelledby={`pkg-${pkg.id}-title`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br from-slate-50 to-slate-100">
            <TrendingUp className="h-6 w-6 text-slate-700" />
          </div>
          <div>
            <h3 id={`pkg-${pkg.id}-title`} className="text-sm font-semibold text-slate-900">
              {pkg.name}
            </h3>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-medium">{pkg.code}</span>
              <span>•</span>
              <span>{pkg.duration}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor()}`}>
            {pkg.status}
          </div>
          <div className="text-sm font-semibold text-slate-900">{displayAmount}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>{progress}% hoàn thành</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{pkg.duration}</span>
        </div>
      </div>

      <div className="w-full">
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`${fillColor} h-full rounded-full transition-all duration-700`}
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            role="progressbar"
            aria-label={`Tiến độ ${pkg.name}`}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>Khởi tạo</span>
          <span>Hoàn thành mục tiêu</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {pkg.status === "Hoàn thành" ? (
          <div className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50">
            <CheckCircle className="h-4 w-4" />
            Đã hoàn thành
          </div>
        ) : (
          <div className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-slate-600 bg-slate-50">
            <Activity className="h-4 w-4" />
            Đang tiến triển
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestmentCard;