export interface HotelModel {
  [key: string]: any;
}

export interface RoomModel {
  [key: string]: any;
}

export interface BookingModel {
  BookingID?: number;
  BookingRooms?: Array<{
    RoomID?: number;
    RoomId?: number;
    RoomNumber?: string;
    RoomTypeName?: string;
    FloorNumber?: number;
    [key: string]: any;
  }>;
  SubBookings?: BookingModel[];
  [key: string]: any;
}

export interface BookingModelPagedResult {
  Items?: BookingModel[];
  TotalCount?: number;
  [key: string]: any;
}

export interface BookingModelSystemResponse {
  Data?: BookingModel;
  Success?: boolean;
  Message?: string;
  [key: string]: any;
}

export interface HotelRoomTypeModel {
  [key: string]: any;
}

export interface RoomPricingModel {
  [key: string]: any;
}

export interface CustomerModel {
  [key: string]: any;
}

export interface OwnerModel {
  [key: string]: any;
}

export interface CreateBookingRequest {
  [key: string]: any;
}

export interface AssignRoomsRequest {
  RoomIDs?: number[];
  [key: string]: any;
}
