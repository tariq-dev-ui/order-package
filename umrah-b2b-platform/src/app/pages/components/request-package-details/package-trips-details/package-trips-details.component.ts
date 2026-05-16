import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SeroPackageTripModel } from 'src/app/services/admin.api.client';

@Component({
  selector: 'package-trips-details',
  imports: [TranslateModule],
  templateUrl: './package-trips-details.component.html',
})
export class PackageTripsDetailsComponent {
  @Input({ required: true }) Trips: SeroPackageTripModel[] | null | undefined;
}
