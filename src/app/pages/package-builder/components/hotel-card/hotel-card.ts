// hotel-card.component.ts
import { Component, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { CounterInput } from '../counter-input/counter-input';
import { HotelModel } from 'src/app/services/admin.api.client';
import { MatDialog } from '@angular/material/dialog';
import { HotelProfileComponent } from 'src/app/pages/hotels/hotel-profile/hotel-profile.component';
import { TranslateModule } from '@ngx-translate/core';


// Define an interface for the hotel data to ensure type safety
export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number; // e.g., 3, 4, 5 stars
  price: number;
  imageUrl: string;
  // Add other properties as needed from your HTML structure
}

@Component({
  selector: 'hotel-card',
  imports: [CounterInput, TranslateModule], // Import NgOptimizedImage for image optimization
  templateUrl: './hotel-card.html',
  styleUrl: './hotel-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush, // Use OnPush change detection
})
export class HotelCard {

  private dialog = inject(MatDialog);

  hotelData = input.required<HotelModel>();

  isSelected = input<boolean>(false);
  districtName = input<string>("");

  selectHotel = output<number>(); 

  openHotelProfileDialog() {
    const hotelId = this.hotelData().HotelID ?? null;
    if (!hotelId) {
      return;
    }

    this.dialog.open(HotelProfileComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '90vh',
      panelClass: 'hotel-profile-dialog',
      autoFocus: false,
      disableClose: false,
      data: { hotelId },
    });
  }

  getButtonClasses(): string {
    if (this.isSelected()) {
      return 'bg-primary-500 text-white';
    } else {
      return 'bg-gray-100 hover:bg-gray-200 text-gray-800';
    }
  }

  // resetSelection(){
  //   this.selectHotel.emit(''); 
  // }
}
