import { Injectable } from '@angular/core';
import { RfqHotelFilterState, RfqHotelModel } from './rfq-hotel.model';
import { RFQ_HOTELS } from './rfq-hotels.mock';

@Injectable({ providedIn: 'root' })
export class RfqHotelsService {
  private readonly hotels: RfqHotelModel[] = RFQ_HOTELS.map((hotel) => ({ ...hotel, subscriptions: [...hotel.subscriptions] }));

  getAll(): RfqHotelModel[] {
    return this.hotels.map((hotel) => ({ ...hotel, subscriptions: [...hotel.subscriptions] }));
  }

  search(filters: RfqHotelFilterState): RfqHotelModel[] {
    // Future backend integration: replace this local filtering with an RFQ hotels search API.
    return this.getAll().filter((hotel) => {
      const cityMatch = !filters.city || hotel.city === filters.city;
      const subscriptionMatch = !filters.subscriptionType || hotel.subscriptions.includes(filters.subscriptionType);
      return cityMatch && subscriptionMatch;
    });
  }
}
