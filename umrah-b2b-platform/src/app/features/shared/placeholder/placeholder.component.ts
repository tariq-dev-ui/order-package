import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="placeholder-page">
      <div class="placeholder-card">
        <span class="material-icons-round placeholder-icon">construction</span>
        <h2 class="placeholder-title">قريباً</h2>
        <p class="placeholder-desc">هذا القسم قيد التطوير</p>
      </div>
    </div>
  `,
  styles: [`
    .placeholder-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 420px;
      direction: rtl;
    }

    .placeholder-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border);
      border-radius: 16px;
      padding: 48px 64px;
      box-shadow: var(--shadow-sm);
      text-align: center;
    }

    .placeholder-icon {
      font-size: 48px;
      color: var(--sero-border-strong);
    }

    .placeholder-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
      margin: 0;
    }

    .placeholder-desc {
      font-size: 0.875rem;
      color: var(--sero-text-muted);
      margin: 0;
    }
  `]
})
export class PlaceholderComponent {}
