import { CommonModule } from '@angular/common';
import { Component, inject, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { formatSeroCurrency, SAUDI_RIYAL_SYMBOL } from 'src/app/shared/currency/currency-format.util';

export type ServiceType = string;

interface ServiceTypeInfo {
  value: string;
  label: string;
  labelEn: string;
}

interface Service {
  id: number;
  nameAr: string;
  nameEn: string;
  serviceType: ServiceType;
  purchasePrice: number;
  sellingPrice: number;
  isActive: boolean;
}

@Component({
  selector: 'app-add-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    TablerIconComponent,
  ],
  templateUrl: './add-service-dialog.component.html',
  styleUrl: './add-service-dialog.component.scss',
})
export class AddServiceDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddServiceDialogComponent>);
  public data = inject<{ 
    serviceType?: ServiceType; 
    serviceTypes?: ServiceTypeInfo[];
    existingServices?: Service[];
  }>(MAT_DIALOG_DATA);

  serviceForm: FormGroup;
  serviceTypes: ServiceTypeInfo[];
  existingServices = signal<Service[]>(this.data?.existingServices || []);
  readonly riyalSymbol = SAUDI_RIYAL_SYMBOL;

  // Computed: Filter services by selected type
  filteredServices = computed(() => {
    const selectedType = this.serviceForm.get('serviceType')?.value;
    if (!selectedType) return [];
    return this.existingServices().filter(s => s.serviceType === selectedType);
  });

  constructor() {
    // Use service types from data if provided, otherwise use default
    this.serviceTypes = this.data?.serviceTypes || [
      { value: 'laundry', label: 'مغسلة', labelEn: 'Laundry' },
      { value: 'cleaning', label: 'نضافة', labelEn: 'Cleaning' },
      { value: 'grocery', label: 'بقالة', labelEn: 'Grocery' },
    ];
    
    // Default service type from data or first type
    const defaultType = this.data?.serviceType || this.serviceTypes[0]?.value || 'laundry';

    this.serviceForm = this.fb.group({
      serviceType: [defaultType, Validators.required],
      nameAr: ['', Validators.required],
      nameEn: ['', Validators.required],
      purchasePrice: [0, [Validators.required, Validators.min(0.01)]],
      sellingPrice: [0, [Validators.required, Validators.min(0.01)]],
    });

    // Update filtered services when service type changes
    this.serviceForm.get('serviceType')?.valueChanges.subscribe(() => {
      // Trigger computed update
      this.filteredServices();
    });
  }

  formatPrice(price: number): string {
    return formatSeroCurrency(price);
  }

  onSave(): void {
    this.serviceForm.markAllAsTouched();

    if (!this.serviceForm.valid) {
      return;
    }

    this.dialogRef.close({
      success: true,
      data: this.serviceForm.value,
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

