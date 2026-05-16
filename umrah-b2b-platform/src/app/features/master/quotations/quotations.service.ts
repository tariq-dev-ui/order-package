// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RequestVoucherModel } from '../orders/orders.model';
import { MOCK_ALL_VOUCHERS } from './quotations.mock';

@Injectable({ providedIn: 'root' })
export class QuotationsService {
  private readonly PAGE_SIZE = 10;

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getVouchers(pageIndex: number, pageSize: number = this.PAGE_SIZE): Observable<RequestVoucherModel[]> {
    const start = pageIndex * pageSize;
    const page = MOCK_ALL_VOUCHERS.slice(start, start + pageSize);
    return of(page).pipe(delay(300));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getVouchersCount(): Observable<number> {
    return of(MOCK_ALL_VOUCHERS.length).pipe(delay(100));
  }
}
