import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-table-filter-header',
  standalone: true,
  template: `
    <div class="filter-header-wrap">
      <div class="filter-header-row" [class.has-content]="expanded">
        <div class="filter-header-info">
          <span class="filter-title">{{ title }}</span>
          @if (subtitle) {
            <span class="filter-divider" aria-hidden="true"></span>
            <span class="filter-subtitle">{{ subtitle }}</span>
          }
        </div>
        @if (collapsible) {
          <button
            type="button"
            class="filter-toggle-btn"
            [class.has-label]="showToggleLabel"
            (click)="toggle()"
            [attr.aria-expanded]="expanded"
            aria-label="تبديل عرض الفلاتر">
            @if (showToggleLabel) {
              <span class="filter-toggle-label">{{ expanded ? collapseLabel : expandLabel }}</span>
            }
            <span class="material-icons-round toggle-icon" [class.is-expanded]="expanded">expand_more</span>
          </button>
        }
      </div>
      <div class="filter-content-wrap" [class.is-collapsed]="!expanded">
        <div class="filter-content-inner">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      min-height: 42px;
      box-sizing: border-box;
      border-bottom: 1px solid transparent;
      transition: border-color 0.22s ease;
    }

    .filter-header-row.has-content {
      border-color: var(--sero-border-light);
    }

    .filter-header-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .filter-title {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .filter-divider {
      width: 1px;
      height: 14px;
      background: var(--sero-border);
      flex-shrink: 0;
    }

    .filter-subtitle {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--sero-text-secondary);
    }

    .filter-toggle-btn {
      width: 28px;
      height: 28px;
      border: 1px solid var(--sero-border);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sero-text-secondary);
      font-family: var(--sero-font);
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
      flex-shrink: 0;
    }

    .filter-toggle-btn.has-label {
      width: auto;
      min-width: 112px;
      padding: 0 10px;
      gap: 6px;
      border-radius: 8px;
    }

    .filter-toggle-label {
      font-size: 0.72rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .filter-toggle-btn:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
      color: var(--sero-text-primary);
    }

    .filter-toggle-btn:focus-visible {
      outline: 2px solid var(--sero-primary);
      outline-offset: 2px;
    }

    .toggle-icon {
      font-size: 18px;
      line-height: 1;
      transition: transform 0.22s ease;
    }

    .toggle-icon.is-expanded {
      transform: rotate(180deg);
    }

    .filter-content-wrap {
      display: grid;
      grid-template-rows: 1fr;
      opacity: 1;
      transition: grid-template-rows 0.28s ease, opacity 0.2s ease;
    }

    .filter-content-wrap.is-collapsed {
      grid-template-rows: 0fr;
      opacity: 0;
      pointer-events: none;
    }

    .filter-content-inner {
      overflow: hidden;
      min-height: 0;
    }
  `],
})
export class TableFilterHeaderComponent {
    @Input() title = 'الفلاتر';
    @Input() subtitle = 'تخصيص النتائج';
    @Input() expanded = true;
    @Input() collapsible = true;
  @Input() showToggleLabel = false;
  @Input() expandLabel = 'إظهار الفلاتر';
  @Input() collapseLabel = 'إخفاء الفلاتر';
  @Output() expandedChange = new EventEmitter<boolean>();

  toggle(): void {
    this.expandedChange.emit(!this.expanded);
  }
}
