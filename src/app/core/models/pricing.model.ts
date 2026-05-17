import { MarkupType } from './enums';

export interface CostBreakdown {
  hotelMakkah: number;
  hotelMadinah: number;
  transportation: number;
  tickets: number;
  catering: number;
  visa: number;
  other: number;
  total: number;
}

export interface AgentMargin {
  type: MarkupType;
  value: number;
  calculatedAmount: number;
}

export interface PricingConfig {
  currency: string;
  costBreakdown: CostBreakdown;
  adminCostTotal: number;
  agentMargin?: AgentMargin;
  finalSellingPrice: number;
  profitMargin: number;
  profitPercentage: number;
  hideServiceBreakdown: boolean;
  hideCostFromSubagents: boolean;
  isBlendedPrice: boolean;
  perPersonPrice: number;
  groupDiscount?: number;
  earlyBirdDiscount?: number;
  childPrice?: number;
  infantPrice?: number;
}

export interface PricingSimulationInput {
  baseAdminCost: number;
  markupType: MarkupType;
  markupValue: number;
  paxCount: number;
  includeVisa: boolean;
  visaCost: number;
  groupDiscount: number;
}

export interface PricingSimulationResult {
  basePrice: number;
  markupAmount: number;
  sellingPrice: number;
  profitPerPax: number;
  totalProfit: number;
  profitPercentage: number;
  priceAfterDiscount: number;
}

export interface PricingTier {
  label: string;
  minPax: number;
  maxPax: number;
  pricePerPax: number;
  discount: number;
}
