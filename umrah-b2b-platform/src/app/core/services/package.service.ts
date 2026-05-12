import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Package, PackageCardView } from '../models/package.model';
import { PackageStatus, PackageType } from '../models/enums';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class PackageService {
  private packages$ = new BehaviorSubject<Package[]>([]);

  constructor(private mock: MockDataService) {
    this.packages$.next(this.mock.packages);
  }

  getAll(): Observable<Package[]> {
    return this.packages$.asObservable().pipe(delay(200));
  }

  getById(id: string): Observable<Package | undefined> {
    return this.packages$.pipe(
      map(pkgs => pkgs.find(p => p.id === id)),
      delay(150)
    );
  }

  getByType(type: PackageType): Observable<Package[]> {
    return this.packages$.pipe(
      map(pkgs => pkgs.filter(p => p.type === type)),
      delay(150)
    );
  }

  getActivePackages(): Observable<Package[]> {
    return this.packages$.pipe(
      map(pkgs => pkgs.filter(p => p.status === PackageStatus.ACTIVE)),
      delay(150)
    );
  }

  getPackagesForMasterAgent(masterAgentId: string): Observable<Package[]> {
    return this.packages$.pipe(
      map(pkgs => this.mock.getPackagesForMasterAgent(masterAgentId)),
      delay(200)
    );
  }

  createPackage(pkg: Partial<Package>): Observable<Package> {
    const newPkg: Package = {
      ...this.getDefaultPackage(),
      ...pkg,
      id: 'pkg-' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as Package;
    const current = this.packages$.getValue();
    this.packages$.next([...current, newPkg]);
    return of(newPkg).pipe(delay(300));
  }

  updatePackage(id: string, updates: Partial<Package>): Observable<Package> {
    const current = this.packages$.getValue();
    const idx = current.findIndex(p => p.id === id);
    if (idx > -1) {
      const updated = { ...current[idx], ...updates, updatedAt: new Date() };
      const newList = [...current];
      newList[idx] = updated;
      this.packages$.next(newList);
      return of(updated).pipe(delay(250));
    }
    throw new Error(`Package ${id} not found`);
  }

  toCardView(pkg: Package): PackageCardView {
    const remaining = pkg.totalCapacity - pkg.soldCount - pkg.reservedCount;
    return {
      id: pkg.id,
      title: pkg.title,
      thumbnailUrl: pkg.thumbnailUrl || 'assets/images/packages/default.jpg',
      type: pkg.type,
      status: pkg.status,
      bookingMode: pkg.bookingMode,
      isInstantBooking: pkg.isInstantBooking,
      isVerified: pkg.isVerified,
      visaStatus: pkg.visaStatus,
      validFrom: pkg.validFrom,
      validTo: pkg.validTo,
      nights: pkg.nights,
      remainingInventory: remaining,
      totalCapacity: pkg.totalCapacity,
      sellingPrice: pkg.pricingConfig.finalSellingPrice,
      currency: pkg.pricingConfig.currency,
      hasMarkup: !!pkg.pricingConfig.agentMargin,
      markupAmount: pkg.pricingConfig.agentMargin?.calculatedAmount,
      makkahHotelCount: pkg.makkahHotels.length,
      madinahHotelCount: pkg.madinahHotels.length,
      transportCount: pkg.transportation.length,
      ticketCount: pkg.tickets.length,
      cateringCount: pkg.catering.length,
      ownership: pkg.ownership,
      tags: pkg.tags
    };
  }

  private getDefaultPackage(): Partial<Package> {
    return {
      type: PackageType.SHARED,
      status: PackageStatus.DRAFT,
      isInstantBooking: false,
      isVerified: false,
      makkahHotels: [],
      madinahHotels: [],
      transportation: [],
      tickets: [],
      catering: [],
      tags: [],
      nights: 0,
      paxCount: 1,
      totalCapacity: 0,
      soldCount: 0,
      reservedCount: 0
    };
  }
}
