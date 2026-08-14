/**
 * Type definitions for investment packages and related data structures
 */

export interface InvestmentPackage {
  id: string;
  name: string;
  type: 'VIC' | 'DC' | 'GIFT_CARD' | 'REGULAR';
  power?: string;
  dailyProfit: number;
  investmentPeriod: number;
  investmentAmount: number;
  projectScale: number;
  progress: number;
  image: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  category: 'premium' | 'standard' | 'basic';
  showOnHome: boolean;
  
  // Extended details
  details?: {
    dividend: number;
    profitSharingMethod: string;
    minimumInvestment: number;
    riskFree: number;
    projectAmount: number;
    profitRate: number;
    maxPurchaseLimit: number;
    profitCalculation: string;
    redemptionMethod: string;
    settlementTime: string;
    investmentNumber: string;
    security: number;
    projectSummary: string;
    schedulingBonus?: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  investments: Investment[];
  totalInvestment: number;
  totalProfit: number;
}

export interface Investment {
  id: string;
  packageId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused';
  dailyProfit: number;
  totalProfit: number;
}
