/**
 * Type definitions for the translation resources.
 *
 * Sử dụng deep-partial để cho phép các namespace con (ví dụ:
 * adminConfirm.suggestionsApprove là string[]) giữ được kiểu cụ thể
 * trong khi vẫn có thể mở rộng khi cần.
 */

export interface PasswordStrength {
  weak: string;
  medium: string;
  fair: string;
  strong: string;
  veryStrong: string;
}

export interface AuthErrors {
  fullNameRequired: string;
  fullNameMin: string;
  phoneRequired: string;
  phoneInvalid: string;
  passwordRequired: string;
  passwordMin: string;
  confirmRequired: string;
  confirmMismatch: string;
  agreeTerms: string;
}

export interface TxTypeLabels {
  deposit: string;
  withdraw: string;
  investment: string;
  profit: string;
  bonus: string;
  referral: string;
  admin_credit: string;
  admin_debit: string;
  reinvest: string;
}

export interface TxStatusLabels {
  pending: string;
  completed: string;
  failed: string;
  cancelled: string;
}

export interface ReinvestPackageTypes {
  VIC: string;
  DC: string;
  GIFT_CARD: string;
  REGULAR: string;
}

export interface IntroductionAchievements {
  countries: string;
  countriesDesc: string;
  factories: string;
  factoriesDesc: string;
  stations: string;
  stationsDesc: string;
  customers: string;
  customersDesc: string;
}

export interface IntroductionRegions {
  asia: string;
  europe: string;
  northAmerica: string;
  middleEast: string;
  africa: string;
}

export interface IntroductionCountries {
  india: string;
  indonesia: string;
  thailand: string;
  philippines: string;
  germany: string;
  france: string;
  netherlands: string;
  norway: string;
  usa: string;
  canada: string;
  uae: string;
  qatar: string;
  saudi: string;
  nigeria: string;
  ghana: string;
  southAfrica: string;
}

export interface AppearanceAccentNames {
  vgreen: string;
  vinfast: string;
  ocean: string;
  forest: string;
  solar: string;
  sunset: string;
  rose: string;
  purple: string;
  indigo: string;
  slate: string;
}

export interface LiveChatFaq {
  package: string;
  rate: string;
  withdraw: string;
  register: string;
}

export interface Translation {
  common: Record<string, string>;
  header: Record<string, string>;
  footer: Record<string, string>;
  home: Record<string, any>;
  auth: Record<string, any>;
  investment: Record<string, string>;
  investmentCard: Record<string, string>;
  investmentOverview: Record<string, string>;
  investmentDetail: Record<string, string>;
  interestCalculator: Record<string, any>;
  investmentForm: Record<string, any>;
  myAccount: Record<string, any>;
  personalInfo: Record<string, any>;
  wallet: Record<string, any>;
  transactionHistory: Record<string, any>;
  notifications: Record<string, string>;
  referral: Record<string, any>;
  reinvestment: Record<string, any>;
  introduction: Record<string, any>;
  benefits: Record<string, any>;
  news: Record<string, string>;
  newsDetail: Record<string, string>;
  liveChat: Record<string, any>;
  appearance: Record<string, any>;
  language: Record<string, string>;
  admin: Record<string, any>;
  adminKyc: Record<string, any>;
  adminAudit: Record<string, any>;
  adminSettings: Record<string, any>;
  adminConfirm: Record<string, any>;
}