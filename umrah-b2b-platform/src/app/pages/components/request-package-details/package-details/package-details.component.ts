import { Component, Input, inject } from '@angular/core';
import { SeroPackageModel } from 'src/app/services/admin.api.client';
import { PackageHotelsDetailsComponent } from '../package-hotels-details/package-hotels-details.component';
import { PackageTagsDetailsComponent } from '../package-tags-details/package-tags-details.component';
import { PackageTripsDetailsComponent } from '../package-trips-details/package-trips-details.component';
import { PackageTicketsDetailsComponent } from '../package-tickets-details/package-tickets-details.component';
import { PackageCateringsDetailsComponent } from '../package-caterings-details/package-caterings-details.component';
import { PackageAgentDetailsComponent } from '../package-agent-details/package-agent-details.component';
import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { PackageImagePreviewDialogComponent } from '../../../sero-packages/package-image-preview-dialog/package-image-preview-dialog.component';

@Component({
  selector: 'package-details',
  imports: [
    PackageHotelsDetailsComponent,
    PackageTagsDetailsComponent,
    PackageTripsDetailsComponent,
    PackageTicketsDetailsComponent,
    PackageCateringsDetailsComponent,
    PackageAgentDetailsComponent,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    TranslateModule,
  ],
  templateUrl: './package-details.component.html',
})
export class PackageDetailsComponent {
  private readonly dialog = inject(MatDialog);

  @Input() pkg: SeroPackageModel | undefined;
  @Input() showTags: boolean = true;
  @Input() showHotels: boolean = true;
  @Input() showVisaDetails: boolean = true;
  @Input() showTrips: boolean = true;
  @Input() showCatering: boolean = true;
  @Input() showImage: boolean = true;
  @Input() imageSize: 'small' | 'medium' | 'large' = 'medium';
  @Input() showPKGDetails: boolean = true;
  @Input() showAgents: boolean = true;

  openImagePreview() {
    const url = this.pkg?.ImageUrl;
    if (!url) return;
    this.dialog.open(PackageImagePreviewDialogComponent, {
      maxWidth: '95vw',
      width: '95vw',
      height: '95vh',
      panelClass: 'image-preview-dialog-panel',
      data: { imageUrl: url, title: this.pkg?.Title ?? null, code: this.pkg?.PackageCode ?? null },
    });
  }
}
