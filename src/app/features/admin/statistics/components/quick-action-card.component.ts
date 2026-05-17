import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { QuickActionItem } from '../statistics.mock';

@Component({
  selector: 'app-quick-action-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="qa-card">
      <span class="material-icons-round qa-icon">{{ item.icon }}</span>
      <div class="qa-title">{{ item.title }}</div>
      <div class="qa-sub">{{ item.subtitle }}</div>
    </button>
  `,
  styles: [`
    .qa-card {
      border: 1px solid var(--sero-border-light);
      border-radius: 12px;
      background: #fcfdfb;
      min-height: 118px;
      padding: 14px;
      width: 100%;
      text-align: start;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: all var(--t-fast);
      cursor: pointer;
    }

    .qa-card:hover {
      border-color: var(--sero-border-strong);
      box-shadow: var(--shadow-sm);
      background: var(--sero-card-bg);
    }

    .qa-icon {
      font-size: 20px;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--sero-primary-50);
      color: var(--sero-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .qa-title { font-size: 0.9rem; color: var(--sero-text-primary); font-weight: 700; }
    .qa-sub { font-size: 0.76rem; color: var(--sero-text-muted); }
  `]
})
export class QuickActionCardComponent {
  @Input({ required: true }) item!: QuickActionItem;
}
