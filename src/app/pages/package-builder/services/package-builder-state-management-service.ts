import { Injectable, signal, inject } from '@angular/core';
import { AdminAPIClient, SeroPackageAgentModel, SeroPackageModel, SeroPackageTicketModel, TagBasicModel } from 'src/app/services/admin.api.client';


export interface HotelCriteriaState {
  Id?: number;
  SeroPackageId?: number;
  districtId?: number;
  districtName?: string;
  starRank?: number;
  roomTypeId?: number;
  roomTypeName?: string;
  nightCount?: number;
  HotelCategoryID?: number | null;
  HotelCategoryName?: string | null;
  roomCount?: number;
}

export interface HotelSpecificState {
  Id?: number;
  SeroPackageId?: number;
  hotelId?: number;
  hotelName?: string;
  roomTypeId?: number;
  roomTypeName?: string;
  nightCount?: number;
  roomCount?: number;
}

export interface HotelState {
  activeTab: string; // 'criteria' | 'specific'
  criteria: HotelCriteriaState;
  specific: HotelSpecificState;
  isSkipped: boolean;
  sellingPrice?: number;
}

export interface HotelCountState {
  Id?: number;
  SeroPackageId?: number;
  cityId: number;
  cityName: string;
  nightsCount: number;
  isSkipped: boolean;
  nightsCountEnabled: boolean;
}

export interface TransportState {
  Id?: number;
  SeroPackageId?: number;
  tripRouteId?: number;
  tripRoute?: string;
  transportTypeId?: number;
  transportType?: string;
  numberOfVehicles?: number;
  sellingPrice?: number;
}

export interface FoodState {
  Id?: number;
  SeroPackageId?: number;
  mealTypeId?: number;
  foodTypeId?: number;
  foodType?: string;
  mealType?: string;
  mealCount?: number;
  sellingPrice?: number;
}

export interface TicketState {
  Id?: number;
  SeroPackageId?: number;
  sourceCountryID?: number;
  sourceCountryName?: string;
  sourceCityID?: number;
  sourceCityName?: string;
  destinationCountryID?: number;
  destinationCountryName?: string;
  destinationCityID?: number;
  destinationCityName?: string;
  airlineCompanyID?: number;
  airlineCompanyName?: string;
  airlineCompanyNameEn?: string;
  airlineCompanyNameAr?: string;
  seatCount?: number;
  tripType?: string;
  travelClass?: string;
  sellingPrice?: number;
}



export interface FinalDetailsState {
  packageId?: number;
  packageCode?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  price?: number;
  includedVisa?: boolean;
  title?: string;
  agents?: SeroPackageAgentModel[]
  tags?: TagBasicModel[];
  guestCount?: number;
  quantity?: number;
}

export interface PricingState {
  markupValue?: number;
  markupType?: 'percent' | 'fixed';
  blendedPrice?: number;
  hideBreakdown?: boolean;
  pricingVerification?: 'verified' | 'approximate';
}


@Injectable({
  providedIn: 'root'
})
export class PackageBuilderStateManagementService {
  // step1 & step2: hotel
  readonly makkahHotelState = signal<HotelState>({
    activeTab: 'criteria',
    criteria: {
      districtId: undefined,
      districtName: '',
      starRank: undefined,
      roomTypeId: undefined,
      roomTypeName: '',
      HotelCategoryID: null,
      HotelCategoryName: null,
      nightCount: 1,
      roomCount: 1
    },
    specific: {
      hotelId: undefined,
      hotelName: '',
      roomTypeId: undefined,
      roomTypeName: '',
      nightCount: 1,
      roomCount: 1
    },
    isSkipped: false
  });

  readonly makkahHotelListState = signal<HotelState[]>([]);
  readonly makkahHotelCountState = signal<HotelCountState>({
    cityId: 1, // Makkah
    cityName: 'Makkah',
    nightsCount: 0,
    isSkipped: false,
    nightsCountEnabled: false,
  });


  readonly madinaHotelState = signal<HotelState>({
    activeTab: 'criteria',
    criteria: {
      districtId: undefined,
      districtName: '',
      starRank: undefined,
      roomTypeId: undefined,
      roomTypeName: '',
      HotelCategoryID: null,
      HotelCategoryName: null,
      nightCount: 1,
      roomCount: 1
    },
    specific: {
      hotelId: undefined,
      hotelName: '',
      roomTypeId: undefined,
      roomTypeName: '',
      nightCount: 1,
      roomCount: 1
    },
    isSkipped: false
  });

  readonly madinaHotelListState = signal<HotelState[]>([]);
  readonly madinaHotelCountState = signal<HotelCountState>({
    cityId: 2, // Madina
    cityName: 'Madina',
    nightsCount: 0,
    isSkipped: false,
    nightsCountEnabled: false,
  });

  updateMakkahHotelCount(key: string, value: any) {
    const s = this.makkahHotelCountState();
    this.makkahHotelCountState.set({ ...s, [key]: value });

    if (key == "nightsCount") {
      this.makkahHotelListState.update(arr =>
        arr.map(hotel =>
          hotel.activeTab === 'criteria'
            ? { ...hotel, criteria: { ...hotel.criteria, nightCount: value } }
            : hotel.activeTab === 'specific'
              ? { ...hotel, specific: { ...hotel.specific, nightCount: value } }
              : hotel
        )
      );

      if (this.makkahHotelState().activeTab) {
        this.updateMakkahHotel(this.makkahHotelState().activeTab as 'criteria' | 'activeTab' | 'specific' | 'isSkipped', "nightCount", value);
      }
    }
  }

  updateMadinaHotelCount(key: string, value: any) {
    const s = this.madinaHotelCountState();
    this.madinaHotelCountState.set({ ...s, [key]: value });

    if (key == "nightsCount") {
      this.madinaHotelListState.update(arr =>
        arr.map(hotel =>
          hotel.activeTab === 'criteria'
            ? { ...hotel, criteria: { ...hotel.criteria, nightCount: value } }
            : hotel.activeTab === 'specific'
              ? { ...hotel, specific: { ...hotel.specific, nightCount: value } }
              : hotel
        )
      );

      if (this.madinaHotelState().activeTab) {
        this.updateMadinaHotel(this.madinaHotelState().activeTab as 'criteria' | 'activeTab' | 'specific' | 'isSkipped', "nightCount", value);
      }
    }
  }

  updateMakkahHotel(tab: 'activeTab' | 'criteria' | 'specific' | 'isSkipped', key: string, value: any) {
    const s = this.makkahHotelState();
    if (tab === 'activeTab') {
      this.makkahHotelState.set({ ...s, activeTab: value });
    } else if (tab === 'criteria') {
      this.makkahHotelState.set({
        ...s,
        criteria: { ...s.criteria, [key]: value }
      });
    } else if (tab === 'specific') {
      this.makkahHotelState.set({
        ...s,
        specific: { ...s.specific, [key]: value }
      });
    } else if (tab === 'isSkipped') {
      this.makkahHotelState.set({ ...s, isSkipped: value });
    }
  }

  addMakkahHotel() {
    this.makkahHotelListState.update((arr: HotelState[]) => [
      ...arr,
      this.makkahHotelState()
    ]);
    this.makkahHotelState.set({
      activeTab: this.makkahHotelState().activeTab,
      criteria: {
        districtId: undefined,
        districtName: '',
        starRank: undefined,
        roomTypeId: undefined,
        roomTypeName: '',
        HotelCategoryID: null,
        HotelCategoryName: null,
        nightCount: this.makkahHotelCountState().nightsCountEnabled ? this.makkahHotelCountState().nightsCount : this.makkahHotelState().criteria?.nightCount ?? 0,
        roomCount: 1,
      },
      specific: {
        hotelId: undefined,
        hotelName: '',
        roomTypeId: undefined,
        roomTypeName: '',
        nightCount: this.makkahHotelCountState().nightsCountEnabled ? this.makkahHotelCountState().nightsCount : this.makkahHotelState().specific?.nightCount ?? 0,
        roomCount: 1,
      },
      isSkipped: false
    });
  }

  resetMakkahHotelStateAndLists() {
    this.makkahHotelState.set({
      activeTab: 'criteria',
      criteria: {
        districtId: undefined,
        districtName: '',
        starRank: undefined,
        roomTypeId: undefined,
        roomTypeName: '',
        HotelCategoryID: null,
        HotelCategoryName: null,
        nightCount: 1,
        roomCount: 1
      },
      specific: {
        hotelId: undefined,
        hotelName: '',
        roomTypeId: undefined,
        roomTypeName: '',
        nightCount: 1,
        roomCount: 1
      },
      isSkipped: false
    });
    this.makkahHotelListState.set([]);
    this.makkahHotelCountState.set({
      cityId: 1,
      cityName: 'Makkah',
      nightsCount: 0,
      isSkipped: false,
      nightsCountEnabled: false
    });
  }

  removeMakkahHotel(index: number) {
    this.makkahHotelListState.update(arr => arr.filter((_, i) => i !== index));
  }

  addMadinaHotel() {
    this.madinaHotelListState.update((arr: HotelState[]) => [
      ...arr,
      this.madinaHotelState()
    ]);
    this.madinaHotelState.set({
      activeTab: this.madinaHotelState().activeTab,
      criteria: {
        districtId: undefined,
        districtName: '',
        starRank: undefined,
        roomTypeId: undefined,
        roomTypeName: '',
        HotelCategoryID: null,
        HotelCategoryName: null,
        nightCount: this.madinaHotelState().criteria?.nightCount ?? 0,
        roomCount: 1,
      },
      specific: {
        hotelId: undefined,
        hotelName: '',
        roomTypeId: undefined,
        roomTypeName: '',
        nightCount: this.madinaHotelState().specific?.nightCount ?? 0,
        roomCount: 1,
      },
      isSkipped: false
    });
  }

  resetMadinaHotelStateAndLists() {
    this.madinaHotelState.set({
      activeTab: 'criteria',
      criteria: {
        districtId: undefined,
        districtName: '',
        starRank: undefined,
        roomTypeId: undefined,
        roomTypeName: '',
        HotelCategoryID: null,
        HotelCategoryName: null,
        nightCount: 1,
        roomCount: 1
      },
      specific: {
        hotelId: undefined,
        hotelName: '',
        roomTypeId: undefined,
        roomTypeName: '',
        nightCount: 1,
        roomCount: 1
      },
      isSkipped: false
    });
    this.madinaHotelListState.set([]);
    this.madinaHotelCountState.set({
      cityId: 2,
      cityName: 'Madina',
      nightsCount: 0,
      isSkipped: false,
      nightsCountEnabled: false
    });
  }

  removeMadinaHotel(index: number) {
    this.madinaHotelListState.update(arr => arr.filter((_, i) => i !== index));
  }

  updateMadinaHotel(tab: 'activeTab' | 'criteria' | 'specific' | 'isSkipped', key: string, value: any) {
    const s = this.madinaHotelState();
    if (tab === 'activeTab') {
      this.madinaHotelState.set({ ...s, activeTab: value });
    } else if (tab === 'criteria') {
      this.madinaHotelState.set({
        ...s,
        criteria: { ...s.criteria, [key]: value }
      });
    } else if (tab === 'specific') {
      this.madinaHotelState.set({
        ...s,
        specific: { ...s.specific, [key]: value }
      });
    } else if (tab === 'isSkipped') {
      this.madinaHotelState.set({ ...s, isSkipped: value });
    }
  }

  readonly finalDetailsState = signal<FinalDetailsState>({
    startDate: undefined,
    endDate: undefined,
    price: 0,
    includedVisa: false,
    title: '',
    packageCode: '',
    isActive: true,
    agents: [],
    tags: [],
    guestCount: undefined,
    quantity: undefined,
  });


  updateFinalDetails<K extends keyof FinalDetailsState>(key: K, value: FinalDetailsState[K]) {
    const s = this.finalDetailsState();
    this.finalDetailsState.set({ ...s, [key]: value });
  }

  readonly pricingState = signal<PricingState>({
    markupType: 'percent',
    markupValue: undefined,
    blendedPrice: undefined,
    hideBreakdown: false,
    pricingVerification: 'verified',
  });

  updatePricingState(partial: Partial<PricingState>) {
    this.pricingState.set({ ...this.pricingState(), ...partial });
  }

  updateMakkahHotelPricingAtIndex(index: number, value: number | undefined) {
    this.makkahHotelListState.update(arr =>
      arr.map((h, i) => i === index ? { ...h, sellingPrice: value } : h)
    );
  }

  updateMadinahHotelPricingAtIndex(index: number, value: number | undefined) {
    this.madinaHotelListState.update(arr =>
      arr.map((h, i) => i === index ? { ...h, sellingPrice: value } : h)
    );
  }

  updateTicketPricingAtIndex(index: number, value: number | undefined) {
    this.ticketListState.update(arr =>
      arr.map((t, i) => i === index ? { ...t, sellingPrice: value } : t)
    );
  }


  readonly transportListState = signal<TransportState[]>([]);
  readonly transportState = signal<TransportState>({
    tripRouteId: undefined,
    tripRoute: '',
    transportTypeId: undefined,
    transportType: '',
    numberOfVehicles: 1
  });

  updateTransport<K extends keyof TransportState>(key: K, value: TransportState[K]) {
    const s = this.transportState();
    this.transportState.set({ ...s, [key]: value });
  }

  addTransport() {
    this.transportListState.update((arr: TransportState[]) => [
      ...arr,
      this.transportState()
    ]);
    this.transportState.set({
      tripRouteId: undefined,
      tripRoute: '',
      transportTypeId: undefined,
      transportType: '',
      numberOfVehicles: 1
    });
  }

  updateTransportAtIndex(index: number, key: keyof TransportState, value: any) {
    this.transportListState.update(arr => {
      const updated = arr.map((f, i) =>
        i === index ? { ...f, [key]: value } : f
      );
      return updated;
    });
  }

  removeTransport(index: number) {
    this.transportListState.update(arr => arr.filter((_, i) => i !== index));
  }

  updateTransportPricingAtIndex(index: number, value: number | undefined) {
    this.transportListState.update(arr =>
      arr.map((t, i) => i === index ? { ...t, sellingPrice: value } : t)
    );
  }


  readonly foodListState = signal<FoodState[]>([]);
  readonly foodState = signal<FoodState>({
    mealTypeId: undefined,
    foodTypeId: undefined,
    mealType: '',
    foodType: '',
    mealCount: 1
  });

  readonly ticketListState = signal<TicketState[]>([]);
  readonly ticketState = signal<TicketState>({
    sourceCountryID: undefined,
    sourceCountryName: '',
    sourceCityID: undefined,
    sourceCityName: '',
    destinationCountryID: undefined,
    destinationCountryName: '',
    destinationCityID: undefined,
    destinationCityName: '',
    airlineCompanyID: undefined,
    airlineCompanyName: '',
    airlineCompanyNameEn: '',
    airlineCompanyNameAr: '',
    seatCount: 1,
    tripType: '',
    travelClass: ''
  });

  updateFood<K extends keyof FoodState>(key: K, value: FoodState[K]) {
    const s = this.foodState();
    this.foodState.set({ ...s, [key]: value });
  }

  addFood() {
    this.foodListState.update((arr: FoodState[]) => [
      ...arr,
      this.foodState()
    ]);
    this.foodState.set({
      foodTypeId: undefined,
      foodType: '',
      mealTypeId: undefined,
      mealType: '',
      mealCount: 1
    });
  }

  updateFoodAtIndex(index: number, key: keyof FoodState, value: any) {
    this.foodListState.update(arr => {
      const updated = arr.map((f, i) =>
        i === index ? { ...f, [key]: value } : f
      );
      return updated;
    });
  }

  removeFood(index: number) {
    this.foodListState.update(arr => arr.filter((_, i) => i !== index));
  }

  updateFoodPricingAtIndex(index: number, value: number | undefined) {
    this.foodListState.update(arr =>
      arr.map((f, i) => i === index ? { ...f, sellingPrice: value } : f)
    );
  }

  updateTicket<K extends keyof TicketState>(key: K, value: TicketState[K]) {
    const s = this.ticketState();
    this.ticketState.set({ ...s, [key]: value });
  }

  addTicket() {
    this.ticketListState.update((arr: TicketState[]) => [
      ...arr,
      this.ticketState()
    ]);
    this.ticketState.set({
      sourceCountryID: undefined,
      sourceCountryName: '',
      sourceCityID: undefined,
      sourceCityName: '',
      destinationCountryID: undefined,
      destinationCountryName: '',
      destinationCityID: undefined,
      destinationCityName: '',
      airlineCompanyID: undefined,
      airlineCompanyName: '',
      airlineCompanyNameEn: '',
      airlineCompanyNameAr: '',
      seatCount: 1,
      tripType: '',
      travelClass: ''
    });
  }

  removeTicket(index: number) {
    this.ticketListState.update(arr => arr.filter((_, i) => i !== index));
  }

  reset() {
    this.makkahHotelState.set({
      activeTab: 'criteria',
      criteria: {
        districtId: undefined,
        districtName: '',
        starRank: undefined,
        roomTypeId: undefined,
        roomTypeName: '',
        HotelCategoryID: null,
        HotelCategoryName: null,
        nightCount: 1,
        roomCount: 1
      },
      specific: {
        hotelId: undefined,
        hotelName: '',
        roomTypeId: undefined,
        roomTypeName: '',
        nightCount: 1,
        roomCount: 1
      },
      isSkipped: false
    });
    this.madinaHotelState.set({
      activeTab: 'criteria',
      criteria: {
        districtId: undefined,
        districtName: '',
        starRank: undefined,
        roomTypeId: undefined,
        roomTypeName: '',
        HotelCategoryID: null,
        HotelCategoryName: null,
        nightCount: 1,
        roomCount: 1
      },
      specific: {
        hotelId: undefined,
        hotelName: '',
        roomTypeId: undefined,
        roomTypeName: '',
        nightCount: 1,
        roomCount: 1
      },
      isSkipped: false
    });
    this.finalDetailsState.set({
      packageId: undefined,
      packageCode: '',
      isActive: true,
      startDate: undefined,
      endDate: undefined,
      price: undefined,
      includedVisa: undefined,
      title: undefined,
      agents: [],
      guestCount: undefined,
      quantity: undefined,
    });
    this.transportState.set({
      tripRouteId: undefined,
      tripRoute: '',
      transportTypeId: undefined,
      transportType: '',
      numberOfVehicles: 1
    });
    this.foodState.set({
      mealTypeId: undefined,
      foodTypeId: undefined,
      foodType: '',
      mealType: '',
      mealCount: 1
    });
    this.ticketState.set({
      sourceCountryID: undefined,
      sourceCountryName: '',
      sourceCityID: undefined,
      sourceCityName: '',
      destinationCountryID: undefined,
      destinationCountryName: '',
      destinationCityID: undefined,
      destinationCityName: '',
      airlineCompanyID: undefined,
      airlineCompanyName: '',
      airlineCompanyNameEn: '',
      airlineCompanyNameAr: '',
      seatCount: 1,
      tripType: '',
      travelClass: ''
    });
    this.foodListState.set([]);
    this.ticketListState.set([]);
    this.transportListState.set([]);
    this.madinaHotelListState.set([]);
    this.makkahHotelListState.set([]);
    this.madinaHotelCountState.set({
      cityId: 2, // Madina
      cityName: 'Madina',
      nightsCount: 0,
      isSkipped: false,
      nightsCountEnabled: false,
    });
    this.makkahHotelCountState.set({
      cityId: 1, // Makkah
      cityName: 'Makkah',
      nightsCount: 0,
      isSkipped: false,
      nightsCountEnabled: false,
    });
    this.resetMadinaHotelStateAndLists();
    this.resetMakkahHotelStateAndLists();
    this.pricingState.set({
      markupType: 'percent',
      markupValue: undefined,
      blendedPrice: undefined,
      hideBreakdown: false,
      pricingVerification: 'verified',
    });
  }

  editPackage(pkg: SeroPackageModel) {
    this.reset();

    this.finalDetailsState.set({
      packageId: pkg.PackageID,
      packageCode: pkg.PackageCode ?? '',
      isActive: pkg.IsActive ?? false,
      startDate: pkg.StartDate ? new Date(pkg.StartDate) : undefined,
      endDate: pkg.EndDate ? new Date(pkg.EndDate) : undefined,
      price: pkg.Price ?? undefined,
      includedVisa: pkg.IsVisaIncluded,
      title: pkg.Title ?? '',
      agents: pkg.Agents ?? [],
      tags: pkg.Tags ?? [],
      guestCount: pkg.GuestCount,
      quantity: pkg.Quantity,
    });

    this.pricingState.set({
      markupType: 'percent',
      markupValue: undefined,
      blendedPrice: pkg.Price ?? undefined,
      hideBreakdown: pkg.BlendedPrice ?? false,
      pricingVerification: pkg.VerifiedPrice === false ? 'approximate' : 'verified',
    });

    pkg.Trips?.forEach(trip => {
      this.transportState.set({
        Id: trip.Id,
        SeroPackageId: trip.SeroPackageId,
        tripRouteId: trip.TripPathId,
        tripRoute: trip.TripPath ?? '',
        transportTypeId: trip.CarTypeId,
        transportType: trip.CarType ?? '',
        numberOfVehicles: trip.VehiclesCount ?? 0,
        sellingPrice: trip.Price ?? undefined,
      });
      this.addTransport();
    });

    pkg.Caterings?.forEach(catering => {
      this.foodState.set({
        Id: catering.Id,
        SeroPackageId: catering.SeroPackageId,
        mealTypeId: catering.CateringTypeId,
        foodTypeId: catering.FoodTypeId,
        foodType: catering.FoodType ?? '',
        mealType: catering.CateringType ?? '',
        mealCount: catering.Count,
        sellingPrice: catering.Price ?? undefined,
      });
      this.addFood();
    });

    pkg.Tickets?.forEach((ticket: SeroPackageTicketModel) => {
      this.ticketState.set({
        Id: ticket.Id,
        SeroPackageId: ticket.SeroPackageId,
        sourceCountryID: ticket.SourceCountryID,
        sourceCountryName: ticket.SourceCountryName ?? '',
        sourceCityID: ticket.SourceCityID,
        sourceCityName: ticket.SourceCityName ?? '',
        destinationCountryID: ticket.DestinationCountryID,
        destinationCountryName: ticket.DestinationCountryName ?? '',
        destinationCityID: ticket.DestinationCityID,
        destinationCityName: ticket.DestinationCityName ?? '',
        airlineCompanyID: ticket.AirlineCompanyID ?? undefined,
        airlineCompanyName: ticket.AirlineCompanyNameEn ?? ticket.AirlineCompanyNameAr ?? '',
        airlineCompanyNameEn: ticket.AirlineCompanyNameEn ?? '',
        airlineCompanyNameAr: ticket.AirlineCompanyNameAr ?? '',
        seatCount: ticket.SeatCount,
        tripType: ticket.TripType ?? '',
        travelClass: ticket.TravelClass ?? '',
        sellingPrice: ticket.Price ?? undefined,
      });
      this.addTicket();
    });


    pkg.HotelCounts?.forEach(hotelCount => {
      if (hotelCount.CityId === 1) {
        this.makkahHotelCountState.set({
          Id:hotelCount.Id,
          SeroPackageId:hotelCount.SeroPackageId,
          cityId: 1, 
          cityName: hotelCount.CityName ??'Makkah',
          nightsCount: hotelCount.NightCount == undefined ? 0 : hotelCount.NightCount,
          isSkipped: false,
          nightsCountEnabled: (hotelCount.NightCount?? 0)>0,
        });
      } else if (hotelCount.CityId === 2) {
        this.madinaHotelCountState.set({
          Id:hotelCount.Id,
          SeroPackageId:hotelCount.SeroPackageId,
          cityId: 2, 
          cityName: hotelCount.CityName ??'Madina',
          nightsCount:  hotelCount.NightCount == undefined ? 0 : hotelCount.NightCount,
          isSkipped: false,
          nightsCountEnabled: (hotelCount.NightCount?? 0)>0,
        });
      }
    });

    pkg.Hotels?.forEach(hotel=>{
      let criteria: HotelCriteriaState={};
      let specific: HotelSpecificState={};
      let hotelData: HotelState={
        activeTab:'criteria',
        criteria: criteria,
        specific: specific,
        isSkipped:false
      };
       if(hotel.HotelId !== null && hotel.HotelId !== undefined && hotel.HotelId>0){
          specific.Id=hotel.Id;
          specific.SeroPackageId=hotel.SeroPackageId;
          specific.hotelName=hotel.HotelName ?? undefined;
          specific.hotelId=hotel.HotelId ?? undefined;
          specific.roomTypeId =hotel.RoomTypeID ?? undefined;
          specific.roomTypeName =hotel.RoomTypeName ?? undefined;
          specific.nightCount=hotel.NightsCount;
          specific.roomCount=hotel.RoomCount ?? 0;
          hotelData.activeTab='specific'

        }else{
          criteria.Id=hotel.Id;
          criteria.SeroPackageId=hotel.SeroPackageId;
          criteria.districtId=hotel.DistrictId  ?? undefined;
          criteria.districtName=hotel.DistrictName ?? undefined;
          criteria.nightCount=hotel.NightsCount;
          // criteria.starRank=hotel.HotelStar;
          criteria.roomTypeId =hotel.RoomTypeID ?? undefined;
          criteria.roomTypeName =hotel.RoomTypeName ?? undefined;
          criteria.HotelCategoryID=hotel.HotelCategoryID ?? null;
          criteria.HotelCategoryName=hotel.HotelCategoryName ?? null;
          criteria.roomCount=hotel.RoomCount ?? 0;
          hotelData.activeTab='criteria'
        }
        hotelData.criteria=criteria;
        hotelData.specific=specific;
        hotelData.sellingPrice=hotel.Price ?? undefined;

      if (hotel.CityId === 1) {
        hotelData.criteria.nightCount=this.makkahHotelCountState().nightsCountEnabled ? 0 : hotelData.criteria.nightCount;
        hotelData.specific.nightCount=this.makkahHotelCountState().nightsCountEnabled ? 0 : hotelData.specific.nightCount;
        this.makkahHotelState.set(hotelData);
        this.addMakkahHotel();
       
      } else if (hotel.CityId === 2) {
        hotelData.criteria.nightCount=this.madinaHotelCountState().nightsCountEnabled ? 0 : hotelData.criteria.nightCount;
        hotelData.specific.nightCount=this.madinaHotelCountState().nightsCountEnabled ? 0 : hotelData.specific.nightCount;
        this.madinaHotelState.set(hotelData);
        this.addMadinaHotel();
      }
    });
  }
}
