import { Injectable } from '@angular/core';
import { HotelFormValue, HotelModel } from './hotel.model';
import { HOTELS_ROWS } from './hotels.mock';

@Injectable({ providedIn: 'root' })
export class HotelsService {
  private hotels: HotelModel[] = HOTELS_ROWS.map((hotel) => ({ ...hotel }));

  getAll(): HotelModel[] {
    return this.hotels.map((hotel) => ({ ...hotel }));
  }

  add(value: HotelFormValue): HotelModel {
    // Future backend integration: replace this local insert with a create-hotel API call.
    const hotel: HotelModel = {
      id: `hotel-${Date.now()}`,
      ...value,
      logoLabel: value.logoLabel.trim() || 'Hotel logo',
      createdAt: this.formatToday(),
    };
    this.hotels = [hotel, ...this.hotels];
    return { ...hotel };
  }

  update(id: string, value: HotelFormValue): HotelModel | null {
    // Future backend integration: replace this local update with an update-hotel API call.
    let updated: HotelModel | null = null;
    this.hotels = this.hotels.map((hotel) => {
      if (hotel.id !== id) {
        return hotel;
      }

      updated = {
        ...hotel,
        ...value,
        logoLabel: value.logoLabel.trim() || 'Hotel logo',
      };
      return updated;
    });
    return updated ? { ...(updated as HotelModel) } : null;
  }

  delete(id: string): void {
    // Future backend integration: replace this local delete with a delete-hotel API call.
    this.hotels = this.hotels.filter((hotel) => hotel.id !== id);
  }

  toggleStatus(id: string, isActive: boolean): void {
    // Future backend integration: replace this local status change with a status API call.
    this.hotels = this.hotels.map((hotel) => hotel.id === id ? { ...hotel, isActive } : hotel);
  }

  private formatToday(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${now.getFullYear()}`;
  }
}
