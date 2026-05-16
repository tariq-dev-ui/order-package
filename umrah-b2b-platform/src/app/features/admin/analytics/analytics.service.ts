import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { mockAnalyticsRequests, mockAnalyticsSummary, mockAnalyticsVouchers } from './analytics.mock';
import { AnalyticsRequest, AnalyticsVoucher } from './analytics.model';

type PageQuery = { pageIndex?: number; pageSize?: number };

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getAgentListCount(): Observable<number> {
    return of(mockAnalyticsSummary.currentAgentsCount).pipe(delay(120));
  }

  getSeroRequestsCount(props?: { isClosed?: boolean }): Observable<number> {
    const count = props?.isClosed === false
      ? mockAnalyticsSummary.currentRequestsCount
      : mockAnalyticsSummary.totalRequestsCount;
    return of(count).pipe(delay(120));
  }

  getPackagesCount(props?: { includeInactive?: boolean }): Observable<number> {
    const count = props?.includeInactive
      ? mockAnalyticsSummary.totalPackagesCount
      : mockAnalyticsSummary.activePackagesCount;
    return of(count).pipe(delay(120));
  }

  getVoucherCount(): Observable<number> {
    return of(mockAnalyticsSummary.currentVouchersCount).pipe(delay(120));
  }

  getAgentCountryCount(): Observable<number> {
    return of(mockAnalyticsSummary.totalAgentCountryCount).pipe(delay(120));
  }

  getVoucherClosedCount(): Observable<number> {
    return of(mockAnalyticsSummary.closedVouchersCount).pipe(delay(120));
  }

  getSeroRequests(query: PageQuery = {}): Observable<AnalyticsRequest[]> {
    return of(this.paginate(mockAnalyticsRequests, query)).pipe(delay(160));
  }

  getVouchers(query: PageQuery = {}): Observable<AnalyticsVoucher[]> {
    return of(this.paginate(mockAnalyticsVouchers, query)).pipe(delay(160));
  }

  private paginate<T>(items: T[], query: PageQuery): T[] {
    const pageIndex = Math.max(0, query.pageIndex ?? 0);
    const pageSize = Math.max(1, query.pageSize ?? items.length);
    return items.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
  }
}
