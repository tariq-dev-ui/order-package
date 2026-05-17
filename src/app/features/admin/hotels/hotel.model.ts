export type HotelStatusFilter = 'all' | 'active' | 'inactive';
export type HotelFormMode = 'create' | 'view' | 'edit';

export interface HotelModel {
  id: string;
  logoLabel: string;
  name: string;
  address: string;
  rating: string;
  city: string;
  district: string;
  maxDistanceFromHaram: string;
  createdAt: string;
  isActive: boolean;
}

export interface HotelsFilterState {
  city: string;
  district: string;
  maxDistanceFromHaram: string;
  rating: string;
  status: HotelStatusFilter;
}

export interface HotelFormValue {
  logoLabel: string;
  name: string;
  address: string;
  rating: string;
  city: string;
  district: string;
  maxDistanceFromHaram: string;
  isActive: boolean;
}
