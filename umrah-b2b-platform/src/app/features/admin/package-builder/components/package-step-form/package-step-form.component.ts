import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CounterInputComponent } from '../counter-input/counter-input.component';
import { SelectFieldComponent } from '../select-field/select-field.component';
import {
  MakkahFormSelection,
  SelectOption
} from '../../../../../core/models/package-builder-ui.model';

@Component({
  selector: 'app-package-step-form',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectFieldComponent, CounterInputComponent],
  template: `
    <section class="step-form-card">
      <header class="form-head">
        <div class="title-wrap">
          <span class="title-icon">
            <span class="material-icons-round">layers</span>
          </span>
          <div>
            <h3>اختر فندقك في مكة</h3>
            <p>اختر الفندق الذي يناسب احتياجاتك</p>
          </div>
        </div>
      </header>

      <div class="toggle-row">
        <label class="toggle-inline">
          <input type="checkbox" [(ngModel)]="syncNightsForAll" />
          <span class="toggle-box"></span>
          <span>تفعيل عدد الليالي للجميع</span>
        </label>
      </div>

      <div class="tabs-row">
        <button type="button" class="tab-btn active">
          <span class="material-icons-round">tune</span>
          فندق حسب المعايير
        </button>
        <button type="button" class="tab-btn">
          <span class="material-icons-round">search</span>
          اختر فندقًا محددًا
        </button>
      </div>

      <div class="form-grid">
        <app-select-field
          label="الحي"
          placeholder="اختر الحي"
          [options]="districtOptions"
          [value]="formValue.district"
          (valueChange)="onValueChange('district', $event)" />

        <app-select-field
          label="الفئة"
          placeholder="اختر الفئة"
          [options]="categoryOptions"
          [value]="formValue.category"
          (valueChange)="onValueChange('category', $event)" />

        <app-select-field
          class="span-2"
          label="نوع الغرفة"
          placeholder="اختر نوع الغرفة"
          [options]="roomTypeOptions"
          [value]="formValue.roomType"
          (valueChange)="onValueChange('roomType', $event)" />

        <app-counter-input
          label="عدد الغرف"
          [value]="formValue.rooms"
          unit="غرفة"
          [min]="1"
          [max]="50"
          (valueChange)="onCounterChange('rooms', $event)" />

        <app-counter-input
          label="عدد الليالي"
          [value]="formValue.nights"
          unit="ليلة"
          [min]="1"
          [max]="30"
          (valueChange)="onCounterChange('nights', $event)" />
      </div>

      <div class="add-row">
        <button class="btn btn--secondary" [disabled]="!canAdd()" (click)="addSelection()">
          إضافة جديد
        </button>
      </div>

      <footer class="actions-row">
        <button type="button" class="btn btn--secondary" (click)="skip.emit()">
          <span class="material-icons-round">keyboard_double_arrow_right</span>
          تخطي
        </button>
        <button type="button" class="btn btn--primary" (click)="next.emit()">
          التالي
          <span class="material-icons-round">arrow_back</span>
        </button>
      </footer>
    </section>
  `,
  styles: [`
    .step-form-card {
      background: #fff;
      border: 1px solid var(--sero-border-light);
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .title-wrap {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .title-icon {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 1px solid var(--sero-border);
      background: #f5f7f2;
      color: var(--sero-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .title-icon .material-icons-round {
      font-size: 18px;
    }

    .title-wrap h3 {
      margin: 0;
      color: #202b1a;
      font-size: 2rem;
      font-weight: 800;
      line-height: 1.2;
    }

    .title-wrap p {
      margin: 2px 0 0;
      font-size: 1rem;
      color: var(--sero-text-secondary);
    }

    .toggle-row {
      display: flex;
      justify-content: flex-start;
    }

    .toggle-inline {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
      color: var(--sero-text-primary);
      font-weight: 600;
      cursor: pointer;
    }

    .toggle-inline input {
      display: none;
    }

    .toggle-box {
      width: 18px;
      height: 18px;
      border: 1px solid var(--sero-border-strong);
      border-radius: 4px;
      background: #fff;
      position: relative;
      transition: all var(--t-fast);
    }

    .toggle-inline input:checked + .toggle-box {
      background: var(--sero-primary);
      border-color: var(--sero-primary);
    }

    .toggle-inline input:checked + .toggle-box::after {
      content: '';
      position: absolute;
      width: 4px;
      height: 8px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      top: 2px;
      left: 6px;
    }

    .tabs-row {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      border-bottom: 1px solid var(--sero-border-light);
      padding-bottom: 8px;
    }

    .tab-btn {
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      padding: 4px 6px 6px;
      color: #66717f;
      font-size: 0.92rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .tab-btn.active {
      border-bottom-color: var(--sero-primary);
      color: var(--sero-text-primary);
    }

    .tab-btn .material-icons-round {
      font-size: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      align-items: end;
    }

    .span-2 {
      grid-column: span 2;
    }

    .add-row {
      display: flex;
      justify-content: flex-end;
      padding-top: 2px;
    }

    .add-row .btn {
      min-width: 110px;
      background: #eef1f4;
      border-color: #e2e7eb;
      color: #8593a2;
    }

    .actions-row {
      margin-top: 8px;
      display: flex;
      justify-content: flex-start;
      gap: 10px;
      border-top: 1px solid var(--sero-border-light);
      padding-top: 12px;
    }

    @media (max-width: 768px) {
      .title-wrap h3 {
        font-size: 1.45rem;
      }

      .title-wrap p {
        font-size: 0.9rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .span-2 {
        grid-column: span 1;
      }
    }
  `]
})
export class PackageStepFormComponent {
  @Input() districtOptions: SelectOption[] = [];
  @Input() categoryOptions: SelectOption[] = [];
  @Input() roomTypeOptions: SelectOption[] = [];

  @Output() addNew = new EventEmitter<MakkahFormSelection>();
  @Output() next = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();

  syncNightsForAll = false;

  formValue: MakkahFormSelection = {
    district: '',
    category: '',
    roomType: '',
    rooms: 1,
    nights: 1
  };

  onValueChange(field: 'district' | 'category' | 'roomType', value: string): void {
    this.formValue = { ...this.formValue, [field]: value };
  }

  onCounterChange(field: 'rooms' | 'nights', value: number): void {
    this.formValue = { ...this.formValue, [field]: value };
  }

  canAdd(): boolean {
    return !!this.formValue.district && !!this.formValue.category && !!this.formValue.roomType;
  }

  addSelection(): void {
    if (!this.canAdd()) {
      return;
    }

    this.addNew.emit({ ...this.formValue });
  }
}
