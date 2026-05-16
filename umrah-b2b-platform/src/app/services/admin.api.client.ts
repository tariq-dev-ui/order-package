import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AgentPackagesMockService,
} from '../pages/sero-packages/agent-packages.service';
import {
  SeroPackageAgentModel,
  SeroPackageCateringModel,
  SeroPackageHotelCountModel,
  SeroPackageHotelModel,
  SeroPackageModel,
  SeroPackageTicketModel,
  SeroPackageTripModel,
  TagBasicModel,
  TagModel,
} from '../pages/sero-packages/agent-package.model';
import { mockPackageTags } from '../pages/sero-packages/agent-packages.mock';

export type {
  SeroPackageAgentModel,
  SeroPackageCateringModel,
  SeroPackageHotelCountModel,
  SeroPackageHotelModel,
  SeroPackageModel,
  SeroPackageTicketModel,
  SeroPackageTripModel,
  TagBasicModel,
  TagModel,
};

export interface FileParameter {
  data: File;
  fileName: string;
}

export interface PdfReportResult {
  Content?: string;
  ContentType?: string;
  FileName?: string;
}

export interface RequestModel {
  PassengerCount?: number;
  RequestedQuantity?: number;
  StartDate?: Date | string;
  EndDate?: Date | string;
  StatusName?: string;
  AddedDate?: Date | string;
  AgentName?: string;
  AgentCountry?: string;
  AgentCode?: string;
  Notes?: string;
  PackageModel?: SeroPackageModel;
}

export interface AgentModel {
  AgentID?: number;
  AgentName?: string;
  AgentEmail?: string;
  LogoImageLocation?: string;
  CountryID?: number;
  CountryName?: string;
  CityID?: number;
  CityName?: string;
  MasterAgentID?: number | null;
}

export interface AgentRepresenterModel {
  Name?: string;
  Email?: string;
  Phone?: string;
}

export interface CountryData {
  CountryID?: number;
  Title?: string;
  TitleEnglish?: string;
  Code?: string;
}

export interface RegionModel {
  RegionID?: number;
  Title?: string;
  TitleEnglish?: string;
  CountryID?: number;
}

export interface CityData {
  CityID?: number;
  Name?: string;
  NameEn?: string;
  CountryID?: number;
  RegionID?: number;
}

export interface CityDistData {
  CityDistID?: number;
  DistTitle?: string;
  CityID?: number;
}

export interface TripPathModel {
  TripPathID?: number;
  Title?: string;
  TitleEn?: string;
}

export interface CarTypeModel {
  CarTypeID?: number;
  Title?: string;
  TitleEn?: string;
}

export interface CateringFoodTypeModel {
  Id?: number;
  TypeName?: string;
}

export interface CateringTypeModel {
  CateringTypeID?: number;
  Title?: string;
}

export interface HotelRoomTypeModel {
  RoomTypeID?: number;
  Title?: string;
  TitleEn?: string;
}

export interface HotelCategoryModel {
  CategoryID?: number;
  Title?: string;
}

export interface HotelModel {
  HotelID?: number;
  Name?: string;
  NameEn?: string;
  CityId?: number;
  CityID?: number;
  DistID?: number;
  OfficialRating?: number;
}

export interface HotelSearchModel {
  FilterText?: string | null;
  DistrictId?: number | null;
  MaxDistanceFromHaram?: number | null;
  CityId?: number | null;
  IsActive?: boolean;
}

export interface AirlineCompanyLookupModel {
  AirlineCompanyID?: number;
  NameEn?: string;
  NameAr?: string;
}

export interface HotelPricePolicyModel {
  HotelPricePolicyID?: number;
  Title?: string;
  IsActive?: boolean;
}

export interface HotelPriceDetailModel {
  HotelID?: number;
  RoomTypeID?: number;
  UnitSellPrice?: number;
  UnitCostPrice?: number;
}

export interface TransPackagePriceModel2 {
  TripPathID?: number;
  Price?: number;
}

export interface TransPackageModel2 {
  TransPackageID?: number;
  PackageTitle?: string;
  Prices?: TransPackagePriceModel2[];
}

export interface CateringPackagePriceModel2 {
  FoodTypeId?: number;
  CateringTypeID?: number;
  SellPrice?: number;
  CostPrice?: number;
}

export interface CateringPackageModel2 {
  CateringPackageID?: number;
  PackageTitle?: string;
  CateringPackagePrices?: CateringPackagePriceModel2[];
}

export interface HotelContactModel {
  ContactName?: string;
  Phone?: string;
  Email?: string;
}

export interface HotelPropertyModel {
  Title?: string;
  Value?: string;
}

interface PagedResult<T> {
  Items?: T[];
  Count?: number;
}

const countries: CountryData[] = [
  { CountryID: 1, Title: 'Saudi Arabia', TitleEnglish: 'Saudi Arabia', Code: 'SA' },
  { CountryID: 2, Title: 'Egypt', TitleEnglish: 'Egypt', Code: 'EG' },
  { CountryID: 3, Title: 'Jordan', TitleEnglish: 'Jordan', Code: 'JO' },
];

const regions: RegionModel[] = [
  { RegionID: 1, CountryID: 1, Title: 'Makkah Region', TitleEnglish: 'Makkah Region' },
  { RegionID: 2, CountryID: 1, Title: 'Madinah Region', TitleEnglish: 'Madinah Region' },
  { RegionID: 3, CountryID: 2, Title: 'Cairo', TitleEnglish: 'Cairo' },
  { RegionID: 4, CountryID: 3, Title: 'Amman', TitleEnglish: 'Amman' },
];

const cities: CityData[] = [
  { CityID: 1, CountryID: 1, RegionID: 1, Name: 'Jeddah', NameEn: 'Jeddah' },
  { CityID: 2, CountryID: 1, RegionID: 1, Name: 'Makkah', NameEn: 'Makkah' },
  { CityID: 3, CountryID: 1, RegionID: 2, Name: 'Madinah', NameEn: 'Madinah' },
  { CityID: 4, CountryID: 2, RegionID: 3, Name: 'Cairo', NameEn: 'Cairo' },
  { CityID: 5, CountryID: 3, RegionID: 4, Name: 'Amman', NameEn: 'Amman' },
];

const agents: AgentModel[] = [
  { AgentID: 301, AgentName: 'Al Safa Travel', AgentEmail: 'ops@alsafa.example', CountryID: 2, CountryName: 'Egypt', CityID: 4, CityName: 'Cairo', LogoImageLocation: '/IMG/logo.png' },
  { AgentID: 302, AgentName: 'Nour Tours', AgentEmail: 'packages@nour.example', CountryID: 1, CountryName: 'Saudi Arabia', CityID: 1, CityName: 'Jeddah', LogoImageLocation: '/IMG/logo.png' },
  { AgentID: 303, AgentName: 'Umrah Gate', AgentEmail: 'sales@umrahgate.example', CountryID: 3, CountryName: 'Jordan', CityID: 5, CityName: 'Amman', LogoImageLocation: '/IMG/logo.png' },
  { AgentID: 304, AgentName: 'Rawafed Agency', AgentEmail: 'hello@rawafed.example', CountryID: 1, CountryName: 'Saudi Arabia', CityID: 3, CityName: 'Madinah', LogoImageLocation: '/IMG/logo.png' },
];

const districts: CityDistData[] = [
  { CityDistID: 11, CityID: 1, DistTitle: 'Ajyad' },
  { CityDistID: 12, CityID: 1, DistTitle: 'Al Aziziyah' },
  { CityDistID: 21, CityID: 2, DistTitle: 'Central Area' },
  { CityDistID: 22, CityID: 2, DistTitle: 'Qurban' },
];

const roomTypes: HotelRoomTypeModel[] = [
  { RoomTypeID: 1, Title: 'Double Room', TitleEn: 'Double Room' },
  { RoomTypeID: 2, Title: 'Triple Room', TitleEn: 'Triple Room' },
  { RoomTypeID: 3, Title: 'Quad Room', TitleEn: 'Quad Room' },
];

const hotelCategories: HotelCategoryModel[] = [
  { CategoryID: 1, Title: 'Five Star' },
  { CategoryID: 2, Title: 'Four Star' },
  { CategoryID: 3, Title: 'Three Star' },
];

const hotels: HotelModel[] = [
  { HotelID: 101, Name: 'Makkah Grand Hotel', NameEn: 'Makkah Grand Hotel', CityId: 1, CityID: 1, DistID: 11, OfficialRating: 5 },
  { HotelID: 102, Name: 'Ajyad Towers', NameEn: 'Ajyad Towers', CityId: 1, CityID: 1, DistID: 11, OfficialRating: 4 },
  { HotelID: 103, Name: 'Aziziyah Residence', NameEn: 'Aziziyah Residence', CityId: 1, CityID: 1, DistID: 12, OfficialRating: 4 },
  { HotelID: 201, Name: 'Madinah Rawdah Hotel', NameEn: 'Madinah Rawdah Hotel', CityId: 2, CityID: 2, DistID: 21, OfficialRating: 5 },
  { HotelID: 202, Name: 'Qurban Suites', NameEn: 'Qurban Suites', CityId: 2, CityID: 2, DistID: 22, OfficialRating: 4 },
];

const tripPaths: TripPathModel[] = [
  { TripPathID: 1, Title: 'Jeddah Airport to Makkah', TitleEn: 'Jeddah Airport to Makkah' },
  { TripPathID: 2, Title: 'Makkah to Madinah', TitleEn: 'Makkah to Madinah' },
  { TripPathID: 3, Title: 'Madinah to Jeddah Airport', TitleEn: 'Madinah to Jeddah Airport' },
];

const carTypes: CarTypeModel[] = [
  { CarTypeID: 1, Title: 'Bus 49 Seats', TitleEn: 'Bus 49 Seats' },
  { CarTypeID: 2, Title: 'Coaster 22 Seats', TitleEn: 'Coaster 22 Seats' },
  { CarTypeID: 3, Title: 'Sedan', TitleEn: 'Sedan' },
];

const foodTypes: CateringFoodTypeModel[] = [
  { Id: 1, TypeName: 'Open Buffet' },
  { Id: 2, TypeName: 'Box Meal' },
  { Id: 3, TypeName: 'VIP Meal' },
];

const cateringTypes: CateringTypeModel[] = [
  { CateringTypeID: 1, Title: 'Breakfast' },
  { CateringTypeID: 2, Title: 'Dinner' },
  { CateringTypeID: 3, Title: 'Full Board' },
];

const airlines: AirlineCompanyLookupModel[] = [
  { AirlineCompanyID: 1, NameEn: 'Saudia', NameAr: 'Saudia' },
  { AirlineCompanyID: 2, NameEn: 'Flynas', NameAr: 'Flynas' },
  { AirlineCompanyID: 3, NameEn: 'EgyptAir', NameAr: 'EgyptAir' },
];

const hotelPolicies: HotelPricePolicyModel[] = [
  { HotelPricePolicyID: 1, Title: 'Standard Hotel Contract', IsActive: true },
  { HotelPricePolicyID: 2, Title: 'Seasonal Premium Contract', IsActive: true },
];

const hotelPriceDetails: Record<number, HotelPriceDetailModel[]> = {
  1: [
    { HotelID: 101, RoomTypeID: 1, UnitSellPrice: 650, UnitCostPrice: 520 },
    { HotelID: 102, RoomTypeID: 2, UnitSellPrice: 410, UnitCostPrice: 330 },
    { HotelID: 103, RoomTypeID: 2, UnitSellPrice: 350, UnitCostPrice: 280 },
    { HotelID: 201, RoomTypeID: 1, UnitSellPrice: 530, UnitCostPrice: 430 },
    { HotelID: 202, RoomTypeID: 2, UnitSellPrice: 320, UnitCostPrice: 250 },
  ],
  2: [
    { HotelID: 101, RoomTypeID: 1, UnitSellPrice: 720, UnitCostPrice: 600 },
    { HotelID: 201, RoomTypeID: 1, UnitSellPrice: 610, UnitCostPrice: 500 },
    { HotelID: 202, RoomTypeID: 3, UnitSellPrice: 380, UnitCostPrice: 295 },
  ],
};

const transPackages: TransPackageModel2[] = [
  { TransPackageID: 1, PackageTitle: 'Standard Transport Agreement', Prices: [{ TripPathID: 1, Price: 720 }, { TripPathID: 2, Price: 840 }, { TripPathID: 3, Price: 780 }] },
  { TransPackageID: 2, PackageTitle: 'Premium Transport Agreement', Prices: [{ TripPathID: 1, Price: 950 }, { TripPathID: 2, Price: 1100 }, { TripPathID: 3, Price: 990 }] },
];

const cateringPackages: CateringPackageModel2[] = [
  {
    CateringPackageID: 1,
    PackageTitle: 'Hotel Catering Contract',
    CateringPackagePrices: [
      { FoodTypeId: 1, CateringTypeID: 1, SellPrice: 12, CostPrice: 9 },
      { FoodTypeId: 2, CateringTypeID: 2, SellPrice: 11, CostPrice: 8 },
      { FoodTypeId: 3, CateringTypeID: 3, SellPrice: 28, CostPrice: 22 },
    ],
  },
];

@Injectable({ providedIn: 'root' })
export class AdminAPIClient {
  private readonly packageStore = inject(AgentPackagesMockService);
  private tags: TagModel[] = mockPackageTags.map((tag) => ({ ...tag }));

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getAllPackages(params: { pageIndex?: number; pageSize?: number; agentId?: number; includeInactive?: boolean; isByAgent?: boolean } = {}): Observable<SeroPackageModel[]> {
    return of(this.packageStore.getAll(params));
  }

  getPackagesCount(params: { agentId?: number; includeInactive?: boolean; isByAgent?: boolean } = {}): Observable<number> {
    return of(this.packageStore.count(params));
  }

  getPackage(params: { packageId?: number }): Observable<SeroPackageModel> {
    return of(this.packageStore.getById(params.packageId));
  }

  createPackage(params: { body: SeroPackageModel }): Observable<SeroPackageModel> {
    return of(this.packageStore.create(params.body));
  }

  updatePackage(params: { packageId?: number; body: SeroPackageModel }): Observable<SeroPackageModel> {
    return of(this.packageStore.update(params.packageId, params.body));
  }

  uploadPackagePhoto(params: { packageId?: number; file?: FileParameter }): Observable<SeroPackageModel> {
    const fallbackImage = '/IMG/logo.png';
    const file = params.file?.data;
    if (!file) {
      return of(this.packageStore.setImage(params.packageId, fallbackImage));
    }

    return new Observable<SeroPackageModel>((subscriber) => {
      const reader = new FileReader();
      reader.onload = () => {
        subscriber.next(this.packageStore.setImage(params.packageId, String(reader.result ?? fallbackImage)));
        subscriber.complete();
      };
      reader.onerror = () => {
        subscriber.next(this.packageStore.setImage(params.packageId, fallbackImage));
        subscriber.complete();
      };
      reader.readAsDataURL(file);
    });
  }

  getPackagePdf(params: { packageId?: number }): Observable<PdfReportResult> {
    return of({
      Content: 'VHJhbnNmZXJyZWQgcGFja2FnZSBwcm90b3R5cGUgcmVwb3J0Lg==',
      ContentType: 'text/plain',
      FileName: `package-${params.packageId ?? 'details'}.txt`,
    });
  }

  getTripPathsLookup(_params: { filter?: string; isActive?: boolean } = {}): Observable<TripPathModel[]> {
    return of([...tripPaths]);
  }

  getCarTypesLookup(_params: { filter?: string; isActive?: boolean } = {}): Observable<CarTypeModel[]> {
    return of([...carTypes]);
  }

  getFoodTypesLookup(_params: { filter?: string; isActive?: boolean } = {}): Observable<CateringFoodTypeModel[]> {
    return of([...foodTypes]);
  }

  getCateringTypesLookup(_params: { filter?: string; isActive?: boolean } = {}): Observable<CateringTypeModel[]> {
    return of([...cateringTypes]);
  }

  getRoomTypes(): Observable<HotelRoomTypeModel[]> {
    return of([...roomTypes]);
  }

  getDistrictsLookup(params: { cityId?: number } = {}): Observable<CityDistData[]> {
    return of(districts.filter((district) => !params.cityId || district.CityID === params.cityId));
  }

  getHotelCategories(_params: { pageIndex?: number; pageSize?: number } = {}): Observable<HotelCategoryModel[]> {
    return of([...hotelCategories]);
  }

  getHotelsLookup(params: { body?: HotelSearchModel } = {}): Observable<HotelModel[]> {
    const body = params.body ?? {};
    const filter = (body.FilterText ?? '').toLowerCase();
    const data = hotels.filter((hotel) => {
      const matchesCity = !body.CityId || hotel.CityId === body.CityId || hotel.CityID === body.CityId;
      const matchesDistrict = !body.DistrictId || hotel.DistID === body.DistrictId;
      const matchesText = !filter || `${hotel.Name ?? ''} ${hotel.NameEn ?? ''}`.toLowerCase().includes(filter);
      return matchesCity && matchesDistrict && matchesText;
    });
    return of(data);
  }

  getCountriesLookup(_params: { culture?: string } = {}): Observable<CountryData[]> {
    return of([...countries]);
  }

  getRegionsLookup(params: { countryID?: number; culture?: string; filter?: string } = {}): Observable<RegionModel[]> {
    return of(regions.filter((region) => !params.countryID || region.CountryID === params.countryID));
  }

  getCitiesLookup(params: { countryID?: number; regionID?: number; culture?: string; filter?: string } = {}): Observable<CityData[]> {
    return of(cities.filter((city) => {
      const matchesCountry = !params.countryID || city.CountryID === params.countryID;
      const matchesRegion = !params.regionID || city.RegionID === params.regionID;
      return matchesCountry && matchesRegion;
    }));
  }

  getAirlineCompanies(_params: { includeInactive?: boolean; filter?: string } = {}): Observable<AirlineCompanyLookupModel[]> {
    return of([...airlines]);
  }

  getAgentList(params: { pageIndex?: number; pageSize?: number; filterText?: string; countryID?: number; cityID?: number; masterAgentId?: number; hasMasterAgent?: boolean } = {}): Observable<AgentModel[]> {
    const filter = (params.filterText ?? '').toLowerCase();
    let data = agents.filter((agent) => {
      const matchesText = !filter || `${agent.AgentName ?? ''} ${agent.AgentEmail ?? ''}`.toLowerCase().includes(filter);
      const matchesCountry = !params.countryID || agent.CountryID === params.countryID;
      const matchesCity = !params.cityID || agent.CityID === params.cityID;
      return matchesText && matchesCountry && matchesCity;
    });

    const pageIndex = params.pageIndex ?? 0;
    const pageSize = params.pageSize ?? data.length;
    data = data.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    return of(data.map((agent) => ({ ...agent })));
  }

  getAgentListCount(params: { filterText?: string; countryID?: number; cityID?: number; masterAgentId?: number; hasMasterAgent?: boolean } = {}): Observable<number> {
    const filter = (params.filterText ?? '').toLowerCase();
    return of(agents.filter((agent) => {
      const matchesText = !filter || `${agent.AgentName ?? ''} ${agent.AgentEmail ?? ''}`.toLowerCase().includes(filter);
      const matchesCountry = !params.countryID || agent.CountryID === params.countryID;
      const matchesCity = !params.cityID || agent.CityID === params.cityID;
      return matchesText && matchesCountry && matchesCity;
    }).length);
  }

  getAgent(params: { agentID?: number }): Observable<AgentModel> {
    return of({ ...(agents.find((agent) => agent.AgentID === params.agentID) ?? agents[0]) });
  }

  getAllTags(): Observable<TagModel[]> {
    return of(this.tags.map((tag) => ({ ...tag })));
  }

  createTag(params: { body: TagModel }): Observable<TagModel> {
    const created: TagModel = {
      ...params.body,
      TagID: Math.max(0, ...this.tags.map((tag) => tag.TagID ?? 0)) + 1,
    };
    this.tags = [...this.tags, created];
    return of({ ...created });
  }

  getHotelPricePolicies(_params: { pageIndex?: number; pageSize?: number; body?: Record<string, unknown> } = {}): Observable<PagedResult<HotelPricePolicyModel>> {
    return of({ Items: [...hotelPolicies], Count: hotelPolicies.length });
  }

  getHotelPriceDetails(params: { policyId: number; pageSize?: number }): Observable<PagedResult<HotelPriceDetailModel>> {
    const items = hotelPriceDetails[params.policyId] ?? [];
    return of({ Items: [...items], Count: items.length });
  }

  getCateringPackages(_params: { pageIndex?: number; pageSize?: number; body?: Record<string, unknown> } = {}): Observable<CateringPackageModel2[]> {
    return of(cateringPackages.map((item) => structuredClone(item)));
  }

  getTransPackages(_params: { pageIndex?: number; pageSize?: number; body?: Record<string, unknown> } = {}): Observable<TransPackageModel2[]> {
    return of(transPackages.map((item) => structuredClone(item)));
  }

  getTransPackage(params: { packageID: number }): Observable<TransPackageModel2> {
    return of(structuredClone(transPackages.find((item) => item.TransPackageID === params.packageID) ?? transPackages[0]));
  }

  getHotel(params: { hotelId?: number }): Observable<HotelModel> {
    return of({ ...(hotels.find((hotel) => hotel.HotelID === params.hotelId) ?? hotels[0]) });
  }

  getHotelContacts(_params: { hotelId?: number } = {}): Observable<HotelContactModel[]> {
    return of([
      { ContactName: 'Reservation Desk', Phone: '+966 500000000', Email: 'reservations@example.local' },
    ]);
  }

  getHotelProperties(_params: { hotelId?: number } = {}): Observable<HotelPropertyModel[]> {
    return of([
      { Title: 'Distance from Haram', Value: '0.6 km' },
      { Title: 'Check-in', Value: '16:00' },
    ]);
  }

  getAgentRepresenters(_params: { agentId?: number } = {}): Observable<AgentRepresenterModel[]> {
    return of([
      { Name: 'Operations Contact', Email: 'ops@example.local', Phone: '+966 511111111' },
    ]);
  }
}
