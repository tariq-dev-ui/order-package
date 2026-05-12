import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { MockDataService } from './mock-data.service';
import {
  SubagentAllocation,
  DistributionSummary
} from '../models/distribution.model';
import { DistributionStatus } from '../models/enums';

@Injectable({ providedIn: 'root' })
export class DistributionService {
  private allocations$ = new BehaviorSubject<SubagentAllocation[]>([]);

  constructor(private mock: MockDataService) {
    this.allocations$.next(this.mock.allocations);
  }

  getDistributionSummary(masterAgentId: string): Observable<DistributionSummary> {
    const pkgs = this.mock.getPackagesForMasterAgent(masterAgentId);
    const allocations = this.allocations$.getValue().filter(
      a => pkgs.some(p => p.id === a.packageId)
    );
    const subagentIds = new Set(allocations.map(a => a.subagentId));
    const totalSold = allocations.reduce((s, a) => s + a.soldUnits, 0);
    const totalAllocated = allocations.reduce((s, a) => s + a.allocatedUnits, 0);
    const totalRevenue = allocations.reduce((s, a) => s + a.soldUnits * a.sellingPrice, 0);

    return of({
      totalPackages: pkgs.length,
      activeDistributions: allocations.filter(a => a.status === DistributionStatus.ACTIVE).length,
      totalAllocated,
      totalSold,
      totalRemaining: totalAllocated - totalSold,
      totalRevenue,
      activeSubagents: subagentIds.size,
      conversionRate: totalAllocated > 0 ? Math.round((totalSold / totalAllocated) * 100) : 0
    }).pipe(delay(200));
  }

  getAllocationsForPackage(packageId: string): Observable<SubagentAllocation[]> {
    return this.allocations$.pipe(
      map(allocs => allocs.filter(a => a.packageId === packageId)),
      delay(150)
    );
  }

  getAllocationsForMasterAgent(masterAgentId: string): Observable<SubagentAllocation[]> {
    const pkgs = this.mock.getPackagesForMasterAgent(masterAgentId);
    const pkgIds = pkgs.map(p => p.id);
    return this.allocations$.pipe(
      map(allocs => allocs.filter(a => pkgIds.includes(a.packageId))),
      delay(150)
    );
  }

  createAllocation(allocation: Omit<SubagentAllocation, 'id'>): Observable<SubagentAllocation> {
    const newAlloc: SubagentAllocation = {
      ...allocation,
      id: 'alloc-' + Date.now()
    };
    const current = this.allocations$.getValue();
    this.allocations$.next([...current, newAlloc]);
    return of(newAlloc).pipe(delay(300));
  }

  updateAllocation(id: string, updates: Partial<SubagentAllocation>): Observable<SubagentAllocation> {
    const current = this.allocations$.getValue();
    const idx = current.findIndex(a => a.id === id);
    if (idx > -1) {
      const updated = { ...current[idx], ...updates };
      const newList = [...current];
      newList[idx] = updated;
      this.allocations$.next(newList);
      return of(updated).pipe(delay(200));
    }
    throw new Error(`Allocation ${id} not found`);
  }

}
