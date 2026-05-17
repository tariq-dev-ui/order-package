import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { AdminAPIClient, SeroPackageHotelModel, SeroPackageModel } from 'src/app/services/admin.api.client';
import { PackageDetailsComponent } from '../../components/request-package-details/package-details/package-details.component';

@Component({
  selector: 'app-sero-package-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    PackageDetailsComponent,
  ],
  templateUrl: './sero-package-details-dialog.component.html',
  styleUrl: './sero-package-details-dialog.component.scss',
})
export class SeroPackageDetailsDialogComponent {
  data = inject(MAT_DIALOG_DATA) as { package: SeroPackageModel };
  dialogRef = inject(MatDialogRef<SeroPackageDetailsDialogComponent>);
  private adminApiClient = inject(AdminAPIClient);

  pkg = signal<SeroPackageModel>(this.data.package);
  private isDataChanged = signal(false);

  get package(): SeroPackageModel {
    return this.pkg();
  }

  ngOnInit() {
    this.dialogRef.updateSize('1400px', '95vh');
    this.dialogRef.addPanelClass('package-details-dialog-container');
  }

  onClose() {
    this.dialogRef.close({ refreshData: this.isDataChanged() });
  }

  onEdit() {
    this.dialogRef.close({ action: 'edit', package: this.pkg(), refreshData: this.isDataChanged() });
  }

  getNightCount(cityId?: number): number | null {
    if (!cityId || !this.package.HotelCounts) return null;
    const hotelCount = this.package.HotelCounts.find((hc) => hc.CityId === cityId);
    return hotelCount?.NightCount || null;
  }

  getGroupedHotels(): Map<number, SeroPackageHotelModel[]> {
    const grouped = new Map<number, SeroPackageHotelModel[]>();
    if (!this.package.Hotels) return grouped;

    this.package.Hotels.forEach((hotel) => {
      const cityId = hotel.CityId || 0;
      if (!grouped.has(cityId)) {
        grouped.set(cityId, []);
      }
      grouped.get(cityId)!.push(hotel);
    });

    return grouped;
  }

  openGenerateDialog() {
    const current = this.pkg();
    const updated: SeroPackageModel = { ...current, ImageUrl: '/IMG/logo.png' };
    this.isDataChanged.set(true);

    if (!current.PackageID) {
      this.pkg.set(updated);
      return;
    }

    this.adminApiClient.updatePackage({ packageId: current.PackageID, body: updated }).subscribe({
      next: (refreshed) => this.pkg.set(refreshed),
      error: () => this.pkg.set(updated),
    });
  }
}
