import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-availability-report-page',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="empty-page-body" aria-label="Availability report content area">
      <h1>{{ 'sidebar.nav.availabilityReport' | translate }}</h1>
    </section>
  `,
  styles: [`
    .empty-page-body {
      width: 100%;
      min-height: calc(100vh - var(--sero-topbar-height) - 32px);
      background: transparent;
      border: none;
    }
  `]
})
export class AvailabilityReportPageComponent {}
