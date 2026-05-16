export interface SeroPackageHotelModel {
  Id?: number;
  SeroPackageId?: number;
  CityId?: number;
  CityName?: string | null;
  HotelId?: number | null;
  HotelName?: string | null;
  HotelCategoryID?: number | null;
  HotelCategoryName?: string | null;
  RoomTypeID?: number | null;
  RoomTypeName?: string | null;
  DistrictId?: number | null;
  DistrictName?: string | null;
  HotelStar?: number | null;
  NightsCount?: number | null;
  RoomCount?: number | null;
  DistanceFromHaram?: number | null;
  Price?: number | null;
}

export interface SeroPackageHotelCountModel {
  Id?: number;
  SeroPackageId?: number;
  CityId?: number;
  CityName?: string | null;
  NightCount?: number | null;
}

export interface SeroPackageTripModel {
  Id?: number;
  SeroPackageId?: number;
  TripPathId?: number | null;
  CarTypeId?: number | null;
  VehiclesCount?: number | null;
  TripPath?: string | null;
  CarType?: string | null;
  Price?: number | null;
}

export interface SeroPackageTicketModel {
  Id?: number;
  SeroPackageId?: number;
  SourceCountryID?: number | null;
  SourceCityID?: number | null;
  SourceCountryName?: string | null;
  SourceCityName?: string | null;
  DestinationCountryID?: number | null;
  DestinationCityID?: number | null;
  DestinationCountryName?: string | null;
  DestinationCityName?: string | null;
  AirlineCompanyID?: number | null;
  AirlineCompanyNameEn?: string | null;
  AirlineCompanyNameAr?: string | null;
  SeatCount?: number | null;
  TripType?: string | null;
  TravelClass?: string | null;
  IsActive?: boolean;
  Price?: number | null;
}

export interface SeroPackageCateringModel {
  Id?: number;
  SeroPackageId?: number;
  CateringTypeId?: number | null;
  FoodTypeId?: number | null;
  Count?: number | null;
  CateringType?: string | null;
  FoodType?: string | null;
  Price?: number | null;
}

export interface TagBasicModel {
  Id?: number;
  Name?: string | null;
  Color?: string | null;
}

export interface SeroPackageAgentModel {
  Id?: number;
  SeroPackageId?: number;
  AgentId?: number;
  IsActive?: boolean;
}

export interface SeroPackageModel {
  PackageID?: number;
  IsByAgent?: boolean;
  PackageCode?: string | null;
  Title?: string | null;
  Price?: number | null;
  StartDate?: Date | null;
  EndDate?: Date | null;
  IsVisaIncluded?: boolean;
  VerifiedPrice?: boolean;
  BlendedPrice?: boolean;
  GuestCount?: number | null;
  Quantity?: number | null;
  ImageUrl?: string | null;
  IsActive?: boolean;
  OwnerID?: number | null;
  Hotels?: SeroPackageHotelModel[] | null;
  HotelCounts?: SeroPackageHotelCountModel[] | null;
  Trips?: SeroPackageTripModel[] | null;
  Tickets?: SeroPackageTicketModel[] | null;
  Caterings?: SeroPackageCateringModel[] | null;
  Agents?: SeroPackageAgentModel[] | null;
  Tags?: TagBasicModel[] | null;
}
