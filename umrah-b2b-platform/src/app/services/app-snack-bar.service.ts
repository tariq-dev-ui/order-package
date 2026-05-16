import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from './core.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AppSnackBarService {
  translate = inject(TranslateService);
  settings = inject(CoreService);
  options = this.settings.getOptions();

  private readonly svgIcons: Record<string, string> = {
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2l4-4"/></svg>`,
    error:   `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M10 10l4 4m0-4l-4 4"/></svg>`,
    info:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v4h1"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.871l-8.106-13.534a1.914 1.914 0 0 0-3.274 0z"/><path d="M12 9v4M12 16h.01"/></svg>`,
  };

  private toast(icon: SweetAlertIcon, message: string, accentColor: string) {
    const isRtl = this.options.dir === 'rtl';
    Swal.fire({
      toast: true,
      position: isRtl ? 'top-start' : 'top-end',
      icon,
      iconHtml: this.svgIcons[icon],
      title: message,
      showConfirmButton: false,
      showCloseButton: true,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (popup) => {
        popup.style.setProperty('--accent', accentColor);
        if (isRtl) popup.setAttribute('dir', 'rtl');
        popup.addEventListener('mouseenter', () => Swal.stopTimer());
        popup.addEventListener('mouseleave', () => Swal.resumeTimer());
      },
      customClass: {
        popup: `app-toast app-toast--${icon}`,
        title: 'app-toast-title',
        timerProgressBar: 'app-toast-progress',
        closeButton: 'app-toast-close',
      },
    });
  }

  showSuccessSnackBar(message: string = this.translate.instant('Success')) {
    this.toast('success', message, '#10b981');
  }

  showErrorSnackBar(message: string = this.translate.instant('Failed')) {
    this.toast('error', message, '#ef4444');
  }

  showInfoSnackBar(message: string, _title?: string) {
    this.toast('info', message, '#3a472a');
  }

  showWarningSnackBar(message: string, _title?: string) {
    this.toast('warning', message, '#f59e0b');
  }
}
