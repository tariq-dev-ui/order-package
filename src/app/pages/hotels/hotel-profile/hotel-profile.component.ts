import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AdminAPIClient, HotelModel } from 'src/app/services/admin.api.client';

@Component({
  selector: 'app-hotel-profile',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <div class="bg-white p-6 min-w-[480px]">
      <div class="flex items-center justify-between gap-4 mb-5">
        <h2 class="text-lg font-bold text-gray-900">{{ hotel()?.Name || ('Hotel Profile' | translate) }}</h2>
        <button mat-button type="button" (click)="close()">{{ 'Close' | translate }}</button>
      </div>

      @if (hotel(); as item) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div class="rounded-lg border border-gray-200 p-3">
            <div class="text-xs text-gray-500">{{ 'Hotel' | translate }}</div>
            <div class="font-semibold text-gray-800">{{ item.NameEn || item.Name || '-' }}</div>
          </div>
          <div class="rounded-lg border border-gray-200 p-3">
            <div class="text-xs text-gray-500">{{ 'Rating' | translate }}</div>
            <div class="font-semibold text-gray-800">{{ item.OfficialRating || '-' }}</div>
          </div>
          <div class="rounded-lg border border-gray-200 p-3">
            <div class="text-xs text-gray-500">{{ 'District' | translate }}</div>
            <div class="font-semibold text-gray-800">{{ item.DistID || '-' }}</div>
          </div>
        </div>
      }
    </div>
  `,
})
export class HotelProfileComponent {
  private readonly data = inject(MAT_DIALOG_DATA) as { hotelId?: number };
  private readonly dialogRef = inject(MatDialogRef<HotelProfileComponent>);
  private readonly adminClient = inject(AdminAPIClient);

  readonly hotel = signal<HotelModel | null>(null);

  ngOnInit(): void {
    this.adminClient.getHotel({ hotelId: this.data.hotelId }).subscribe((hotel) => this.hotel.set(hotel));
  }

  close(): void {
    this.dialogRef.close();
  }
}
