export interface DistributionAnalytics {
  totalDistributedPackages: number;
  activeSubagents: number;
  soldInventory: number;
  remainingInventory: number;
  totalInventory: number;
  topSellingAgents: AgentPerformance[];
  profitGenerated: number;
  pendingRequests: number;
  conversionRate: number;
  revenueByMonth: MonthlyRevenue[];
  packagePerformance: PackagePerformanceMetric[];
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  companyName: string;
  packagesSold: number;
  revenue: number;
  conversionRate: number;
  rank: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  revenue: number;
  sales: number;
  profit: number;
}

export interface PackagePerformanceMetric {
  packageId: string;
  packageTitle: string;
  allocated: number;
  sold: number;
  remaining: number;
  revenue: number;
  conversionRate: number;
}

export interface InventorySnapshot {
  date: Date;
  total: number;
  allocated: number;
  sold: number;
  remaining: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  value: number | string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  suffix?: string;
  prefix?: string;
}
