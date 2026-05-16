import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SeroPackageCateringModel } from 'src/app/services/admin.api.client';

@Component({
  selector: 'package-caterings-details',
  imports: [TranslateModule],
  templateUrl: './package-caterings-details.component.html',
})
export class PackageCateringsDetailsComponent {
  @Input({ required: true }) Caterings: SeroPackageCateringModel[] | null | undefined;
}
