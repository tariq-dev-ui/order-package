import { Component, Input } from '@angular/core';
import { TagBasicModel } from 'src/app/services/admin.api.client';

@Component({
  selector: 'package-tags-details',
  imports: [],
  templateUrl: './package-tags-details.component.html',
})
export class PackageTagsDetailsComponent {
  @Input({ required: true }) Tags: TagBasicModel[] | null | undefined;
}
