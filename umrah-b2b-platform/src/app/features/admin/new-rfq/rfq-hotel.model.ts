export type RfqHotelSubscriptionType = 'RMS Hotel Owner' | 'External Hotel Owner';

export interface RfqHotelModel {
  id: string;
  name: string;
  type: string;
  city: string;
  country: string;
  area: string;
  subscriptions: RfqHotelSubscriptionType[];
  rating: number;
}

export interface RfqHotelFilterState {
  city: string;
  subscriptionType: RfqHotelSubscriptionType | '';
}
