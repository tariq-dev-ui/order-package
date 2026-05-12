import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { TopbarComponent } from '../components/topbar/topbar.component';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="sero-shell">
      <app-sidebar />
      <div class="sero-main"
           [class.sidebar-collapsed]="layout.sidebarCollapsed()">
        <app-topbar [pageTitle]="pageTitle" />
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
      margin-left: var(--sero-sidebar-width);
      margin-right: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left var(--t-slow), margin-right var(--t-slow);
      min-width: 0;
    }

    .sero-main.sidebar-collapsed {
      margin-left: var(--sero-sidebar-collapsed);
    }

    .sero-content {
      flex: 1;
      padding: 28px 32px;
      background: var(--sero-app-bg);
      min-height: calc(100vh - var(--sero-topbar-height));
    }

    /* RTL — sidebar is on the right */
    :host-context([dir="rtl"]) .sero-main {
      margin-left: 0;
      margin-right: var(--sero-sidebar-width);
    }

    :host-context([dir="rtl"]) .sero-main.sidebar-collapsed {
      margin-left: 0;
      margin-right: var(--sero-sidebar-collapsed);
    }
  `]
})
export class AdminLayoutComponent {
  pageTitle = 'SERO Platform';

  constructor(public layout: LayoutService) {}
}
