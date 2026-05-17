import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from './core.service';

type AppSnackKind = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root',
})
export class AppSnackBarService {
  translate = inject(TranslateService);
  settings = inject(CoreService);
  snackBar = inject(MatSnackBar);
  options = this.settings.getOptions();

  private toast(kind: AppSnackKind, message: string) {
    const isRtl = this.options.dir === 'rtl';
    this.snackBar.open(message, this.translate.instant('Close'), {
      duration: 4000,
      horizontalPosition: isRtl ? 'start' : 'end',
      verticalPosition: 'top',
      direction: isRtl ? 'rtl' : 'ltr',
      panelClass: ['app-toast-panel', `app-toast-panel--${kind}`],
    });
  }

  showSuccessSnackBar(message: string = this.translate.instant('Success')) {
    this.toast('success', message);
  }

  showErrorSnackBar(message: string = this.translate.instant('Failed')) {
    this.toast('error', message);
  }

  showInfoSnackBar(message: string, _title?: string) {
    this.toast('info', message);
  }

  showWarningSnackBar(message: string, _title?: string) {
    this.toast('warning', message);
  }
}
