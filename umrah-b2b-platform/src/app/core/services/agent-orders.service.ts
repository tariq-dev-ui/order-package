import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderService } from './order.service';
import { OrderStatus, PackageOrder } from '../models/package-order.model';

@Injectable({ providedIn: 'root' })
export class AgentOrdersService {
  constructor(private readonly orders: OrderService) {}

  getOrders(): Observable<PackageOrder[]> {
    return this.orders.getOrders();
  }

  getOrderById(id: string): Observable<PackageOrder | undefined> {
    return this.orders.getOrderById(id);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<PackageOrder> {
    return this.orders.updateOrderStatus(id, status);
  }
}
