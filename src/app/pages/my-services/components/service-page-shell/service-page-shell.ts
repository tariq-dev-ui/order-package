import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ServiceOthers } from '../service-others/service-others';

@Component({
  selector: 'service-page-shell',
  standalone: true,
  imports: [CommonModule, ServiceOthers],
  templateUrl: './service-page-shell.html',
})
export class ServicePageShell {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
  @Input({ required: true }) iconClass = '';
  @Input() backFallbackUrl = '/master/my-services';
  @Input() highlights: string[] = [];

  headerClass(): string {
    return 'from-primary-50 to-white';
  }

  badgeClass(): string {
    return 'bg-primary-100 text-primary-700';
  }

  iconClassName(): string {
    return 'from-primary-400 to-primary-600';
  }

  highlightChipClass(): string {
    return 'bg-primary-50 text-primary-700 border-primary-100';
  }

  goBack(): void {
    const hasBrowserHistory = typeof window !== 'undefined' && window.history.length > 1;
    if (hasBrowserHistory) {
      this.location.back();
      return;
    }

    this.router.navigateByUrl(this.backFallbackUrl);
  }
}
