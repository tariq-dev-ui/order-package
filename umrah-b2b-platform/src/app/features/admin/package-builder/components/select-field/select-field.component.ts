import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectOption } from '../../../../../core/models/package-builder-ui.model';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <label class="sb-select-label">{{ label }}</label>
    <div class="sb-select-wrap">
      <select
        class="sb-select-control"
        [ngModel]="value"
        (ngModelChange)="valueChange.emit($event)"
        [disabled]="disabled">
        <option value="">{{ placeholder }}</option>
        @for (option of options; track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
      <span class="material-icons-round sb-select-arrow">expand_more</span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sb-select-label {
      font-size: 0.86rem;
      color: var(--sero-text-primary);
      font-weight: 600;
    }

    .sb-select-wrap {
      position: relative;
    }

    .sb-select-control {
      width: 100%;
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      background: #fff;
      min-height: 42px;
      padding: 9px 38px 9px 12px;
      font-size: 0.86rem;
      color: var(--sero-text-primary);
      appearance: none;
      outline: none;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }

    .sb-select-control:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.08);
    }

    .sb-select-control:disabled {
      background: var(--sero-surface-2);
      color: var(--sero-text-muted);
      cursor: not-allowed;
    }

    .sb-select-arrow {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      font-size: 18px;
      color: var(--sero-text-muted);
      pointer-events: none;
    }

    :host-context([dir="rtl"]) .sb-select-control {
      padding-right: 12px;
      padding-left: 38px;
    }

    :host-context([dir="rtl"]) .sb-select-arrow {
      right: auto;
      left: 10px;
    }
  `]
})
export class SelectFieldComponent {
  @Input({ required: true }) label = '';
  @Input() placeholder = 'اختر';
  @Input() value = '';
  @Input() disabled = false;
  @Input() options: SelectOption[] = [];
  @Output() valueChange = new EventEmitter<string>();
}
