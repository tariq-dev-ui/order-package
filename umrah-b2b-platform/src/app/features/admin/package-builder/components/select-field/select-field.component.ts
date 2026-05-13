import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectOption } from '../../../../../core/models/package-builder-ui.model';
import { SeroDropdownComponent } from '../../../../../shared/components/sero-dropdown/sero-dropdown.component';

@Component({
  selector: 'app-select-field',
  standalone: true,
  imports: [CommonModule, SeroDropdownComponent],
  template: `
    <label class="sb-select-label">{{ label }}</label>
    <app-sero-dropdown
      [options]="dropdownOptions"
      [value]="value"
      (valueChange)="valueChange.emit($event)"
      [placeholder]="placeholder"
      [disabled]="disabled">
    </app-sero-dropdown>
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

    :host app-sero-dropdown { width: 100%; }
  `]
})
export class SelectFieldComponent {
  @Input({ required: true }) label = '';
  @Input() placeholder = 'اختر';
  @Input() value = '';
  @Input() disabled = false;
  @Input() options: SelectOption[] = [];
  @Output() valueChange = new EventEmitter<string>();

  get dropdownOptions(): { value: string; label: string }[] {
    return this.options.map((option) => ({
      value: option.value,
      label: option.label
    }));
  }
}
