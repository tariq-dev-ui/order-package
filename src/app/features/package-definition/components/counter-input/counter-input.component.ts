import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-counter-input',
  standalone: true,
  template: `
    <div class="counter-shell">
      <button class="counter-btn" type="button" (click)="decrement()" [disabled]="value <= min"
              aria-label="decrease">
        <span class="material-symbols-outlined">remove</span>
      </button>
      <span class="counter-value">{{ value }}</span>
      <button class="counter-btn" type="button" (click)="increment()" [disabled]="value >= max"
              aria-label="increase">
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
  `,
  styles: [`
    .counter-shell {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      overflow: hidden;
      background: var(--sero-surface);
      height: 40px;
    }

    .counter-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--sero-text-secondary);
      transition: background 0.15s, color 0.15s;
      flex-shrink: 0;
    }

    .counter-btn:hover:not(:disabled) {
      background: color-mix(in srgb, var(--sero-primary) 10%, transparent);
      color: var(--sero-primary);
    }

    .counter-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .counter-btn .material-symbols-outlined { font-size: 18px; }

    .counter-value {
      min-width: 44px;
      text-align: center;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--sero-text);
      border-inline: 1px solid var(--sero-border);
      height: 100%;
      line-height: 40px;
    }
  `]
})
export class CounterInputComponent {
  @Input() value = 1;
  @Input() min = 1;
  @Input() max = 99;
  @Output() valueChange = new EventEmitter<number>();

  increment(): void {
    if (this.value < this.max) this.valueChange.emit(this.value + 1);
  }

  decrement(): void {
    if (this.value > this.min) this.valueChange.emit(this.value - 1);
  }
}
