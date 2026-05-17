import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';
import {CateringFoodTypeModel, CityDistData, TripPathModel, CateringTypeModel, CarTypeModel, HotelRoomTypeModel, AdminAPIClient, HotelCategoryModel } from 'src/app/services/admin.api.client';

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
  private adminAPIClient = inject(AdminAPIClient);

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
    // We can use a pattern for loading that reduces repetition
    this.loadLookup(this.adminAPIClient.getTripPathsLookup(), this.tripPaths, this.isLoadingTripPahts);
    this.loadLookup(this.adminAPIClient.getCarTypesLookup(), this.carTypes, this.isLoadingCarTypes);
    this.loadLookup(this.adminAPIClient.getFoodTypesLookup(), this.foodTypes, this.isLoadingFoodTypes);
    this.loadLookup(this.adminAPIClient.getCateringTypesLookup(), this.cateringTypes, this.isLoadingCateringTypes);
    this.loadLookup(this.adminAPIClient.getRoomTypes(), this.roomTypes, this.isLoadingRoomTypes);
    this.loadLookup(this.adminAPIClient.getDistrictsLookup({ cityId: 1 }), this.distinctsMakkah, this.isLoadingDistinctsMakkah);
    this.loadLookup(this.adminAPIClient.getDistrictsLookup({ cityId: 2 }), this.distinctsMadinah, this.isLoadingDistinctsMadinah);
    this.loadLookup(this.adminAPIClient.getHotelCategories({pageIndex:0,pageSize:100}), this.hotelCategories, this.isLoadingHotelCategories);
  }

  private loadLookup<T>(
    observable: Observable<T[]>,
    signalToUpdate: WritableSignal<T[]>,
    loadingSignal: WritableSignal<boolean>
): void {
    loadingSignal.set(true);
    observable.subscribe({
        next: (data) => {
            signalToUpdate.set(data ?? []);
        },
        error: () => {
            signalToUpdate.set([]);
            loadingSignal.set(false);
        },
        complete: () => {
            loadingSignal.set(false);
        }
    });
}

}
