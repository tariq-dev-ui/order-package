import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RequestModel, SeroPackageHotelCountModel, SeroPackageHotelModel } from 'src/app/services/admin.api.client';
import { MatDialog } from '@angular/material/dialog';
import { HotelProfileComponent } from 'src/app/pages/hotels/hotel-profile/hotel-profile.component';

@Component({
  selector: 'package-hotels-details',
  imports: [TranslateModule],
  templateUrl: './package-hotels-details.component.html',
})
export class PackageHotelsDetailsComponent {
  private dialog = inject(MatDialog);

  @Input({ required: true }) Hotels: SeroPackageHotelModel[] | null | undefined;
  @Input({ required: true }) HotelCounts: SeroPackageHotelCountModel[] | null | undefined;
  @Input() request: RequestModel | undefined;
  @Input() withTitle: boolean = true;
  @Input() withManageBtns: boolean = false;
  @Input() requestId!: number;
  @Input() agentId!: number;

  @Output() voucherCreated = new EventEmitter<void>();

  openHotelProfileDialog(hotel: SeroPackageHotelModel | null | undefined) {
    const hotelId = hotel?.HotelId ?? null;
    if (!hotelId) {
      return;
    }

    this.dialog.open(HotelProfileComponent, {
      width: '95vw',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '90vh',
      panelClass: 'hotel-profile-dialog',
      autoFocus: false,
      disableClose: false,
      data: { hotelId },
    });
  }

  openROVsDialog(hotel: SeroPackageHotelModel | null | undefined) {
    if (!hotel) {
      return;
    }
    this.openHotelProfileDialog(hotel);
  }

  openHotelDialog(hotelData: SeroPackageHotelModel) {
    this.openHotelProfileDialog(hotelData);
    this.voucherCreated.emit();
  }

  getAllHotelsWithCityId(cityId: number, hotels: SeroPackageHotelModel[] | null): SeroPackageHotelModel[] | null {
    if (hotels) {
      return hotels.filter(hotel => hotel.CityId === cityId);
    }
    return null;
  }

}
