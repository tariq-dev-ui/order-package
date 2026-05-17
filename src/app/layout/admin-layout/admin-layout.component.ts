import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopbarComponent } from '../components/topbar/topbar.component';
import { LayoutService } from '../../core/services/layout.service';
import { ViewModeService } from '../../core/services/view-mode.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="sero-shell">
      <app-sidebar />
      <div class="sero-main"
           [class.sidebar-collapsed]="layout.sidebarCollapsed()">
        <app-topbar />
        <main class="sero-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .sero-shell {
      display: flex;
      min-height: 100vh;
      background: var(--sero-app-bg);
    }

    .sero-main {
      flex: 1;
      --layout-sidebar-offset: var(--sero-sidebar-width);
      margin-left: var(--sero-sidebar-width);
      margin-right: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left var(--t-slow), margin-right var(--t-slow);
      min-width: 0;
    }

    .sero-main.sidebar-collapsed {
      --layout-sidebar-offset: var(--sero-sidebar-collapsed);
      margin-left: var(--sero-sidebar-collapsed);
    }

    .sero-content {
      flex: 1;
      padding: 24px 28px;
      background: var(--sero-app-bg);
      min-height: calc(100vh - var(--sero-topbar-height));
    }

    /* RTL — sidebar is on the right */
    :host-context([dir="rtl"]) .sero-main {
      --layout-sidebar-offset: var(--sero-sidebar-width);
      margin-left: 0;
      margin-right: var(--sero-sidebar-width);
    }

    :host-context([dir="rtl"]) .sero-main.sidebar-collapsed {
      --layout-sidebar-offset: var(--sero-sidebar-collapsed);
      margin-left: 0;
      margin-right: var(--sero-sidebar-collapsed);
    }

    @media (max-width: 1023px) {
      .sero-main,
      .sero-main.sidebar-collapsed {
        --layout-sidebar-offset: 0px;
        margin-left: 0;
        margin-right: 0;
      }

      .sero-content {
        padding: 16px;
      }
    }
  `]
})
export class AdminLayoutComponent {
  pageTitle = 'SERO Platform';

  constructor(
    public layout: LayoutService,
    private readonly viewModeService: ViewModeService,
    private readonly router: Router
  ) {
    this.viewModeService.selectedView$.subscribe((mode) => {
      this.pageTitle = mode === 'admin'
        ? 'Admin View'
        : mode === 'master'
          ? 'Master Agent View'
          : 'Sub Agent View';
    });

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.urlAfterRedirects.startsWith('/admin/analytics')) {
          this.pageTitle = 'الإحصائيات';
        }
      });

    if ((this.router.url || '').startsWith('/admin/analytics')) {
      this.pageTitle = 'الإحصائيات';
    }
  }
}
