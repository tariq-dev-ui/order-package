import {
  DistributionStatus, PricingPermission, CommissionModel, SubagentAccessMode, MarkupType
} from './enums';

export interface DistributionConfig {
  packageId: string;
  masterAgentId: string;
  masterAgentName: string;
  allowReselling: boolean;
  subagentAccessMode: SubagentAccessMode;
  selectedSubagentIds?: string[];
  pricingPermission: PricingPermission;
  agentMarkupType?: MarkupType;
  agentMarkupValue?: number;
  hideOriginalCost: boolean;
  commissionModel: CommissionModel;
  commissionValue: number;
  allocatedInventory: number;
  reservedInventory: number;
  soldInventory: number;
  status: DistributionStatus;
  createdAt: Date;
  expiresAt?: Date;
}

export interface SubagentAllocation {
  id: string;
  distributionId: string;
  packageId: string;
  subagentId: string;
  subagentName: string;
  subagentCompany: string;
  allocatedUnits: number;
  soldUnits: number;
  remainingUnits: number;
  sellingPrice: number;
  markup: number;
  status: DistributionStatus;
  assignedAt: Date;
  expiresAt?: Date;
}

export interface DistributionRequest {
  packageId: string;
  masterAgentId: string;
  allocatedInventory: number;
  allowReselling: boolean;
  subagentAccessMode: SubagentAccessMode;
  selectedSubagentIds?: string[];
  pricingPermission: PricingPermission;
  agentMarkupType?: MarkupType;
  agentMarkupValue?: number;
  hideOriginalCost: boolean;
  commissionModel: CommissionModel;
  commissionValue: number;
}

export interface ClonePackageRequest {
  sourcePackageId: string;
  masterAgentId: string;
  customTitle?: string;
  customPrice?: number;
  customValidFrom?: Date;
  customValidTo?: Date;
  customServices?: string[];
  markup?: number;
  markupType?: 'percentage' | 'fixed';
}

export interface DistributionSummary {
  totalPackages: number;
  activeDistributions: number;
  totalAllocated: number;
  totalSold: number;
  totalRemaining: number;
  totalRevenue: number;
  activeSubagents: number;
  conversionRate: number;
}
