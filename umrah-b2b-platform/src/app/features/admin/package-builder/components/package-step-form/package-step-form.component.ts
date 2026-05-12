import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CounterInputComponent } from '../counter-input/counter-input.component';
import { SelectFieldComponent } from '../select-field/select-field.component';
import {
  HotelSelectionMode,
  PackageHotelSelection,
  SelectOption
} from '../../../../../core/models/package-builder-ui.model';
import { PackageBuilderService } from '../../../../../core/services/package-builder.service';

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
        <button type="button" class="tab-btn" [class.active]="activeTab === 'criteria'" (click)="setTab('criteria')">
          <span class="material-icons-round">tune</span>
          فندق حسب المعايير
        </button>
        <button type="button" class="tab-btn" [class.active]="activeTab === 'specific'" (click)="setTab('specific')">
          <span class="material-icons-round">search</span>
          اختر فندقًا محددًا
        </button>
      </div>

      @if (activeTab === 'criteria') {
        <div class="form-grid">
          <app-select-field
            label="الحي"
            placeholder="اختر الحي"
            [options]="districtOptions"
            [value]="criteriaForm.district"
            (valueChange)="onCriteriaValueChange('district', $event)" />

          <app-select-field
            label="الفئة"
            placeholder="اختر الفئة"
            [options]="categoryOptions"
            [value]="criteriaForm.category"
            (valueChange)="onCriteriaValueChange('category', $event)" />

          <app-select-field
            class="span-2"
            label="نوع الغرفة"
            placeholder="اختر نوع الغرفة"
            [options]="roomTypeOptions"
            [value]="criteriaForm.roomType"
            (valueChange)="onCriteriaValueChange('roomType', $event)" />

          <app-counter-input
            label="عدد الغرف"
            [value]="criteriaForm.rooms"
            unit="غرفة"
            [min]="1"
            [max]="50"
            (valueChange)="onCriteriaCounterChange('rooms', $event)" />

          <app-counter-input
            label="عدد الليالي"
            [value]="criteriaForm.nights"
            unit="ليلة"
            [min]="1"
            [max]="30"
            (valueChange)="onCriteriaCounterChange('nights', $event)" />
        </div>
      } @else {
        <div class="form-grid">
          <div class="span-2 form-group">
            <label class="inline-label">اسم الفندق <span class="required">*</span></label>
            <input class="form-control" [(ngModel)]="specificForm.hotelName" placeholder="أدخل اسم الفندق" />
          </div>

          <app-select-field
            class="span-2"
            label="نوع الغرفة"
            placeholder="اختر نوع الغرفة"
            [options]="roomTypeOptions"
            [value]="specificForm.roomType"
            (valueChange)="onSpecificValueChange('roomType', $event)" />

          <app-counter-input
            label="عدد الغرف"
            [value]="specificForm.roomsCount"
            unit="غرفة"
            [min]="1"
            [max]="50"
            (valueChange)="onSpecificCounterChange('roomsCount', $event)" />

          <app-counter-input
            label="عدد الليالي"
            [value]="specificForm.nightsCount"
            unit="ليلة"
            [min]="1"
            [max]="30"
            (valueChange)="onSpecificCounterChange('nightsCount', $event)" />

          <div class="span-2 form-group">
            <label class="inline-label">ملاحظات (اختياري)</label>
            <textarea class="form-control" rows="2" [(ngModel)]="specificForm.notes" placeholder="أي ملاحظات على الفندق"></textarea>
          </div>
        </div>
      }

      @if (validationMessages.length > 0) {
        <div class="form-errors">
          @for (message of validationMessages; track message) {
            <p>{{ message }}</p>
          }
        </div>
      }

      <div class="add-row">
        <button class="btn btn--secondary" [disabled]="!canSubmitActiveForm()" (click)="submitSelection()">
          {{ editingHotelId ? 'حفظ التعديل' : 'إضافة جديد' }}
        </button>
      </div>

      @if (makkahHotels().length > 0) {
        <div class="added-hotels">
          @for (hotel of makkahHotels(); track hotel.id) {
            <article class="added-item">
              <div class="added-main">
                <strong>{{ hotel.hotelName }}</strong>
                <p>{{ hotel.roomType }} - {{ hotel.roomsCount }} غرف - {{ hotel.nightsCount }} ليال</p>
              </div>
              <div class="added-actions">
                <button type="button" class="mini-action" (click)="editHotel(hotel)">
                  <span class="material-icons-round">edit</span>
                </button>
                <button type="button" class="mini-action mini-action--danger" (click)="removeHotel(hotel.id)">
                  <span class="material-icons-round">delete</span>
                </button>
              </div>
            </article>
          }
        </div>
      }

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
      cursor: pointer;
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

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .inline-label {
      font-size: 0.86rem;
      color: var(--sero-text-primary);
      font-weight: 600;
    }

    .span-2 {
      grid-column: span 2;
    }

    .form-errors {
      border: 1px solid #f0d6b2;
      background: #fff8ef;
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .form-errors p {
      margin: 0;
      color: #995a14;
      font-size: 0.82rem;
      font-weight: 600;
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

    .added-hotels {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .added-item {
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: #fbfcfa;
    }

    .added-main strong {
      display: block;
      font-size: 0.88rem;
      color: var(--sero-text-primary);
      margin-bottom: 2px;
    }

    .added-main p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--sero-text-secondary);
    }

    .added-actions {
      display: inline-flex;
      gap: 4px;
    }

    .mini-action {
      width: 28px;
      height: 28px;
      border: 1px solid var(--sero-border);
      border-radius: 7px;
      background: #fff;
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .mini-action .material-icons-round {
      font-size: 16px;
    }

    .mini-action--danger {
      color: #aa4a4a;
      border-color: #e3b6b6;
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

  @Output() hotelsChanged = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();

  readonly makkahHotels;
  syncNightsForAll = false;
  activeTab: HotelSelectionMode = 'criteria';
  editingHotelId: string | null = null;
  validationMessages: string[] = [];

  criteriaForm = {
    district: '',
    category: '',
    roomType: '',
    rooms: 1,
    nights: 1,
    notes: ''
  };

  specificForm = {
    hotelName: '',
    roomType: '',
    roomsCount: 1,
    nightsCount: 1,
    notes: ''
  };

  constructor(private readonly builderService: PackageBuilderService) {
    this.makkahHotels = this.builderService.getMakkahHotelsSignal();
  }

  setTab(tab: HotelSelectionMode): void {
    this.activeTab = tab;
    this.validationMessages = [];
  }

  onCriteriaValueChange(field: 'district' | 'category' | 'roomType', value: string): void {
    this.criteriaForm = { ...this.criteriaForm, [field]: value };
  }

  onCriteriaCounterChange(field: 'rooms' | 'nights', value: number): void {
    this.criteriaForm = { ...this.criteriaForm, [field]: value };
  }

  onSpecificValueChange(field: 'roomType', value: string): void {
    this.specificForm = { ...this.specificForm, [field]: value };
  }

  onSpecificCounterChange(field: 'roomsCount' | 'nightsCount', value: number): void {
    this.specificForm = { ...this.specificForm, [field]: value };
  }

  canSubmitActiveForm(): boolean {
    if (this.activeTab === 'criteria') {
      return !!this.criteriaForm.district && !!this.criteriaForm.category && !!this.criteriaForm.roomType
        && this.criteriaForm.rooms > 0 && this.criteriaForm.nights > 0;
    }

    return !!this.specificForm.hotelName.trim() && !!this.specificForm.roomType
      && this.specificForm.roomsCount > 0 && this.specificForm.nightsCount > 0;
  }

  submitSelection(): void {
    this.validationMessages = this.getValidationMessages();
    if (this.validationMessages.length > 0) {
      return;
    }

    const hotel = this.buildSelection();
    if (this.editingHotelId) {
      this.builderService.updateMakkahHotel(this.editingHotelId, hotel);
    } else {
      this.builderService.addMakkahHotel(hotel);
    }

    this.hotelsChanged.emit();
    this.resetForms();
  }

  editHotel(hotel: PackageHotelSelection): void {
    this.editingHotelId = hotel.id;
    this.activeTab = hotel.selectionMode;
    this.validationMessages = [];

    if (hotel.selectionMode === 'specific') {
      this.specificForm = {
        hotelName: hotel.hotelName,
        roomType: hotel.roomType,
        roomsCount: hotel.roomsCount,
        nightsCount: hotel.nightsCount,
        notes: hotel.notes || ''
      };
      return;
    }

    this.criteriaForm = {
      district: hotel.district || '',
      category: hotel.category || '',
      roomType: hotel.roomType,
      rooms: hotel.roomsCount,
      nights: hotel.nightsCount,
      notes: hotel.notes || ''
    };
  }

  removeHotel(hotelId: string): void {
    this.builderService.removeMakkahHotel(hotelId);
    this.hotelsChanged.emit();

    if (this.editingHotelId === hotelId) {
      this.resetForms();
    }
  }

  private buildSelection(): PackageHotelSelection {
    if (this.activeTab === 'specific') {
      return {
        id: this.editingHotelId || `makkah-${Date.now()}`,
        cityType: 'makkah',
        selectionMode: 'specific',
        hotelName: this.specificForm.hotelName.trim(),
        roomType: this.specificForm.roomType,
        roomsCount: this.specificForm.roomsCount,
        nightsCount: this.specificForm.nightsCount,
        notes: this.specificForm.notes
      };
    }

    return {
      id: this.editingHotelId || `makkah-${Date.now()}`,
      cityType: 'makkah',
      selectionMode: 'criteria',
      hotelName: `فندق ${this.criteriaForm.district || 'مكة'} - ${this.criteriaForm.category || 'فئة'}`,
      district: this.criteriaForm.district,
      category: this.criteriaForm.category,
      roomType: this.criteriaForm.roomType,
      roomsCount: this.criteriaForm.rooms,
      nightsCount: this.criteriaForm.nights,
      notes: this.criteriaForm.notes
    };
  }

  private getValidationMessages(): string[] {
    const messages: string[] = [];
    if (this.activeTab === 'specific') {
      if (!this.specificForm.hotelName.trim()) {
        messages.push('اسم الفندق مطلوب');
      }
      if (!this.specificForm.roomType) {
        messages.push('نوع الغرفة مطلوب');
      }
      if (this.specificForm.roomsCount <= 0) {
        messages.push('عدد الغرف يجب أن يكون أكبر من 0');
      }
      if (this.specificForm.nightsCount <= 0) {
        messages.push('عدد الليالي يجب أن يكون أكبر من 0');
      }
      return messages;
    }

    if (!this.criteriaForm.district) {
      messages.push('الحي مطلوب');
    }
    if (!this.criteriaForm.category) {
      messages.push('الفئة مطلوبة');
    }
    if (!this.criteriaForm.roomType) {
      messages.push('نوع الغرفة مطلوب');
    }
    if (this.criteriaForm.rooms <= 0) {
      messages.push('عدد الغرف يجب أن يكون أكبر من 0');
    }
    if (this.criteriaForm.nights <= 0) {
      messages.push('عدد الليالي يجب أن يكون أكبر من 0');
    }

    return messages;
  }

  private resetForms(): void {
    this.editingHotelId = null;
    this.validationMessages = [];
    this.criteriaForm = {
      district: '',
      category: '',
      roomType: '',
      rooms: 1,
      nights: 1,
      notes: ''
    };
    this.specificForm = {
      hotelName: '',
      roomType: '',
      roomsCount: 1,
      nightsCount: 1,
      notes: ''
    };
  }
}
