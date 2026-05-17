import { inject, Injectable } from '@angular/core';
import { PackageBuilderStateManagementService } from './package-builder-state-management-service';
import { Observable } from 'rxjs';
import { AdminAPIClient, SeroPackageCateringModel, SeroPackageHotelCountModel, SeroPackageHotelModel, SeroPackageModel, SeroPackageTicketModel, SeroPackageTripModel } from 'src/app/services/admin.api.client';


@Injectable({
  providedIn: 'root'
})
export class PackageSubmissionService {
  private adminAPIClient = inject(AdminAPIClient);
  private state = inject(PackageBuilderStateManagementService);
  // private userService = inject(UserInfoService);

  submitPackage(): Observable<any> { // Adjust return type based on actual API response
    const payload = this.buildPayload();
    return this.adminAPIClient.createPackage({ body: payload });
  }

  updatePackage(pkgId: number): Observable<any> { // Adjust return type based on actual API response
 
    const payload = this.buildPayload();
    return this.adminAPIClient.updatePackage({ packageId: pkgId, body: payload });
  }



  private buildPayload(): SeroPackageModel {
    const seroPackageHotelData: SeroPackageHotelModel[] = [];
    const seroPackageHotelCountData: SeroPackageHotelCountModel[] = [];
    const seroPackageTripModelData: SeroPackageTripModel[] = [];
    const seroPackageCateringModelData: SeroPackageCateringModel[] = [];
    const seroPackageTicketModelData: SeroPackageTicketModel[] = [];

    // Helper to create hotel models
    const createHotelModel = (cityId: number, state: any, type: 'specific' | 'criteria'): SeroPackageHotelModel => {
      let seroPackageHotelModel:SeroPackageHotelModel={}
      let NightsCount = 0;
      const cityName = this.getCity(cityId);
      if (type === 'specific') {
        if (cityId === 1 && !this.state.makkahHotelCountState().nightsCountEnabled) {
          NightsCount = state.specific.nightCount;
        }
        if (cityId === 2 && !this.state.madinaHotelCountState().nightsCountEnabled) {
          NightsCount = state.specific.nightCount;
        }

        if (state.specific.Id) {
          seroPackageHotelModel.Id = state.specific.Id;
        }
        
        if (state.specific.SeroPackageId) {
          seroPackageHotelModel.SeroPackageId = state.specific.SeroPackageId;
        }
        seroPackageHotelModel.CityId = cityId;
        seroPackageHotelModel.CityName = cityName;
        seroPackageHotelModel.HotelId = state.specific.hotelId;
        seroPackageHotelModel.HotelName = state.specific.hotelName;
        seroPackageHotelModel.NightsCount = NightsCount;
        seroPackageHotelModel.RoomTypeID = state.specific.roomTypeId;
        seroPackageHotelModel.RoomTypeName = state.specific.roomTypeName;
        seroPackageHotelModel.RoomCount = state.specific.roomCount;
        seroPackageHotelModel.Price = state.sellingPrice ?? null;

        return seroPackageHotelModel;
      } else if (type === 'criteria') { // criteria
        if (cityId === 1 && !this.state.makkahHotelCountState().nightsCountEnabled) {
          NightsCount = state.criteria.nightCount;
        }
         if (cityId === 2 && !this.state.madinaHotelCountState().nightsCountEnabled) {
          NightsCount = state.criteria.nightCount;
        }
         if (state.criteria.Id) {
          seroPackageHotelModel.Id = state.criteria.Id;
        }
        
        if (state.criteria.SeroPackageId) {
          seroPackageHotelModel.SeroPackageId = state.criteria.SeroPackageId;
        }

        seroPackageHotelModel.CityId = cityId;
        seroPackageHotelModel.CityName = cityName;
        seroPackageHotelModel.DistrictId = state.criteria.districtId;
        seroPackageHotelModel.DistrictName = state.criteria.districtName;
        seroPackageHotelModel.HotelStar = state.criteria.starRank;
        seroPackageHotelModel.NightsCount = NightsCount;
        seroPackageHotelModel.RoomTypeID = state.criteria.roomTypeId;
        seroPackageHotelModel.RoomTypeName = state.criteria.roomTypeName;
        seroPackageHotelModel.HotelCategoryID = state.criteria.HotelCategoryID;
        seroPackageHotelModel.HotelCategoryName = state.criteria.HotelCategoryName;
        seroPackageHotelModel.RoomCount = state.criteria.roomCount;
        seroPackageHotelModel.Price = state.sellingPrice ?? null;
        return seroPackageHotelModel;
      } else {
        return {};
      }
    };

    // 1. Add constants for city IDs
    const CITY_IDS = {
      MAKKAH: 1,
      MADINAH: 2
    } as const;

    // 2. Fix property name consistency
    const createHotelCountModel = (cityId: number): SeroPackageHotelCountModel | null => {
      // 3. Add parameter validation
      if (![CITY_IDS.MAKKAH, CITY_IDS.MADINAH].includes(cityId as 1 | 2)) {
        return null;
      }

      const cityName = this.getCity(cityId);

      if (cityId == CITY_IDS.MAKKAH) {
        if (this.state.makkahHotelCountState().nightsCountEnabled) {
          return {
            CityId: cityId,
            CityName: cityName,
            NightCount: this.state.makkahHotelCountState().nightsCount,
          }
        }
      }

      if (cityId == CITY_IDS.MADINAH) {
        if (this.state.madinaHotelCountState().nightsCountEnabled) {
          return {
            CityId: cityId,
            CityName: cityName,
            NightCount: this.state.madinaHotelCountState().nightsCount,
          }
        }
      }

      const state = cityId === CITY_IDS.MAKKAH
        ? this.state.makkahHotelListState()
        : this.state.madinaHotelListState();

      if (!state || state.length === 0) {
        return null; // Return null instead of empty object
      }
      
      return {
        CityId: cityId,
        CityName: cityName,
        NightCount: undefined,
      };
    };

    const createTripModel = (state: any): SeroPackageTripModel => {
      const seroPackageTripModel: SeroPackageTripModel = {};
      if (state.Id) {
        seroPackageTripModel.Id = state.Id;
      }
      if (state.SeroPackageId) {
        seroPackageTripModel.SeroPackageId = state.SeroPackageId;
      }
      seroPackageTripModel.TripPathId = state.tripRouteId;
      seroPackageTripModel.CarTypeId = state.transportTypeId;
      seroPackageTripModel.VehiclesCount = state.numberOfVehicles;
      seroPackageTripModel.Price = state.sellingPrice ?? null;
      return seroPackageTripModel;
    };

    const createCateringModel = (state: any): SeroPackageCateringModel => {
      const seroPackageCateringModel: SeroPackageCateringModel = {};
      if (state.Id) {
        seroPackageCateringModel.Id = state.Id;
      }
      if (state.SeroPackageId) {
        seroPackageCateringModel.SeroPackageId = state.SeroPackageId;
      }
      seroPackageCateringModel.CateringTypeId = state.mealTypeId;
      seroPackageCateringModel.FoodTypeId = state.foodTypeId;
      seroPackageCateringModel.Count = state.mealCount;
      seroPackageCateringModel.Price = state.sellingPrice ?? null;
      return seroPackageCateringModel;
    };

    const createTicketModel = (state: any): SeroPackageTicketModel => {
      const seroPackageTicketModel: SeroPackageTicketModel = {};
      if (state.Id) {
        seroPackageTicketModel.Id = state.Id;
      }
      if (state.SeroPackageId) {
        seroPackageTicketModel.SeroPackageId = state.SeroPackageId;
      }
      seroPackageTicketModel.SourceCountryID = state.sourceCountryID;
      seroPackageTicketModel.SourceCityID = state.sourceCityID;
      seroPackageTicketModel.SourceCountryName = state.sourceCountryName;
      seroPackageTicketModel.SourceCityName = state.sourceCityName;
      seroPackageTicketModel.DestinationCountryID = state.destinationCountryID;
      seroPackageTicketModel.DestinationCityID = state.destinationCityID;
      seroPackageTicketModel.DestinationCountryName = state.destinationCountryName;
      seroPackageTicketModel.DestinationCityName = state.destinationCityName;
      seroPackageTicketModel.AirlineCompanyID = state.airlineCompanyID;
      seroPackageTicketModel.AirlineCompanyNameEn = state.airlineCompanyNameEn ?? undefined;
      seroPackageTicketModel.AirlineCompanyNameAr = state.airlineCompanyNameAr ?? undefined;
      seroPackageTicketModel.SeatCount = state.seatCount;
      seroPackageTicketModel.TripType = state.tripType;
      seroPackageTicketModel.TravelClass = state.travelClass;
      seroPackageTicketModel.Price = state.sellingPrice ?? null;
      return seroPackageTicketModel;
    };



    const makkahHotelCount = createHotelCountModel(CITY_IDS.MAKKAH);
    if (makkahHotelCount && Object.keys(makkahHotelCount).length > 0) {
      seroPackageHotelCountData.push(makkahHotelCount);
    }
    const madinaHotelCount = createHotelCountModel(CITY_IDS.MADINAH);
    if (madinaHotelCount && Object.keys(madinaHotelCount).length > 0) {
      seroPackageHotelCountData.push(madinaHotelCount);
    }

    // Makkah Hotels
    this.state.makkahHotelListState().forEach(makkahHotelState => {
      if (makkahHotelState.activeTab === "criteria") {
        const makkahHotelCriteria = createHotelModel(1, makkahHotelState, 'criteria');

        if (makkahHotelCriteria && Object.keys(makkahHotelCriteria).length > 0) {
          seroPackageHotelData.push(makkahHotelCriteria);
        }
      } else if (makkahHotelState.activeTab === "specific") {
        const makkahHotelSpecific = createHotelModel(1, makkahHotelState, 'specific');
        if (makkahHotelSpecific && Object.keys(makkahHotelSpecific).length > 0) {
          seroPackageHotelData.push(makkahHotelSpecific);
        }
      }
    });

    // Madinah Hotels
    this.state.madinaHotelListState().forEach(madinaHotelState => {
      if (madinaHotelState.activeTab === "criteria") {
        const madinahHotelCriteria = createHotelModel(2, madinaHotelState, 'criteria');
        if (madinahHotelCriteria && Object.keys(madinahHotelCriteria).length > 0) {
          seroPackageHotelData.push(madinahHotelCriteria);
        }
      } else if (madinaHotelState.activeTab === "specific") {
        const madinahHotelSpecific = createHotelModel(2, madinaHotelState, 'specific');
        if (madinahHotelSpecific && Object.keys(madinahHotelSpecific).length > 0) {
          seroPackageHotelData.push(madinahHotelSpecific);
        }
      }
    });
    this.state.transportListState().forEach(transportState => {
      seroPackageTripModelData.push(createTripModel(transportState));
    });
    this.state.foodListState().forEach(foodState => {
      seroPackageCateringModelData.push(createCateringModel(foodState));
    });
    this.state.ticketListState().forEach(ticketState => {
      seroPackageTicketModelData.push(createTicketModel(ticketState));
    });


    let pkg : SeroPackageModel = {
      // Consider if these are truly hardcoded or should come from state
      Title: this.state.finalDetailsState().title, // Consider if these are truly hardcoded or should come from state
      Price: this.state.finalDetailsState().price,
      PackageCode: this.state.finalDetailsState().packageCode,
      IsActive: this.state.finalDetailsState().isActive ?? true,
      VerifiedPrice: this.state.pricingState().pricingVerification !== 'approximate',
      BlendedPrice: this.state.pricingState().hideBreakdown ?? false,
      // PassengerCount: this.state.finalDetailsState().numberOfPassengers,
      StartDate: this.state.finalDetailsState().startDate,
      EndDate: this.state.finalDetailsState().endDate,
      AddedDate: new Date(),
      IsVisaIncluded: this.state.finalDetailsState().includedVisa,
      GuestCount: this.state.finalDetailsState().guestCount,
      Quantity: this.state.finalDetailsState().quantity,
      Hotels: seroPackageHotelData,
      HotelCounts: seroPackageHotelCountData,
      Agents: this.state.finalDetailsState().agents,
      Tags: this.state.finalDetailsState().tags,
      Trips: seroPackageTripModelData,
      Tickets: seroPackageTicketModelData,
      Caterings: seroPackageCateringModelData,
    };

    if (this.state.finalDetailsState().packageId) {
      pkg.PackageID=this.state.finalDetailsState().packageId;
    }

    return pkg;
  }

  private getCity(cityId: number): string | null | undefined {
    return cityId === 1 ? "Makkah" : "Madinah";
  }
}
