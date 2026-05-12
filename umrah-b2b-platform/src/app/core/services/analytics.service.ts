import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  DistributionAnalytics, DashboardWidget, MonthlyRevenue,
  AgentPerformance, PackagePerformanceMetric
} from '../models/analytics.model';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private mock: MockDataService) {}

  getAdminAnalytics(): Observable<DistributionAnalytics> {
    return of({
      totalDistributedPackages: 3,
      activeSubagents: 5,
      soldInventory: 71,
      remainingInventory: 99,
      totalInventory: 200,
      topSellingAgents: this.getTopAgents(),
      profitGenerated: 1524800,
      pendingRequests: 7,
      conversionRate: 35.5,
      revenueByMonth: this.getMonthlyRevenue(),
      packagePerformance: this.getPackageMetrics()
    }).pipe(delay(300));
  }

  getMasterAgentAnalytics(masterAgentId: string): Observable<DistributionAnalytics> {
    const pkgs = this.mock.getPackagesForMasterAgent(masterAgentId);
    const allocs = this.mock.allocations.filter(a => pkgs.some(p => p.id === a.packageId));
    const sold = allocs.reduce((s, a) => s + a.soldUnits, 0);
    const allocated = allocs.reduce((s, a) => s + a.allocatedUnits, 0);
    const revenue = allocs.reduce((s, a) => s + a.soldUnits * a.sellingPrice, 0);

    return of({
      totalDistributedPackages: pkgs.length,
      activeSubagents: new Set(allocs.map(a => a.subagentId)).size,
      soldInventory: sold,
      remainingInventory: allocated - sold,
      totalInventory: allocated,
      topSellingAgents: this.getTopAgents().slice(0, 3),
      profitGenerated: revenue,
      pendingRequests: 3,
      conversionRate: allocated > 0 ? Math.round((sold / allocated) * 1000) / 10 : 0,
      revenueByMonth: this.getMonthlyRevenue(),
      packagePerformance: this.getPackageMetrics().slice(0, 2)
    }).pipe(delay(250));
  }

  getAdminDashboardWidgets(): Observable<DashboardWidget[]> {
    return of([
      { id: 'total-packages', title: 'Total Packages', value: 3, change: 50, changeType: 'increase' as const, icon: 'inventory_2', color: 'primary' as const, suffix: 'pkgs' },
      { id: 'active-subagents', title: 'Active Subagents', value: 5, change: 25, changeType: 'increase' as const, icon: 'people', color: 'success' as const, suffix: 'agents' },
      { id: 'sold-inventory', title: 'Units Sold', value: 71, change: 18, changeType: 'increase' as const, icon: 'shopping_cart', color: 'info' as const, suffix: 'units' },
      { id: 'revenue', title: 'Total Revenue', value: '1.52M', change: 32, changeType: 'increase' as const, icon: 'payments', color: 'success' as const, prefix: 'SAR' },
      { id: 'pending', title: 'Pending Requests', value: 7, change: -12, changeType: 'decrease' as const, icon: 'pending_actions', color: 'warning' as const },
      { id: 'conversion', title: 'Conversion Rate', value: '35.5', change: 4.2, changeType: 'increase' as const, icon: 'trending_up', color: 'primary' as const, suffix: '%' }
    ] as DashboardWidget[]).pipe(delay(200));
  }

  getMasterAgentWidgets(masterAgentId: string): Observable<DashboardWidget[]> {
    return of([
      { id: 'my-packages', title: 'My Packages', value: 2, change: 100, changeType: 'increase' as const, icon: 'inventory_2', color: 'primary' as const },
      { id: 'my-subagents', title: 'Active Subagents', value: 4, change: 33, changeType: 'increase' as const, icon: 'supervisor_account', color: 'success' as const },
      { id: 'sold', title: 'Packages Sold', value: 26, change: 22, changeType: 'increase' as const, icon: 'sell', color: 'info' as const },
      { id: 'revenue', title: 'My Revenue', value: '632K', change: 28, changeType: 'increase' as const, icon: 'account_balance_wallet', color: 'success' as const, prefix: 'SAR' },
      { id: 'remaining', title: 'Remaining Stock', value: 54, change: -15, changeType: 'decrease' as const, icon: 'warehouse', color: 'warning' as const },
      { id: 'conversion', title: 'Conversion Rate', value: '32.5', change: 6.1, changeType: 'increase' as const, icon: 'trending_up', color: 'primary' as const, suffix: '%' }
    ] as DashboardWidget[]).pipe(delay(200));
  }

  private getTopAgents(): AgentPerformance[] {
    return [
      { agentId: 'agent-001', agentName: 'Tariq Hassan', companyName: 'Hassan Travel Agency', packagesSold: 64, revenue: 320000, conversionRate: 42, rank: 1 },
      { agentId: 'agent-004', agentName: 'Amr Mostafa', companyName: 'Mostafa Hajj & Umrah', packagesSold: 91, revenue: 455000, conversionRate: 38, rank: 2 },
      { agentId: 'agent-002', agentName: 'Yusuf Badr', companyName: 'Badr Pilgrim Services', packagesSold: 48, revenue: 240000, conversionRate: 35, rank: 3 },
      { agentId: 'agent-005', agentName: 'Bilal Chaudhry', companyName: 'Chaudhry Travel & Tours', packagesSold: 55, revenue: 275000, conversionRate: 31, rank: 4 },
      { agentId: 'agent-003', agentName: 'Ibrahim Qureshi', companyName: 'Qureshi Umrah Services', packagesSold: 22, revenue: 110000, conversionRate: 24, rank: 5 }
    ];
  }

  private getMonthlyRevenue(): MonthlyRevenue[] {
    return [
      { month: 'Jan', year: 2026, revenue: 145000, sales: 18, profit: 21750 },
      { month: 'Feb', year: 2026, revenue: 198000, sales: 24, profit: 29700 },
      { month: 'Mar', year: 2026, revenue: 312000, sales: 38, profit: 46800 },
      { month: 'Apr', year: 2026, revenue: 287000, sales: 35, profit: 43050 },
      { month: 'May', year: 2026, revenue: 421000, sales: 51, profit: 63150 },
      { month: 'Jun', year: 2026, revenue: 0, sales: 0, profit: 0 }
    ];
  }

  private getPackageMetrics(): PackagePerformanceMetric[] {
    return [
      { packageId: 'pkg-001', packageTitle: 'Premium Umrah Ramadan Gold', allocated: 50, sold: 18, remaining: 26, revenue: 393300, conversionRate: 36 },
      { packageId: 'pkg-002', packageTitle: 'Economy Umrah 14 Nights', allocated: 120, sold: 45, remaining: 63, revenue: 383040, conversionRate: 37.5 },
      { packageId: 'pkg-003', packageTitle: 'Family Umrah Deluxe VIP', allocated: 30, sold: 8, remaining: 18, revenue: 197296, conversionRate: 26.7 }
    ];
  }
}
