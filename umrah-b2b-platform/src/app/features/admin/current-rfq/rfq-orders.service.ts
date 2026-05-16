import { Injectable } from '@angular/core';
import { CLOSED_RFQ_ORDERS, CURRENT_RFQ_ORDERS, RfqFilterState, RfqOrder } from './rfq-order.mock';

@Injectable({ providedIn: 'root' })
export class RfqOrdersService {
  private readonly currentOrders: RfqOrder[] = [...CURRENT_RFQ_ORDERS];
  private readonly closedOrders: RfqOrder[] = [...CLOSED_RFQ_ORDERS];

  getAll(): RfqOrder[] {
    return this.currentOrders.map((o) => ({ ...o }));
  }

  getAllCurrent(): RfqOrder[] {
    return this.currentOrders.map((o) => ({ ...o }));
  }

  getAllClosed(): RfqOrder[] {
    return this.closedOrders.map((o) => ({ ...o }));
  }

  getById(id: number): RfqOrder | null {
    const order = [...this.currentOrders, ...this.closedOrders].find((o) => o.id === id);
    return order ? { ...order } : null;
  }

  filter(state: RfqFilterState): RfqOrder[] {
    return this.applyFilter(this.currentOrders, state);
  }

  filterCurrent(state: RfqFilterState): RfqOrder[] {
    return this.applyFilter(this.currentOrders, state);
  }

  filterClosed(state: RfqFilterState): RfqOrder[] {
    return this.applyFilter(this.closedOrders, state);
  }

  private applyFilter(orders: RfqOrder[], state: RfqFilterState): RfqOrder[] {
    let result = orders.map((o) => ({ ...o }));
    if (state.hotel) result = result.filter((o) => o.hotelName === state.hotel);
    if (state.agent) result = result.filter((o) => o.clientName === state.agent);
    return result;
  }
}
