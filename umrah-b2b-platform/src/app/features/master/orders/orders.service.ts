// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RequestModel, RequestVoucherModel, VoucherDetailsModel, VoucherStatusLogModel } from './orders.model';
import { MOCK_ORDERS, MOCK_VOUCHERS, MOCK_VOUCHER_DETAILS, MOCK_VOUCHER_LOGS } from './orders.mock';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getPackageRequests(agentId: number, searchId?: number): Observable<RequestModel[]> {
    let results = [...MOCK_ORDERS];
    if (searchId) {
      results = results.filter(r => r.Id === searchId);
    }
    return of(results).pipe(delay(300));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getPackageRequest(requestId: number): Observable<RequestModel | null> {
    const found = MOCK_ORDERS.find(r => r.Id === requestId) ?? null;
    return of(found).pipe(delay(200));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getRequestVouchers(requestId: number): Observable<RequestVoucherModel[]> {
    return of(MOCK_VOUCHERS[requestId] ?? []).pipe(delay(300));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getVoucherById(voucherId: number): Observable<VoucherDetailsModel | null> {
    const found = MOCK_VOUCHER_DETAILS[voucherId] ?? null;
    return of(found).pipe(delay(200));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getVoucherLogs(voucherId: number, agentId: number): Observable<VoucherStatusLogModel[]> {
    return of(MOCK_VOUCHER_LOGS[voucherId] ?? []).pipe(delay(200));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  approveVoucherFromAgent(voucherId: number, agentId: number, notes: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  rejectVoucherFromAgent(voucherId: number, agentId: number, notes: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }
}
