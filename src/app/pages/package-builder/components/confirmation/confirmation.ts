import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';

import { AdminAPIClient } from 'src/app/services/admin.api.client';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'confirmation-step',
  imports: [LoadingSpinnerComponent, TranslateModule],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css'
})
export class Confirmation {


  @Input() editMode!: boolean;
  @Input() packageId!: number | null;
  @Input() packageName!: string;
  @Output() onSummaryClose = new EventEmitter<void>();
  private readonly adminApiClient = inject(AdminAPIClient);
  
  isLoading = signal(false);

  downloadPackageDetails(packageId: number) {
    this.isLoading.set(true);
    this.adminApiClient.getPackagePdf({packageId}).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response && response.Content) {
          const byteCharacters = atob(response.Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: response.ContentType || 'application/pdf' });

          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = response.FileName || `package-${packageId}.pdf`;
          link.click();
          window.URL.revokeObjectURL(link.href);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

}
