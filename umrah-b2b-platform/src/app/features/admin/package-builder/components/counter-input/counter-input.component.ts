import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-counter-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="counter-label">{{ label }}</label>
    <div class="counter-wrap">
      <button class="counter-btn" type="button" (click)="increment()" [disabled]="isAtMax()">
        <span class="material-icons-round">add</span>
      </button>
      <div class="counter-value">
        <strong>{{ value }}</strong>
        <span>{{ unit }}</span>
      </div>
      <button class="counter-btn" type="button" (click)="decrement()" [disabled]="isAtMin()">
        <span class="material-icons-round">remove</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .counter-label {
      font-size: 0.86rem;
      color: var(--sero-text-primary);
      font-weight: 600;
    }

    .counter-wrap {
      min-height: 42px;
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      background: #fafbf8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px;
      gap: 8px;
    }

    .counter-btn {
      width: 30px;
      height: 30px;
      border: 1px solid var(--sero-border);
      background: #fff;
      border-radius: 8px;
      color: var(--sero-text-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all var(--t-fast);
    }

    .counter-btn:hover:not(:disabled) {
      border-color: var(--sero-primary);
      color: var(--sero-primary);
    }

    .counter-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .counter-btn .material-icons-round {
      font-size: 18px;
    }

    .counter-value {
      flex: 1;
      display: inline-flex;
      align-items: baseline;
      justify-content: center;
      gap: 6px;
      color: var(--sero-text-primary);
      font-size: 0.92rem;
    }

    .counter-value strong {
      font-size: 1rem;
      line-height: 1;
    }

    .counter-value span {
      color: var(--sero-text-secondary);
      font-size: 0.82rem;
    }
  `]
})
export class CounterInputComponent {
  @Input({ required: true }) label = '';
  @Input() value = 1;
  @Input() min = 1;
  @Input() max = 99;
  @Input() unit = '';
  @Output() valueChange = new EventEmitter<number>();

  increment(): void {
    if (this.value < this.max) {
      this.valueChange.emit(this.value + 1);
    }
  }

  decrement(): void {
    if (this.value > this.min) {
      this.valueChange.emit(this.value - 1);
    }
  }

  isAtMin(): boolean {
    return this.value <= this.min;
  }

  isAtMax(): boolean {
    return this.value >= this.max;
  }
}
