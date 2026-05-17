export interface TagBasicModel {
  TagID?: number;
  Name?: string | null;
  Description?: string | null;
  Color?: string | null;
}

export interface TagModel extends TagBasicModel {}

export interface SeroPackageAgentModel {
  Id?: number;
  SeroPackageId?: number;
  AgentId?: number;
  AgentName?: string;
  AgentCountry?: string;
  AgentCity?: string;
  AddedBy?: string;
  IsActive?: boolean;
}

export interface SeroPackageHotelModel {
  Id?: number;
  SeroPackageId?: number;
  CityId?: number;
  CityName?: string | null;
  HotelId?: number | null;
  HotelName?: string | null;
  DistrictId?: number | null;
  DistrictName?: string | null;
  DistanceFromHaram?: number | null;
  HotelStar?: number | null;
  HotelCategoryID?: number | null;
  HotelCategoryName?: string | null;
  RoomTypeID?: number | null;
  RoomTypeName?: string | null;
  NightsCount?: number;
  RoomCount?: number | null;
  Price?: number | null;
}

export interface SeroPackageHotelCountModel {
  Id?: number;
  SeroPackageId?: number;
  CityId?: number;
  CityName?: string | null;
  NightCount?: number;
}

export interface SeroPackageTripModel {
  Id?: number;
  SeroPackageId?: number;
  TripPathId?: number;
  TripPath?: string | null;
  CarTypeId?: number;
  CarType?: string | null;
  VehiclesCount?: number;
  Price?: number | null;
}

export interface SeroPackageCateringModel {
  Id?: number;
  SeroPackageId?: number;
  CateringTypeId?: number;
  CateringType?: string | null;
  FoodTypeId?: number;
  FoodType?: string | null;
  Count?: number;
  Price?: number | null;
}

export interface SeroPackageTicketModel {
  Id?: number;
  SeroPackageId?: number;
  SourceCountryID?: number;
  SourceCountryName?: string | null;
  SourceCityID?: number;
  SourceCityName?: string | null;
  DestinationCountryID?: number;
  DestinationCountryName?: string | null;
  DestinationCityID?: number;
  DestinationCityName?: string | null;
  AirlineCompanyID?: number;
  AirlineCompanyNameEn?: string | null;
  AirlineCompanyNameAr?: string | null;
  SeatCount?: number;
  TripType?: string | null;
  TravelClass?: string | null;
  Price?: number | null;
}

export interface SeroPackageModel {
  PackageID?: number;
  PackageCode?: string | null;
  Title?: string | null;
  Description?: string | null;
  Price?: number | null;
  VerifiedPrice?: boolean;
  BlendedPrice?: boolean;
  StartDate?: Date;
  EndDate?: Date;
  IsVisaIncluded?: boolean;
  IsActive?: boolean;
  IsByAgent?: boolean;
  ImageUrl?: string | null;
  GuestCount?: number;
  Quantity?: number;
  AddedDate?: Date | string;
  AddedBy?: string;
  LastUpdateDate?: Date | string;
  LastUpdateBy?: string;
  Hotels?: SeroPackageHotelModel[];
  HotelCounts?: SeroPackageHotelCountModel[];
  Trips?: SeroPackageTripModel[];
  Caterings?: SeroPackageCateringModel[];
  Tickets?: SeroPackageTicketModel[];
  Agents?: SeroPackageAgentModel[];
  Tags?: TagBasicModel[];
}
