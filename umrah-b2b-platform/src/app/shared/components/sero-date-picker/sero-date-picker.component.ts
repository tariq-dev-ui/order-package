import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-sero-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDatepickerModule, MatInputModule, MatNativeDateModule],
  template: `
    <div class="sero-date-field">
      <input
        matInput
        class="sero-date-input"
        [matDatepicker]="picker"
        [value]="selectedDate"
        [placeholder]="placeholder"
        [disabled]="disabled"
        readonly
        (click)="picker.open()"
        (focus)="picker.open()"
        (dateChange)="onDateChange($event)" />

      <button
        type="button"
        class="sero-date-trigger"
        [disabled]="disabled"
        (click)="picker.open()"
        aria-label="Open calendar">
        <span class="material-icons-round">calendar_month</span>
      </button>

      <mat-datepicker #picker [panelClass]="'sero-datepicker-panel'"></mat-datepicker>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .sero-date-field {
      position: relative;
      width: 100%;
    }

    .sero-date-input {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.86rem;
      padding: 9px 40px 9px 12px;
      outline: none;
      cursor: pointer;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
      box-sizing: border-box;
    }

    :host-context([dir='rtl']) .sero-date-input {
      padding: 9px 12px 9px 40px;
    }

    .sero-date-input:hover:not(:disabled) {
      border-color: var(--sero-border-strong);
    }

    .sero-date-input:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
    }

    .sero-date-trigger {
      position: absolute;
      inset-inline-end: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 26px;
      height: 26px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--sero-text-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--t-fast);
    }

    .sero-date-trigger:hover:not(:disabled) {
      color: var(--sero-primary);
      background: color-mix(in srgb, var(--sero-primary) 8%, transparent);
      border-color: color-mix(in srgb, var(--sero-primary) 28%, transparent);
    }

    .sero-date-trigger .material-icons-round {
      font-size: 18px;
    }

    .sero-date-input:disabled,
    .sero-date-trigger:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `]
})
export class SeroDatePickerComponent {
  @Input() value = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string>();

  get selectedDate(): Date | null {
    if (!this.value) {
      return null;
    }
    const [year, month, day] = this.value.split('-').map((n) => Number(n));
    if (!year || !month || !day) {
      return null;
    }
    return new Date(year, month - 1, day);
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    const date = event.value;
    if (!date) {
      this.valueChange.emit('');
      return;
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    this.valueChange.emit(`${yyyy}-${mm}-${dd}`);
  }
}
