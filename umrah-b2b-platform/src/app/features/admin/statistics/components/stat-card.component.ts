import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { StatisticsSummaryItem } from '../statistics.mock';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="stat-card">
      <div class="stat-head">
        <span class="material-icons-round">{{ item.icon }}</span>
      </div>
      <div class="stat-title">{{ item.title }}</div>
      <div class="stat-value">{{ item.value }}</div>
      <div class="stat-meta">{{ item.metaLabel }} <strong>{{ item.metaValue }}</strong></div>
    </article>
  `,
  styles: [`
    .stat-card {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      padding: 14px 16px;
      min-height: 134px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .stat-head {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: var(--sero-primary-50);
      color: var(--sero-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-head .material-icons-round { font-size: 19px; }
    .stat-title { font-size: 0.82rem; color: var(--sero-text-secondary); font-weight: 600; }
    .stat-value { font-size: 1.7rem; line-height: 1; color: var(--sero-text-primary); font-weight: 800; }
    .stat-meta { font-size: 0.76rem; color: var(--sero-text-muted); }
    .stat-meta strong { color: var(--sero-text-secondary); }
  `]
})
export class StatCardComponent {
  @Input({ required: true }) item!: StatisticsSummaryItem;
}
