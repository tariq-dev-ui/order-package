import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-documentation-status-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="doc-switcher">
      <button
        type="button"
        class="seg-btn"
        [class.active]="active() === 'pending'"
        (click)="setActive('pending')">
        التوثيق <span class="count">({{ pendingCount }})</span>
      </button>

      <button
        type="button"
        class="seg-btn"
        [class.active]="active() === 'documented'"
        (click)="setActive('documented')">
        تم توثيقها <span class="count">({{ documentedCount }})</span>
      </button>
    </div>
  `,
  styles: [
    `
    .doc-switcher { display: inline-flex; gap: 8px; align-items: center; }
    .seg-btn { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--app-border); background: var(--app-card-bg); color: var(--app-text-secondary); font-weight:700; cursor:pointer; }
    .seg-btn.active { background: var(--app-heading); color: #fff; border-color: var(--app-heading); }
    .seg-btn .count { margin-left:6px; font-weight:700; }
    `,
  ],
})
export class DocumentationStatusSwitcherComponent {
  private _active = signal<'pending' | 'documented'>('pending');

  @Input()
  set activeStatus(v: 'pending' | 'documented' | undefined) {
    if (v) this._active.set(v);
  }
  get active() {
    return this._active;
  }

  @Input() pendingCount = 0;
  @Input() documentedCount = 0;

  @Output() statusChange = new EventEmitter<'pending' | 'documented'>();

  setActive(status: 'pending' | 'documented') {
    if (status === this._active()) return;
    this._active.set(status);
    this.statusChange.emit(status);
  }
}
