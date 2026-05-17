import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardRequestModel, DashboardVoucherDetailsModel } from './distributed-dashboard.model';
import { MOCK_PACKAGE_REQUESTS, MOCK_VOUCHER_DETAILS } from './distributed-dashboard.mock';

// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
@Injectable({ providedIn: 'root' })
export class DistributedDashboardService {
  getPackageRequests(): Observable<DashboardRequestModel[]> {
    return of([...MOCK_PACKAGE_REQUESTS]);
  }

  getVouchers(): Observable<DashboardVoucherDetailsModel[]> {
    return of([...MOCK_VOUCHER_DETAILS]);
  }
}
