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
  Id?: number;
  SeroPackageId?: number;
  AgentId?: number;
  StatusId?: number;
  IsByAgent?: boolean;
  PackageCode?: string | null;
  Title?: string | null;
  Price?: number | null;
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

export interface SeroPackageRequestModel {
  SeroPackageId?: number;
  AgentId?: number;
  PassengerCount?: number;
  RequestedQuantity?: number;
  StartDate?: Date | string;
  EndDate?: Date | string;
  Notes?: string;
  IsByAgent?: boolean;
}

export interface UserAccountViewModel {
  UserID?: number;
  FullName?: string;
  Email?: string;
}

export interface SystemResponse2 {
  Success?: boolean;
  Message?: string;
}

export interface BooleanSystemResponse {
  ReturnedValue?: boolean;
  Success?: boolean;
  Message?: string;
}

export interface RequestVoucherModel {
  RequestVoucherID?: number;
  RequestVoucherCode?: string;
  RequestVoucherTypeID?: number;
  SeroPackageRequestID?: number;
  AgentID?: number;
  AddedDate?: Date | string;
  VoucherStatusForAdminID?: number;
  VoucherStatusForAdminTitle?: string;
  VoucherStatusForAgentID?: number;
  VoucherStatusForAgentTitle?: string;
  TotalCostPrice?: number;
  TotalOriginalPrice?: number;
  TotalSellingPrice?: number;
  TotalTax?: number;
  TotalPriceWithTax?: number;
  IsDeleted?: boolean;
}

export interface VoucherDetailsModel {
  Voucher?: RequestVoucherModel;
  HotelVouchers?: RequestHotelVoucherModel[];
  TripVouchers?: RequestTripVoucherModel[];
  VisaVouchers?: RequestVisaVoucherModel[];
  CateringVouchers?: RequestCateringVoucherModel[];
  TicketVouchers?: RequestTicketVoucherModel[];
}

export interface RequestHotelVoucherModel {
  RequestHotelVoucherID?: number;
  RequestVoucherID?: number;
  HotelID?: number;
  HotelName?: string;
  RoomTypeID?: number;
  RoomTypeName?: string;
  NightsCount?: number;
  Count?: number;
  CostUnitPrice?: number;
  OriginalUnitPrice?: number;
  SellingUnitPrice?: number;
  Tax?: number;
  TotalPriceWithTax?: number;
}

export interface RequestTripVoucherModel {
  RequestTripVoucherID?: number;
  RequestVoucherID?: number;
  TripPathID?: number;
  TripPath?: string;
  CarTypeID?: number;
  CarType?: string;
  Count?: number;
  CostUnitPrice?: number;
  OriginalUnitPrice?: number;
  SellingUnitPrice?: number;
  Tax?: number;
  TotalPriceWithTax?: number;
}

export interface RequestVisaVoucherModel {
  RequestVisaVoucherID?: number;
  RequestVoucherID?: number;
  Count?: number;
  CostUnitPrice?: number;
  OriginalUnitPrice?: number;
  SellingUnitPrice?: number;
  Tax?: number;
  TotalPriceWithTax?: number;
}

export interface RequestCateringVoucherModel {
  RequestCateringVoucherID?: number;
  RequestVoucherID?: number;
  CateringID?: number;
  CateringTypeName?: string;
  FoodTypeID?: number;
  FoodTypeName?: string;
  Count?: number;
  CostUnitPrice?: number;
  OriginalUnitPrice?: number;
  SellingUnitPrice?: number;
  Tax?: number;
  TotalPriceWithTax?: number;
}

export interface RequestTicketVoucherModel {
  RequestTicketVoucherID?: number;
  RequestVoucherID?: number;
  SourceCityID?: number;
  SourceCityName?: string;
  DestinationCityID?: number;
  DestinationCityName?: string;
  AirlineCompanyID?: number;
  AirlineCompanyName?: string;
  TripType?: string;
  TicketClass?: string;
  Count?: number;
  CostUnitPrice?: number;
  OriginalUnitPrice?: number;
  SellingUnitPrice?: number;
  Tax?: number;
  TotalPriceWithTax?: number;
}

export interface VoucherStatusLogModel {
  StatusTitle?: string;
  Notes?: string;
  CreatedBy?: string;
  CreatedAt?: Date | string;
}

export interface SeroRequestROVViewModel {
  RequestROVID?: number;
  RequestID?: number;
  ProviderName?: string;
  StatusTitle?: string;
  Price?: number;
  AddedDate?: Date | string;
  IsClosed?: boolean;
  VoucherID?: number;
}

export interface SeroRequestROVViewModelListSystemResponse {
  ReturnedValue?: SeroRequestROVViewModel[];
  Success?: boolean;
}

export interface SystemResponse_1OfVoucherDetailsModel {
  ReturnedValue?: VoucherDetailsModel;
  Success?: boolean;
  Message?: string;
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
  private requests: RequestModel[] = [];
  private vouchers: VoucherDetailsModel[] = [];
  private rovs: SeroRequestROVViewModel[] = [];
  private voucherLogs = new Map<number, VoucherStatusLogModel[]>();
  private nextRequestId = 5100;
  private nextVoucherId = 9100;
  private nextRovId = 7100;

  constructor() {
    this.seedAgentRequestPrototypeData();
  }

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

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getSeroRequests(params: { pageIndex?: number; pageSize?: number; agentId?: number; requestId?: number; statusId?: number; isClosed?: boolean; startDate?: Date; endDate?: Date } = {}): Observable<RequestModel[]> {
    let data = this.requests;
    if (params.requestId) {
      data = data.filter((item) => item.Id === params.requestId);
    }
    if (params.agentId) {
      data = data.filter((item) => item.AgentId === params.agentId);
    }
    if (params.statusId) {
      data = data.filter((item) => item.StatusId === params.statusId);
    }

    const pageIndex = params.pageIndex ?? 0;
    const pageSize = params.pageSize ?? data.length;
    return of(data.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize).map((item) => structuredClone(item)));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getSeroRequestsCount(params: { agentId?: number; requestId?: number; statusId?: number; isClosed?: boolean } = {}): Observable<number> {
    let data = this.requests;
    if (params.requestId) {
      data = data.filter((item) => item.Id === params.requestId);
    }
    if (params.agentId) {
      data = data.filter((item) => item.AgentId === params.agentId);
    }
    if (params.statusId) {
      data = data.filter((item) => item.StatusId === params.statusId);
    }
    return of(data.length);
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  createPackageRequest(params: { body?: SeroPackageRequestModel } = {}): Observable<SeroPackageRequestModel> {
    const body = params.body ?? {};
    const pkg = this.packageStore.getById(body.SeroPackageId);
    const agent = agents.find((item) => item.AgentID === body.AgentId) ?? agents[0];
    const created: RequestModel = {
      Id: this.nextRequestId++,
      SeroPackageId: body.SeroPackageId ?? pkg.PackageID,
      AgentId: body.AgentId ?? agent.AgentID,
      AgentCode: `AGT-${body.AgentId ?? agent.AgentID}`,
      AgentName: agent.AgentName,
      AgentCountry: agent.CountryName,
      StatusId: 2,
      StatusName: 'new',
      StartDate: body.StartDate ?? new Date(),
      EndDate: body.EndDate ?? new Date(),
      PassengerCount: body.PassengerCount ?? 1,
      RequestedQuantity: body.RequestedQuantity ?? 1,
      Notes: body.Notes ?? '',
      AddedDate: new Date(),
      IsByAgent: body.IsByAgent ?? false,
      PackageCode: pkg.PackageCode,
      Title: pkg.Title,
      Price: pkg.Price,
      PackageModel: pkg,
    };

    this.requests = [created, ...this.requests];
    this.seedVouchersForRequest(created, false);
    return of({ ...body, SeroPackageId: created.SeroPackageId, AgentId: created.AgentId });
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  deletePackageRequest(params: { requestId?: number } = {}): Observable<SystemResponse2> {
    this.requests = this.requests.filter((item) => item.Id !== params.requestId);
    this.vouchers = this.vouchers.filter((item) => item.Voucher?.SeroPackageRequestID !== params.requestId);
    this.rovs = this.rovs.filter((item) => item.RequestID !== params.requestId);
    return of({ Success: true, Message: 'Deleted locally' });
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getVoucherByRequestId(params: { requestId?: number; agentId?: number } = {}): Observable<VoucherDetailsModel[]> {
    const data = this.vouchers.filter((item) => {
      const voucher = item.Voucher;
      return voucher && !voucher.IsDeleted
        && (!params.requestId || voucher.SeroPackageRequestID === params.requestId)
        && (!params.agentId || voucher.AgentID === params.agentId);
    });
    return of(structuredClone(data));
  }

  getVoucherById(params: { voucherId?: number; agentId?: number } = {}): Observable<VoucherDetailsModel> {
    const found = this.vouchers.find((item) => {
      const voucher = item.Voucher;
      return !!voucher && voucher.RequestVoucherID === params.voucherId && (!params.agentId || voucher.AgentID === params.agentId);
    });
    return of(structuredClone(found ?? this.vouchers[0]));
  }

  getVoucherPdf(params: { voucherId?: number; agentId?: number }): Observable<PdfReportResult> {
    const text = `Prototype quotation ${params.voucherId ?? ''}\nThis file is generated from local mock data.`;
    return of({
      Content: btoa(text),
      ContentType: 'text/plain',
      FileName: `quotation-${params.voucherId ?? 'local'}.txt`,
    });
  }

  createHotelVoucher(params: { agentId?: number; requestId?: number; voucherID?: number; body?: RequestHotelVoucherModel[] } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.createVoucherDetails('hotel', params.requestId, params.agentId, params.body ?? []));
  }

  updateHotelVoucher(params: { agentID?: number; requestID?: number; body?: RequestHotelVoucherModel } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.updateVoucherDetails(params.body?.RequestVoucherID, params.body));
  }

  createTransportationVoucher(params: { agentId?: number; requestId?: number; body?: RequestTripVoucherModel[] } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.createVoucherDetails('transport', params.requestId, params.agentId, params.body ?? []));
  }

  updateTransportationVoucher(params: { agentID?: number; requestID?: number; body?: RequestTripVoucherModel } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.updateVoucherDetails(params.body?.RequestVoucherID, params.body));
  }

  createVisaVoucher(params: { agentId?: number; requestId?: number; body?: RequestVisaVoucherModel[] } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.createVoucherDetails('visa', params.requestId, params.agentId, params.body ?? []));
  }

  updateVisaVoucher(params: { agentID?: number; requestID?: number; body?: RequestVisaVoucherModel } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.updateVoucherDetails(params.body?.RequestVoucherID, params.body));
  }

  createCateringVoucher(params: { agentId?: number; requestId?: number; body?: RequestCateringVoucherModel[] } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.createVoucherDetails('catering', params.requestId, params.agentId, params.body ?? []));
  }

  updateCateringVoucher(params: { agentID?: number; requestID?: number; body?: RequestCateringVoucherModel } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.updateVoucherDetails(params.body?.RequestVoucherID, params.body));
  }

  createTicketVoucher(params: { agentId?: number; requestId?: number; body?: RequestTicketVoucherModel[] } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.createVoucherDetails('ticket', params.requestId, params.agentId, params.body ?? []));
  }

  updateTicketVoucher(params: { agentID?: number; requestID?: number; body?: RequestTicketVoucherModel } = {}): Observable<SystemResponse_1OfVoucherDetailsModel> {
    return of(this.updateVoucherDetails(params.body?.RequestVoucherID, params.body));
  }

  deleteRequestHotelVoucher(params: { requestVoucherID?: number; requestHotelVoucherID?: number }): Observable<BooleanSystemResponse> {
    return of(this.deleteVoucherDetail(params.requestVoucherID));
  }

  deleteTransportationVoucher(params: { requestVoucherID?: number; requestTripVoucherID?: number }): Observable<BooleanSystemResponse> {
    return of(this.deleteVoucherDetail(params.requestVoucherID));
  }

  deleteVisaVoucher(params: { requestVoucherID?: number; requestVisaVoucherID?: number }): Observable<BooleanSystemResponse> {
    return of(this.deleteVoucherDetail(params.requestVoucherID));
  }

  deleteCateringVoucher(params: { requestVoucherID?: number; requestCateringVoucherID?: number }): Observable<BooleanSystemResponse> {
    return of(this.deleteVoucherDetail(params.requestVoucherID));
  }

  deleteTicketVoucher(params: { requestVoucherID?: number; requestTicketVoucherID?: number }): Observable<BooleanSystemResponse> {
    return of(this.deleteVoucherDetail(params.requestVoucherID));
  }

  getVoucherStatusLogForAdmin(params: { voucherID?: number; agentId?: number }): Observable<VoucherStatusLogModel[]> {
    return of(structuredClone(this.voucherLogs.get(params.voucherID ?? 0) ?? []));
  }

  getVoucherStatusLogForAgent(params: { voucherID?: number; agentId?: number }): Observable<VoucherStatusLogModel[]> {
    return of(structuredClone(this.voucherLogs.get(params.voucherID ?? 0) ?? []));
  }

  sendVoucherToAgent(params: { voucherID?: number; agentId?: number; notes?: string }): Observable<SystemResponse2> {
    return of(this.setVoucherStatus(params.voucherID, 2, 'Sent to Agent', params.notes));
  }

  approveVoucherFromManager(params: { voucherID?: number; agentId?: number; notes?: string }): Observable<SystemResponse2> {
    return of(this.setVoucherStatus(params.voucherID, 4, 'Manager Approved', params.notes));
  }

  approveVoucherFromOperation(params: { voucherID?: number; agentId?: number; notes?: string }): Observable<SystemResponse2> {
    return of(this.setVoucherStatus(params.voucherID, 5, 'Operation Approved', params.notes));
  }

  approveVoucherFromFinance(params: { voucherID?: number; agentId?: number; notes?: string }): Observable<SystemResponse2> {
    return of(this.setVoucherStatus(params.voucherID, 6, 'Finance Approved', params.notes));
  }

  voucherIssued(params: { voucherID?: number; agentId?: number; notes?: string }): Observable<SystemResponse2> {
    return of(this.setVoucherStatus(params.voucherID, 7, 'Issued', params.notes));
  }

  applyVoucherPriceMarkupOrDiscount(params: { voucherId?: number; percentage?: number }): Observable<SystemResponse_1OfVoucherDetailsModel> {
    const voucher = this.vouchers.find((item) => item.Voucher?.RequestVoucherID === params.voucherId);
    const percentage = params.percentage ?? 0;
    if (voucher?.Voucher) {
      const current = voucher.Voucher.TotalPriceWithTax ?? 0;
      voucher.Voucher.TotalPriceWithTax = Math.max(0, Math.round(current + (current * percentage / 100)));
    }
    return of({ Success: true, ReturnedValue: structuredClone(voucher) });
  }

  getROVsByRequestId(params: { requestID?: number } = {}): Observable<SeroRequestROVViewModelListSystemResponse> {
    return of({ Success: true, ReturnedValue: structuredClone(this.rovs.filter((item) => item.RequestID === params.requestID)) });
  }

  getROVsByVoucherId(params: { voucherId?: number } = {}): Observable<SeroRequestROVViewModelListSystemResponse> {
    return of({ Success: true, ReturnedValue: structuredClone(this.rovs.filter((item) => item.VoucherID === params.voucherId)) });
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

  private seedAgentRequestPrototypeData(): void {
    if (this.requests.length > 0) {
      return;
    }

    const packages = this.packageStore.getAll({ includeInactive: true, pageIndex: 0, pageSize: 6 });
    const statusList = [
      { id: 2, title: 'new' },
      { id: 1, title: 'pending' },
      { id: 3, title: 'approved' },
      { id: 4, title: 'rejected' },
      { id: 5, title: 'completed' },
    ];

    this.requests = packages.map((pkg, index) => {
      const agent = agents[index % agents.length];
      const status = statusList[index % statusList.length];
      return {
        Id: 5001 + index,
        SeroPackageId: pkg.PackageID,
        AgentId: agent.AgentID,
        AgentCode: `AGT-${agent.AgentID}`,
        AgentName: agent.AgentName,
        AgentCountry: agent.CountryName,
        StatusId: status.id,
        StatusName: status.title,
        StartDate: pkg.StartDate ?? new Date(2026, 6, 1 + index),
        EndDate: pkg.EndDate ?? new Date(2026, 6, 8 + index),
        PassengerCount: pkg.GuestCount ?? ((index + 1) * 3),
        RequestedQuantity: Math.max(1, Math.min(3, index + 1)),
        Notes: index % 2 === 0 ? 'Local prototype request with copied SalamApp workflow.' : '',
        AddedDate: new Date(2026, 4, 10 + index, 10, 30),
        IsByAgent: true,
        PackageCode: pkg.PackageCode,
        Title: pkg.Title,
        Price: pkg.Price,
        PackageModel: pkg,
      } satisfies RequestModel;
    });

    this.nextRequestId = 5001 + this.requests.length;
    this.requests.forEach((request, index) => {
      this.seedVouchersForRequest(request, index < 4);
      this.rovs.push(
        {
          RequestROVID: this.nextRovId++,
          RequestID: request.Id,
          ProviderName: 'Makkah Grand Hotel',
          StatusTitle: 'Open',
          Price: 2200 + (index * 120),
          AddedDate: new Date(2026, 4, 12 + index),
          IsClosed: false,
        },
        {
          RequestROVID: this.nextRovId++,
          RequestID: request.Id,
          ProviderName: 'Madinah Rawdah Hotel',
          StatusTitle: 'Closed',
          Price: 1800 + (index * 90),
          AddedDate: new Date(2026, 4, 5 + index),
          IsClosed: true,
          VoucherID: this.vouchers.find((item) => item.Voucher?.SeroPackageRequestID === request.Id)?.Voucher?.RequestVoucherID,
        },
      );
    });
  }

  private seedVouchersForRequest(request: RequestModel, withVouchers: boolean): void {
    if (!withVouchers || !request.Id || !request.AgentId) {
      return;
    }

    const hotel = this.createVoucherDetails('hotel', request.Id, request.AgentId, [{
      Count: request.RequestedQuantity ?? 1,
      NightsCount: 3,
      CostUnitPrice: 300,
      OriginalUnitPrice: 350,
      SellingUnitPrice: 420,
      Tax: 15,
      HotelName: request.PackageModel?.Hotels?.[0]?.HotelName ?? 'Makkah Grand Hotel',
      RoomTypeName: 'Double Room',
    }]);
    const visa = this.createVoucherDetails('visa', request.Id, request.AgentId, [{
      Count: request.PassengerCount ?? 1,
      CostUnitPrice: 120,
      OriginalUnitPrice: 150,
      SellingUnitPrice: 190,
      Tax: 15,
    }]);

    [hotel.ReturnedValue, visa.ReturnedValue].forEach((item) => {
      if (item?.Voucher?.RequestVoucherID) {
        this.voucherLogs.set(item.Voucher.RequestVoucherID, [
          { StatusTitle: 'Created', Notes: 'Created from local mock data', CreatedBy: 'Prototype Admin', CreatedAt: item.Voucher.AddedDate },
        ]);
      }
    });
  }

  private createVoucherDetails(
    type: 'hotel' | 'transport' | 'visa' | 'catering' | 'ticket',
    requestId?: number,
    agentId?: number,
    body: Array<RequestHotelVoucherModel | RequestTripVoucherModel | RequestVisaVoucherModel | RequestCateringVoucherModel | RequestTicketVoucherModel> = [],
  ): SystemResponse_1OfVoucherDetailsModel {
    const voucherId = this.nextVoucherId++;
    const voucherTypeID = this.voucherTypeId(type);
    const request = this.requests.find((item) => item.Id === requestId);
    const model = body[0] ?? {};
    const count = Number(model.Count ?? (type === 'hotel' ? (model as RequestHotelVoucherModel).NightsCount : request?.PassengerCount) ?? 1);
    const sellingUnitPrice = Number(model.SellingUnitPrice ?? 250);
    const taxPercent = Number(model.Tax ?? 15);
    const subtotal = count * sellingUnitPrice;
    const tax = Math.round(subtotal * (taxPercent / 100));
    const total = subtotal + tax;

    const voucher: RequestVoucherModel = {
      RequestVoucherID: voucherId,
      RequestVoucherCode: `Q-${voucherId}`,
      RequestVoucherTypeID: voucherTypeID,
      SeroPackageRequestID: requestId,
      AgentID: agentId ?? request?.AgentId,
      AddedDate: new Date(),
      VoucherStatusForAdminID: 1,
      VoucherStatusForAdminTitle: 'Draft',
      VoucherStatusForAgentID: 1,
      VoucherStatusForAgentTitle: 'Not Sent',
      TotalCostPrice: count * Number(model.CostUnitPrice ?? 0),
      TotalOriginalPrice: count * Number(model.OriginalUnitPrice ?? sellingUnitPrice),
      TotalSellingPrice: subtotal,
      TotalTax: tax,
      TotalPriceWithTax: total,
      IsDeleted: false,
    };

    const common = {
      RequestVoucherID: voucherId,
      Count: count,
      CostUnitPrice: Number(model.CostUnitPrice ?? 0),
      OriginalUnitPrice: Number(model.OriginalUnitPrice ?? sellingUnitPrice),
      SellingUnitPrice: sellingUnitPrice,
      Tax: taxPercent,
      TotalPriceWithTax: total,
    };

    const details: VoucherDetailsModel = { Voucher: voucher };
    if (type === 'hotel') {
      details.HotelVouchers = [{
        ...common,
        RequestHotelVoucherID: voucherId + 10000,
        NightsCount: (model as RequestHotelVoucherModel).NightsCount ?? count,
        HotelName: (model as RequestHotelVoucherModel).HotelName ?? 'Makkah Grand Hotel',
        RoomTypeName: (model as RequestHotelVoucherModel).RoomTypeName ?? 'Double Room',
      }];
    } else if (type === 'transport') {
      details.TripVouchers = [{
        ...common,
        RequestTripVoucherID: voucherId + 10000,
        TripPath: (model as RequestTripVoucherModel).TripPath ?? 'Jeddah Airport to Makkah',
        CarType: (model as RequestTripVoucherModel).CarType ?? 'VIP Bus',
      }];
    } else if (type === 'visa') {
      details.VisaVouchers = [{ ...common, RequestVisaVoucherID: voucherId + 10000 }];
    } else if (type === 'catering') {
      details.CateringVouchers = [{
        ...common,
        RequestCateringVoucherID: voucherId + 10000,
        CateringTypeName: (model as RequestCateringVoucherModel).CateringTypeName ?? 'Full Board',
        FoodTypeName: (model as RequestCateringVoucherModel).FoodTypeName ?? 'Buffet',
      }];
    } else {
      details.TicketVouchers = [{
        ...common,
        RequestTicketVoucherID: voucherId + 10000,
        SourceCityName: (model as RequestTicketVoucherModel).SourceCityName ?? 'Cairo',
        DestinationCityName: (model as RequestTicketVoucherModel).DestinationCityName ?? 'Jeddah',
        AirlineCompanyName: (model as RequestTicketVoucherModel).AirlineCompanyName ?? 'Saudia',
        TripType: (model as RequestTicketVoucherModel).TripType ?? 'RoundTrip',
        TicketClass: (model as RequestTicketVoucherModel).TicketClass ?? 'Economy',
      }];
    }

    this.vouchers = [details, ...this.vouchers];
    this.voucherLogs.set(voucherId, [
      { StatusTitle: 'Created', Notes: 'Currently using local mock data for frontend prototype. Later this can be replaced with backend API.', CreatedBy: 'Prototype Admin', CreatedAt: new Date() },
    ]);

    return { Success: true, ReturnedValue: structuredClone(details) };
  }

  private updateVoucherDetails(voucherId?: number, body?: Partial<RequestHotelVoucherModel & RequestTripVoucherModel & RequestVisaVoucherModel & RequestCateringVoucherModel & RequestTicketVoucherModel>): SystemResponse_1OfVoucherDetailsModel {
    const details = this.vouchers.find((item) => item.Voucher?.RequestVoucherID === voucherId);
    if (!details || !details.Voucher || !body) {
      return { Success: false };
    }

    const target = details.HotelVouchers?.[0]
      ?? details.TripVouchers?.[0]
      ?? details.VisaVouchers?.[0]
      ?? details.CateringVouchers?.[0]
      ?? details.TicketVouchers?.[0];
    if (target) {
      Object.assign(target, body);
    }

    const count = Number(body.Count ?? target?.Count ?? 1);
    const price = Number(body.SellingUnitPrice ?? target?.SellingUnitPrice ?? 0);
    const taxPercent = Number(body.Tax ?? target?.Tax ?? 0);
    const subtotal = count * price;
    const tax = Math.round(subtotal * (taxPercent / 100));
    details.Voucher.TotalSellingPrice = subtotal;
    details.Voucher.TotalTax = tax;
    details.Voucher.TotalPriceWithTax = subtotal + tax;
    this.addVoucherLog(voucherId, 'Updated', 'Updated locally');
    return { Success: true, ReturnedValue: structuredClone(details) };
  }

  private deleteVoucherDetail(voucherId?: number): BooleanSystemResponse {
    const details = this.vouchers.find((item) => item.Voucher?.RequestVoucherID === voucherId);
    if (details?.Voucher) {
      details.Voucher.IsDeleted = true;
      this.addVoucherLog(voucherId, 'Deleted', 'Deleted locally');
    }
    return { Success: true, ReturnedValue: true };
  }

  private setVoucherStatus(voucherID?: number, statusId?: number, statusTitle?: string, notes?: string): SystemResponse2 {
    const details = this.vouchers.find((item) => item.Voucher?.RequestVoucherID === voucherID);
    if (details?.Voucher) {
      details.Voucher.VoucherStatusForAdminID = statusId;
      details.Voucher.VoucherStatusForAdminTitle = statusTitle;
      if (statusId === 2) {
        details.Voucher.VoucherStatusForAgentID = 2;
        details.Voucher.VoucherStatusForAgentTitle = 'Received';
      }
      this.addVoucherLog(voucherID, statusTitle ?? 'Status changed', notes ?? '');
    }
    return { Success: true, Message: 'Updated locally' };
  }

  private addVoucherLog(voucherId?: number, statusTitle?: string, notes?: string): void {
    const id = voucherId ?? 0;
    const current = this.voucherLogs.get(id) ?? [];
    this.voucherLogs.set(id, [
      ...current,
      { StatusTitle: statusTitle, Notes: notes, CreatedBy: 'Prototype Admin', CreatedAt: new Date() },
    ]);
  }

  private voucherTypeId(type: 'hotel' | 'transport' | 'visa' | 'catering' | 'ticket'): number {
    return { hotel: 1, transport: 2, visa: 3, catering: 4, ticket: 5 }[type];
  }
}
