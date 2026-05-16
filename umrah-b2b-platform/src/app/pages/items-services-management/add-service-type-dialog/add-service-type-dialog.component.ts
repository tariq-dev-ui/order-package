import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ServiceTypeInfo {
  value: string;
  label: string;
  labelEn: string;
}

@Component({
  selector: 'app-add-service-type-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    TablerIconComponent,
  ],
  templateUrl: './add-service-type-dialog.component.html',
  styleUrl: './add-service-type-dialog.component.scss',
})
export class AddServiceTypeDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddServiceTypeDialogComponent>);
  private dialogData = inject<{ 
    existingTypes?: ServiceTypeInfo[];
    onAdd?: (type: ServiceTypeInfo) => void;
    onUpdate?: (oldType: ServiceTypeInfo, newType: ServiceTypeInfo) => void;
    onDelete?: (type: ServiceTypeInfo) => void;
    onUpdateTypes?: (types: ServiceTypeInfo[]) => void;
  }>(MAT_DIALOG_DATA);

  serviceTypeForm: FormGroup;
  editingType: ServiceTypeInfo | null = null;
  existingTypesList = signal<ServiceTypeInfo[]>(this.dialogData?.existingTypes || []);

  constructor() {
    this.serviceTypeForm = this.fb.group({
      nameAr: ['', Validators.required],
      nameEn: ['', Validators.required],
    });
  }

  get existingTypes(): ServiceTypeInfo[] {
    return this.existingTypesList();
  }

  onSave(): void {
    this.serviceTypeForm.markAllAsTouched();

    if (!this.serviceTypeForm.valid) {
      return;
    }

    const newTypeValue = this.serviceTypeForm.value.nameEn.toLowerCase().replace(/\s+/g, '-');
    const newType: ServiceTypeInfo = {
      value: newTypeValue,
      label: this.serviceTypeForm.value.nameAr,
      labelEn: this.serviceTypeForm.value.nameEn,
    };

    // Add to local list
    this.existingTypesList.update(types => [...types, newType]);

    // Notify parent component
    if (this.dialogData?.onAdd) {
      this.dialogData.onAdd(newType);
    }

    // Reset form for next entry
    this.serviceTypeForm.reset();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  editType(type: ServiceTypeInfo): void {
    this.editingType = type;
    this.serviceTypeForm.patchValue({
      nameAr: type.label,
      nameEn: type.labelEn,
    });
  }

  deleteType(type: ServiceTypeInfo): void {
    if (confirm(`هل أنت متأكد من حذف "${type.label}"?`)) {
      // Remove from local list
      this.existingTypesList.update(types => types.filter(t => t.value !== type.value));

      // Notify parent component
      if (this.dialogData?.onDelete) {
        this.dialogData.onDelete(type);
      }

      // Reset form if editing this type
      if (this.editingType?.value === type.value) {
        this.cancelEdit();
      }
    }
  }

  cancelEdit(): void {
    this.editingType = null;
    this.serviceTypeForm.reset();
  }

  onUpdate(): void {
    if (!this.editingType) return;

    this.serviceTypeForm.markAllAsTouched();

    if (!this.serviceTypeForm.valid) {
      return;
    }

    const newTypeValue = this.serviceTypeForm.value.nameEn.toLowerCase().replace(/\s+/g, '-');
    const newType: ServiceTypeInfo = {
      value: newTypeValue,
      label: this.serviceTypeForm.value.nameAr,
      labelEn: this.serviceTypeForm.value.nameEn,
    };

    // Update local list
    this.existingTypesList.update(types => 
      types.map(t => 
        t.value === this.editingType!.value ? newType : t
      )
    );

    // Notify parent component
    if (this.dialogData?.onUpdate) {
      this.dialogData.onUpdate(this.editingType, newType);
    }

    // Reset editing state
    this.editingType = null;
    this.serviceTypeForm.reset();
  }
}

