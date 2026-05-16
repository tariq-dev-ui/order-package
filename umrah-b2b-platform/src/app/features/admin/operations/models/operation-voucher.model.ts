import { DocumentationStatus } from './documentation-status.model';

export type OperationVoucherTypeId = 1 | 2 | 3 | 4 | 5;
export type OperationVoucherKind = 'hotel' | 'transport' | 'visa' | 'catering' | 'ticket';

export interface OperationVoucher {
  RequestVoucherID: number;
  RequestVoucherCode: string;
  RequestVoucherTypeID: OperationVoucherTypeId;
  AddedDate: string;
  AddedBy?: string;
  TotalCostPrice: number;
  TotalOriginalPrice: number;
  TotalSellingPrice: number;
  TotalTax: number;
  TotalPriceWithTax: number;
  VoucherStatusForAdminID: number;
  VoucherStatusForAdminTitle: string;
  VoucherStatusForAgentID: number;
  VoucherStatusForAgentTitle: string;
  AgentID: number;
  AgentName: string;
  SeroPackageRequestID: number;
  IsDeleted?: boolean;
  documentationStatus?: DocumentationStatus;
}

export interface HotelVoucherLine {
  RequestHotelVoucherID: number;
  RequestVoucherID: number;
  HotelID: number;
  HotelName: string;
  RoomTypeID: number;
  RoomTypeTitle: string;
  StartDate: string;
  EndDate: string;
  NightsCount: number;
  RoomCount: number;
  CostUnitPrice: number;
  OriginalUnitPrice: number;
  SellingUnitPrice: number;
  Tax: number;
  TotalPriceWithTax: number;
  RequestROVID?: number;
}

export interface TransportVoucherLine {
  RequestTripVoucherID: number;
  RequestVoucherID: number;
  TripPathID: number;
  TripPathTitle: string;
  CarTypeID: number;
  CarTypeTitle: string;
  Count: number;
  CostUnitPrice: number;
  OriginalUnitPrice: number;
  SellingUnitPrice: number;
  Tax: number;
  TotalPriceWithTax: number;
}

export interface VisaVoucherLine {
  RequestVisaVoucherID: number;
  RequestVoucherID: number;
  Count: number;
  VisaTypeTitle: string;
  CostUnitPrice: number;
  OriginalUnitPrice: number;
  SellingUnitPrice: number;
  Tax: number;
  TotalPriceWithTax: number;
}

export interface CateringVoucherLine {
  RequestCateringVoucherID: number;
  RequestVoucherID: number;
  CateringID: number;
  CateringTitle: string;
  FoodTypeID: number;
  FoodTypeTitle: string;
  Count: number;
  CostUnitPrice: number;
  OriginalUnitPrice: number;
  SellingUnitPrice: number;
  Tax: number;
  TotalPriceWithTax: number;
}

export interface FlightVoucherLine {
  RequestTicketVoucherID: number;
  RequestVoucherID: number;
  SourceCityID: number;
  SourceCityName: string;
  SourceCountryName: string;
  DestinationCityID: number;
  DestinationCityName: string;
  DestinationCountryName: string;
  AirlineCompanyName: string;
  TripType: string;
  TicketClass: string;
  TravelDate: string;
  Count: number;
  CostUnitPrice: number;
  OriginalUnitPrice: number;
  SellingUnitPrice: number;
  Tax: number;
  TotalPriceWithTax: number;
}

export interface OperationVoucherDetails {
  Voucher: OperationVoucher;
  HotelVouchers?: HotelVoucherLine[];
  TripVouchers?: TransportVoucherLine[];
  VisaVouchers?: VisaVoucherLine[];
  CateringVouchers?: CateringVoucherLine[];
  TicketVouchers?: FlightVoucherLine[];
}

export interface VoucherStatusLog {
  StatusTitle: string;
  Notes?: string;
  CreatedBy: string;
  CreatedAt: string;
}

export interface OperationAgent {
  AgentID: number;
  AgentCode: string;
  AgentName: string;
  AgentEmail: string;
  CR_NO: string;
  CountryName: string;
  CityName: string;
  IsActive: boolean;
  AddedDate: string;
  MasterAgentName?: string;
  Address?: string;
  Description?: string;
}

export interface OperationAgentRepresentative {
  Name: string;
  Email: string;
  Mobile: string;
  IsActive: boolean;
  AddedDate: string;
}

export interface OperationRequest {
  RequestID: number;
  RequestCode: string;
  AgentID: number;
  AgentName: string;
  PackageTitle: string;
  PaxCount: number;
  TravelDate: string;
  ReturnDate: string;
  StatusTitle: string;
  Notes?: string;
  Services: string[];
}

export interface PdfReportResult {
  Content: string;
  ContentType: string;
  FileName: string;
}
