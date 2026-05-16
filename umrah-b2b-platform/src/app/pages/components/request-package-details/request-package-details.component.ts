import { Component, Input, signal, OnInit, inject } from '@angular/core';
import { RequestModel, SeroPackageModel } from 'src/app/services/admin.api.client';
import { PackageDetailsComponent } from './package-details/package-details.component';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { SeroPackageDetailsDialogComponent } from '../../sero-packages/sero-package-details-dialog/sero-package-details-dialog.component';

@Component({
  selector: 'request-package-details',
  imports: [PackageDetailsComponent, DatePipe, TranslateModule],
  templateUrl: './request-package-details.component.html',
  styleUrl: './request-package-details.component.scss'
})
export class RequestPackageDetailsComponent implements OnInit {
  pkg: SeroPackageModel | undefined;
  @Input() rqst: RequestModel | undefined;
  @Input() isLoading = signal(false);
  @Input() showTags: boolean = true;
  @Input() showHotels: boolean = true;
  @Input() showPassengers: boolean = true;
  @Input() showVisaDetails: boolean = true;
  @Input() showTrips: boolean = true;
  @Input() showCatering: boolean = true;
  @Input() showRequest: boolean = true;
  @Input() showReqDetails: boolean = true;
  @Input() showPackage: boolean = true;
  @Input() showImage: boolean = true;
  @Input() imageSize: 'small' | 'medium' | 'large' = 'large';
  @Input() showPkgDetails: boolean = true;
  @Input() showNote: boolean = true;
  @Input() showAgents: boolean = true;

  private readonly dialog = inject(MatDialog);

  isRequestOpen = signal(true);
  isPackageOpen = signal(true);

  toggleRequest() { this.isRequestOpen.update(v => !v); }
  togglePackage() { this.isPackageOpen.update(v => !v); }

  openPackageDialog() {
    if (!this.pkg) return;
    this.dialog.open(SeroPackageDetailsDialogComponent, {
      width: '95vw',
      maxWidth: '98vw',
      height: '97vh',
      maxHeight: '97vh',
      data: { package: this.pkg },
      autoFocus: false,
    });
  }

  ngOnInit() {
      this.pkg = this.rqst?.PackageModel;
  }
}
