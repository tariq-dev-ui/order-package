import { Injectable, signal } from '@angular/core';
import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { CateringFoodTypeModel, CityDistData, TripPathModel, CateringTypeModel, CarTypeModel, HotelRoomTypeModel, HotelCategoryModel } from 'src/app/services/admin.api.client';
import {
  MOCK_DISTRICTS_MAKKAH,
  MOCK_DISTRICTS_MADINAH,
  MOCK_TRIP_PATHS,
  MOCK_CAR_TYPES,
  MOCK_FOOD_TYPES,
  MOCK_CATERING_TYPES,
  MOCK_ROOM_TYPES,
  MOCK_HOTEL_CATEGORIES,
} from './package-builder.mock';
import { WritableSignal } from '@angular/core';

export interface PackageLookupData {
  tripPaths: TripPathModel[];
  carTypes: CarTypeModel[];
  distinctsMakkah: CityDistData[];
  distinctsMadinah: CityDistData[];
  foodTypes: CateringFoodTypeModel[];
  cateringTypes: CateringTypeModel[];
}

export interface PackageLookupLoadingState {
  isLoadingTripPahts: boolean;
  isLoadingCarTypes: boolean;
  isLoadingDistinctsMakkah: boolean;
  isLoadingDistinctsMadinah: boolean;
  isLoadingFoodTypes: boolean;
  isLoadingCateringTypes: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PackageDataService {

  readonly tripPaths = signal<TripPathModel[]>([]);
  readonly carTypes = signal<CarTypeModel[]>([]);
  readonly distinctsMakkah = signal<CityDistData[]>([]);
  readonly distinctsMadinah = signal<CityDistData[]>([]);
  readonly foodTypes = signal<CateringFoodTypeModel[]>([]);
  readonly roomTypes = signal<HotelRoomTypeModel[]>([]);
  readonly cateringTypes = signal<CateringTypeModel[]>([]);
  readonly hotelCategories = signal<HotelCategoryModel[]>([]);

  readonly isLoadingDistinctsMakkah = signal(false);
  readonly isLoadingDistinctsMadinah = signal(false);
  readonly isLoadingTripPahts = signal(false);
  readonly isLoadingFoodTypes = signal(false);
  readonly isLoadingCarTypes = signal(false);
  readonly isLoadingRoomTypes = signal(false);
  readonly isLoadingCateringTypes = signal(false);
  readonly isLoadingHotelCategories = signal(false);

  constructor() {
    this.loadAllLookupData();
  }

  private loadAllLookupData(): void {
    this.loadLookup(of(MOCK_TRIP_PATHS),          this.tripPaths,         this.isLoadingTripPahts);
    this.loadLookup(of(MOCK_CAR_TYPES),            this.carTypes,          this.isLoadingCarTypes);
    this.loadLookup(of(MOCK_FOOD_TYPES),           this.foodTypes,         this.isLoadingFoodTypes);
    this.loadLookup(of(MOCK_CATERING_TYPES),       this.cateringTypes,     this.isLoadingCateringTypes);
    this.loadLookup(of(MOCK_ROOM_TYPES),           this.roomTypes,         this.isLoadingRoomTypes);
    this.loadLookup(of(MOCK_DISTRICTS_MAKKAH),     this.distinctsMakkah,   this.isLoadingDistinctsMakkah);
    this.loadLookup(of(MOCK_DISTRICTS_MADINAH),    this.distinctsMadinah,  this.isLoadingDistinctsMadinah);
    this.loadLookup(of(MOCK_HOTEL_CATEGORIES),     this.hotelCategories,   this.isLoadingHotelCategories);
  }

  private loadLookup<T>(
    observable: Observable<T[]>,
    signalToUpdate: WritableSignal<T[]>,
    loadingSignal: WritableSignal<boolean>
  ): void {
    loadingSignal.set(true);
    observable.subscribe({
      next: (data) => signalToUpdate.set(data ?? []),
      error: () => {
        signalToUpdate.set([]);
        loadingSignal.set(false);
      },
      complete: () => loadingSignal.set(false),
    });
  }
}
