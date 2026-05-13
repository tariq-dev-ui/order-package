import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <section class="empty-page-body" aria-label="Empty page content area"></section>
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
export class PlaceholderComponent {}
