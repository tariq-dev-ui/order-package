// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { OrderRow, OrdersPage, OrdersQuery, OrderType } from './orders.model';
import { MOCK_ORDERS, ORDER_TOTAL_COUNT, ORDER_TYPE_COUNTS } from './orders.mock';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getOrders(query: OrdersQuery): Observable<OrdersPage> {
    const filtered = this.filterRows(query);
    const start = query.pageIndex * query.pageSize;
    const rows = filtered.slice(start, start + query.pageSize);

    return of({ rows, total: filtered.length }).pipe(delay(250));
  }

  // Full matching set (unpaginated) for CSV export.
  getAllMatching(query: Omit<OrdersQuery, 'pageIndex' | 'pageSize'>): Observable<OrderRow[]> {
    return of(this.filterRows(query)).pipe(delay(150));
  }

  getTypeCounts(): Observable<Record<OrderType, number> & { all: number }> {
    return of({ ...ORDER_TYPE_COUNTS, all: ORDER_TOTAL_COUNT }).pipe(delay(100));
  }

  private filterRows(query: Omit<OrdersQuery, 'pageIndex' | 'pageSize'>): OrderRow[] {
    const term = query.search.trim().toLowerCase();

    return MOCK_ORDERS.filter((row) => {
      const matchesType = query.typeFilter === 'all' || row.type === query.typeFilter;
      const matchesSearch = !term
        || row.orderNo.toLowerCase().includes(term)
        || row.agent.toLowerCase().includes(term)
        || row.type.toLowerCase().includes(term);
      const matchesPayment = !query.paymentStatus || row.paymentStatus === query.paymentStatus;
      const matchesOperation = !query.operationStatus || row.operationStatus === query.operationStatus;
      const matchesAgentStatus = !query.agentStatus || row.agentStatus === query.agentStatus;
      return matchesType && matchesSearch && matchesPayment && matchesOperation && matchesAgentStatus;
    });
  }
}
