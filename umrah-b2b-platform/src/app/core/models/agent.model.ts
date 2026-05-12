import { UserRole } from './enums';

export interface Agent {
  id: string;
  agentCode?: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  parentAgentId?: string;
  masterAgentId?: string;
  subagentIds?: string[];
  joinedAt: Date;
  lastActiveAt: Date;
  totalSales: number;
  totalRevenue: number;
  pendingBalance: number;
  commissionRate: number;
  licenseNumber?: string;
}

export interface AgentSummary {
  id: string;
  name: string;
  companyName: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  totalSales: number;
}
