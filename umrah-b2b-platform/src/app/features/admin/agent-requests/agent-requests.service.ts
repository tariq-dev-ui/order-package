// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SeroPackageModel } from 'src/app/services/admin.api.client';
import { MOCK_PACKAGES, MOCK_REQUESTS, RequestModelLocal } from './agent-requests.mock';

@Injectable({ providedIn: 'root' })
export class AgentRequestsService {

  private packages = [...MOCK_PACKAGES];
  private requests = [...MOCK_REQUESTS];
  private nextRequestId = 2000;

  // ── Packages ──────────────────────────────────────────────

  getPackages(params: { pageIndex: number; pageSize: number; agentId?: number; includeInactive?: boolean }): Observable<SeroPackageModel[]> {
    let list = this.packages;
    if (!params.includeInactive) {
      list = list.filter(p => p.IsActive !== false);
    }
    const start = params.pageIndex * params.pageSize;
    const page = list.slice(start, start + params.pageSize);
    return of(page).pipe(delay(300));
  }

  getPackagesCount(params: { agentId?: number; includeInactive?: boolean }): Observable<number> {
    let list = this.packages;
    if (!params.includeInactive) {
      list = list.filter(p => p.IsActive !== false);
    }
    return of(list.length).pipe(delay(150));
  }

  // ── Requests ──────────────────────────────────────────────

  getRequests(params: {
    pageIndex: number;
    pageSize: number;
    agentId?: number;
    requestId?: number;
  }): Observable<RequestModelLocal[]> {
    let list = this.requests;

    if (params.requestId) {
      list = list.filter(r => r.Id === params.requestId);
    } else if (params.agentId) {
      list = list.filter(r => r.AgentId === params.agentId);
    }

    const start = params.pageIndex * params.pageSize;
    const page = list.slice(start, start + params.pageSize);
    return of([...page]).pipe(delay(300));
  }

  getRequestsCount(params: { agentId?: number; requestId?: number }): Observable<number> {
    let list = this.requests;
    if (params.requestId) {
      list = list.filter(r => r.Id === params.requestId);
    } else if (params.agentId) {
      list = list.filter(r => r.AgentId === params.agentId);
    }
    return of(list.length).pipe(delay(150));
  }

  createRequest(body: Partial<RequestModelLocal> & { SeroPackageId: number; AgentId: number; PassengerCount: number }): Observable<RequestModelLocal> {
    const pkg = this.packages.find(p => p.PackageID === body.SeroPackageId);
    const newReq: RequestModelLocal = {
      Id: this.nextRequestId++,
      SeroPackageId: body.SeroPackageId,
      AgentId: body.AgentId,
      AgentCode: null,
      AgentName: null,
      AgentCountry: null,
      StatusId: 2,
      StatusName: 'new',
      StartDate: body.StartDate ?? new Date(),
      EndDate: body.EndDate ?? new Date(),
      PassengerCount: body.PassengerCount,
      RequestedQuantity: body.RequestedQuantity ?? 1,
      Notes: body.Notes ?? null,
      AddedDate: new Date(),
      IsByAgent: false,
      PackageCode: pkg?.PackageCode ?? null,
      Title: pkg?.Title ?? null,
      Price: pkg?.Price ?? 0,
    };
    this.requests = [newReq, ...this.requests];
    return of(newReq).pipe(delay(500));
  }

  deleteRequest(requestId: number): Observable<boolean> {
    this.requests = this.requests.filter(r => r.Id !== requestId);
    return of(true).pipe(delay(300));
  }
}
