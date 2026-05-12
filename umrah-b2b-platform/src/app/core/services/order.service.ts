import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Package } from '../models/package.model';
import {
  CustomerInfo,
  FoodSelection,
  HotelSelection,
  OrderStatus,
  OtherServiceSelection,
  PackageOrder,
  PricingSummary,
  TicketSelection,
  TransportSelection
} from '../models/package-order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly storageKey = 'umrah_package_orders';

  createOrder(
    packageData: Partial<Package>,
    customerInfo: CustomerInfo,
    otherServices: OtherServiceSelection[]
  ): Observable<PackageOrder> {
    const now = new Date();
    const order: PackageOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: this.generateOrderNumber(),
      status: OrderStatus.NEW_REQUEST,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      customerInfo,
      packageSummary: this.buildPackageSummary(packageData),
      packageTitle: packageData.title,
      makkahHotel: this.mapHotels(packageData.makkahHotels, 'makkah'),
      madinahHotel: this.mapHotels(packageData.madinahHotels, 'madinah'),
      transport: this.mapTransport(packageData),
      tickets: this.mapTickets(packageData),
      food: this.mapFood(packageData),
      otherServices,
      pricing: this.mapPricing(packageData)
    };

    const all = this.readAll();
    this.writeAll([order, ...all]);
    return of(order).pipe(delay(700));
  }

  getOrders(): Observable<PackageOrder[]> {
    return of(this.readAll()).pipe(delay(200));
  }

  getOrderById(id: string): Observable<PackageOrder | undefined> {
    return this.getOrders().pipe(map((orders) => orders.find((order) => order.id === id)));
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<PackageOrder> {
    const all = this.readAll();
    const idx = all.findIndex((order) => order.id === id);

    if (idx === -1) {
      throw new Error(`Order ${id} not found`);
    }

    const updated: PackageOrder = {
      ...all[idx],
      status,
      updatedAt: new Date().toISOString()
    };
    all[idx] = updated;
    this.writeAll(all);

    return of(updated).pipe(delay(250));
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `ORD-${y}${m}${d}-${seq}`;
  }

  private mapHotels(
    hotels: Package['makkahHotels'] | Package['madinahHotels'] | undefined,
    city: 'makkah' | 'madinah'
  ): HotelSelection[] {
    return (hotels || []).map((hotel) => ({
      city,
      name: hotel.name,
      roomType: hotel.roomType,
      nights: hotel.nights,
      category: `${hotel.rating} نجوم`
    }));
  }

  private mapTransport(packageData: Partial<Package>): TransportSelection[] {
    return (packageData.transportation || []).map((item) => ({
      type: item.type,
      route: item.route,
      provider: item.provider,
      capacity: item.capacity,
      airConditioned: item.isAirConditioned
    }));
  }

  private mapTickets(packageData: Partial<Package>): TicketSelection[] {
    return (packageData.tickets || []).map((item) => ({
      airline: item.airline,
      flightNumber: item.flightNumber,
      origin: item.origin,
      destination: item.destination,
      departureDate: item.departureDate.toISOString(),
      returnDate: item.returnDate?.toISOString(),
      travelClass: item.class,
      baggageAllowance: item.baggageAllowance
    }));
  }

  private mapFood(packageData: Partial<Package>): FoodSelection[] {
    return (packageData.catering || []).map((item) => ({
      provider: item.provider,
      mealsPerDay: item.mealsPerDay,
      mealTypes: item.mealTypes,
      dietaryOptions: item.dietaryOptions,
      location: item.serviceLocation
    }));
  }

  private mapPricing(packageData: Partial<Package>): PricingSummary {
    return {
      currency: packageData.pricingConfig?.currency || 'SAR',
      adminCost: packageData.pricingConfig?.adminCostTotal || 0,
      markupAmount: packageData.pricingConfig?.agentMargin?.calculatedAmount || 0,
      markupPercentage: packageData.pricingConfig?.profitPercentage || 0,
      totalPrice: packageData.pricingConfig?.finalSellingPrice || 0
    };
  }

  private buildPackageSummary(packageData: Partial<Package>): string {
    const nights = packageData.nights || 0;
    return `${(packageData.makkahHotels || []).length} مكة - ${(packageData.madinahHotels || []).length} مدينة - ${nights} ليلة`;
  }

  private readAll(): PackageOrder[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(raw) as PackageOrder[];
    } catch {
      return [];
    }
  }

  private writeAll(orders: PackageOrder[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(orders));
  }
}
