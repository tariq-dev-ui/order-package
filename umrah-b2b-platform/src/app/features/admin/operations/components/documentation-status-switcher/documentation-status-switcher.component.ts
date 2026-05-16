import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { DocumentationStatus } from '../../models/documentation-status.model';

@Component({
  selector: 'app-documentation-status-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="doc-switcher" role="tablist" aria-label="Documentation status">
      <button
        type="button"
        class="seg-btn"
        [class.active]="active() === 'pending'"
        [attr.aria-pressed]="active() === 'pending'"
        (click)="setActive('pending')">
        التوثيق <span class="count">({{ pendingCount }})</span>
      </button>

      <button
        type="button"
        class="seg-btn"
        [class.active]="active() === 'documented'"
        [attr.aria-pressed]="active() === 'documented'"
        (click)="setActive('documented')">
        تم توثيقها <span class="count">({{ documentedCount }})</span>
      </button>
    </div>
  `,
  styles: [
    `
    .doc-switcher {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      border: 1px solid var(--app-border);
      border-radius: 10px;
      background: var(--app-card-bg);
    }

    .seg-btn {
      min-height: 36px;
      padding: 0 14px;
      border-radius: 8px;
      border: 1px solid var(--app-border);
      background: var(--app-card-bg);
      color: var(--app-text-secondary);
      font-family: inherit;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
    }

    .seg-btn.active {
      background: var(--app-heading);
      color: var(--app-card-bg);
      border-color: var(--app-heading);
    }

    .seg-btn:not(.active):hover {
      color: var(--app-text-primary);
      border-color: var(--app-heading);
    }

    .seg-btn .count {
      margin-inline-start: 6px;
      font-weight: 900;
    }
    `,
  ],
})
export class DocumentationStatusSwitcherComponent {
  private _active = signal<DocumentationStatus>('pending');

  @Input()
  set activeStatus(v: DocumentationStatus | undefined) {
    if (v) this._active.set(v);
  }
  get active() {
    return this._active;
  }

  @Input() pendingCount = 0;
  @Input() documentedCount = 0;

  @Output() statusChange = new EventEmitter<DocumentationStatus>();

  setActive(status: DocumentationStatus) {
    if (status === this._active()) return;
    this._active.set(status);
    this.statusChange.emit(status);
  }
}
