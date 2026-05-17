export interface RequestModel {
  Id: number;
  SeroPackageId: number;
  AgentId: number;
  AgentCode: string;
  AgentName: string;
  StatusId: number;
  StatusName: string;
  StartDate: string;
  EndDate: string;
  PassengerCount: number;
  RequestedQuantity: number;
  Notes: string;
  AddedDate: string;
  IsByAgent: boolean;
  PackageCode: string;
  Title: string;
  Price: number;
  PackageModel?: PackageSummaryModel;
}

export interface PackageSummaryModel {
  PackageID: number;
  Title: string;
  PackageCode: string;
  StartDate: string;
  EndDate: string;
  Price: number;
  GuestCount: number;
  ImageUrl?: string;
  VisaIncluded: boolean;
  HotelCount: number;
  TransportCount: number;
  TicketCount: number;
  CateringCount: number;
}

export interface RequestVoucherModel {
  RequestVoucherID: number;
  RequestVoucherCode: string;
  SeroPackageRequestID: number;
  RequestVoucherTypeID: number;
  VoucherStatusForAgentID: number;
  VoucherStatusForAdminID: number;
  VoucherStatusForAgentTitle: string;
  VoucherStatusForAdminTitle: string;
  TotalCostPrice: number;
  TotalOriginalPrice: number;
  TotalSellingPrice: number;
  TotalTax: number;
  TotalPriceWithTax: number;
  AddedDate: string;
  AgentID: number;
}

export interface VoucherDetailsModel {
  Voucher: RequestVoucherModel;
  VisaVouchers: RequestVisaVoucherModel[];
  HotelVouchers: RequestHotelVoucherModel[];
  CateringVouchers: RequestCateringVoucherModel[];
  TripVouchers: RequestTripVoucherModel[];
  TicketVouchers: RequestTicketVoucherModel[];
}

export interface RequestHotelVoucherModel {
  RequestHotelVoucherDetailID: number;
  RequestVoucherID: number;
  HotelID: number;
  HotelName: string;
  RoomTypeID: number;
  RoomTypeTitle: string;
  RoomCount: number;
  StartDate: string;
  EndDate: string;
  NightsCount: number;
  UnitCostPrice: number;
  UnitOriginalPrice: number;
  UnitSellingPrice: number;
  UnitTax: number;
  UnitPriceWithTax: number;
  TotalCostPrice: number;
  TotalOriginalPrice: number;
  TotalSellingPrice: number;
  TotalTax: number;
  TotalPriceWithTax: number;
}

export interface RequestTripVoucherModel {
  RequestTripVoucherDetailID: number;
  RequestVoucherID: number;
  TripPathID: number;
  TripPathTitle: string;
  CarTypeID: number;
  CarTypeTitle: string;
  Count: number;
  UnitCostPrice: number;
  UnitOriginalPrice: number;
  UnitSellingPrice: number;
  UnitTax: number;
  UnitPriceWithTax: number;
  TotalCostPrice: number;
  TotalOriginalPrice: number;
  TotalSellingPrice: number;
  TotalTax: number;
  TotalPriceWithTax: number;
}

export interface RequestVisaVoucherModel {
  RequestVisaVoucherDetailID: number;
  RequestVoucherID: number;
  Count: number;
  UnitCostPrice: number;
  UnitOriginalPrice: number;
  UnitSellingPrice: number;
  UnitTax: number;
  UnitPriceWithTax: number;
  TotalCostPrice: number;
  TotalOriginalPrice: number;
  TotalSellingPrice: number;
  TotalTax: number;
  TotalPriceWithTax: number;
}

export interface RequestCateringVoucherModel {
  RequestCateringVoucherDetailID: number;
  RequestVoucherID: number;
  CateringID: number;
  FoodTypeID: number;
  Count: number;
  FoodTypeTitle: string;
  CateringTitle: string;
  UnitCostPrice: number;
  UnitOriginalPrice: number;
  UnitSellingPrice: number;
  UnitTax: number;
  UnitPriceWithTax: number;
  TotalCostPrice: number;
  TotalOriginalPrice: number;
  TotalSellingPrice: number;
  TotalTax: number;
  TotalPriceWithTax: number;
}

export interface RequestTicketVoucherModel {
  RequestTicketVoucherDetailID: number;
  RequestVoucherID: number;
  TicketClass: string;
  TripType: string;
  SourceCity: string;
  SourceCountry: string;
  DestCity: string;
  DestCountry: string;
  TravelDate: string;
  Count: number;
  AirlineName: string;
  UnitCostPrice: number;
  UnitOriginalPrice: number;
  UnitSellingPrice: number;
  UnitTax: number;
  UnitPriceWithTax: number;
  TotalCostPrice: number;
  TotalOriginalPrice: number;
  TotalSellingPrice: number;
  TotalTax: number;
  TotalPriceWithTax: number;
}

export interface VoucherStatusLogModel {
  RequestVoucherStatusLogID: number;
  RequestVoucherID: number;
  VoucherStatusID: number;
  Notes: string;
  CreatedAt: string;
  CreatedBy: string;
  StatusTitle: string;
}
