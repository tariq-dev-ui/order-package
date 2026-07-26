/**
 * View Entry Dialog Component
 * مكون عرض تفاصيل القيد
 */

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JournalEntry } from 'src/app/models/journal-entry.model';
import { CoreService } from 'src/app/services/core.service';
import { formatSeroCurrency } from 'src/app/shared/currency/currency-format.util';

@Component({
  selector: 'app-view-entry-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
    ReactiveFormsModule
  ],
  templateUrl: './view-entry-dialog.component.html',
  styleUrl: './view-entry-dialog.component.scss'
})
export class ViewEntryDialogComponent {
  private dialogRef = inject(MatDialogRef<ViewEntryDialogComponent>);
  private fb = inject(FormBuilder);
  private coreService = inject(CoreService);
  
  data = inject<{ entry: JournalEntry }>(MAT_DIALOG_DATA);
  entry = this.data.entry;

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  lineDisplayedColumns = ['debit', 'credit', 'account', 'costCenter', 'description', 'addedBy', 'addedDate', 'modifiedBy', 'modifiedDate'];

  // Attachment form
  showAttachmentForm = signal(false);
  attachmentForm!: FormGroup;
  selectedFiles = signal<File[]>([]);

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });

    this.attachmentForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  }

  formatCurrency(amount: number): string {
    return formatSeroCurrency(amount);
  }

  getDescription(description: string, descriptionEn: string): string {
    return this.dir() === 'rtl' ? description : descriptionEn;
  }

  getStatusLabel(): string {
    switch (this.entry.status) {
      case 'draft':
        return this.dir() === 'rtl' ? 'معلق' : 'Pending';
      case 'posted':
        return this.dir() === 'rtl' ? 'مرحل' : 'Posted';
      case 'reversed':
        return this.dir() === 'rtl' ? 'معكوس' : 'Reversed';
      default:
        return this.entry.status;
    }
  }

  getEntryTypeName(): string {
    // TODO: Get from entry metadata when we add entry type field
    return this.dir() === 'rtl' ? 'سند قبض' : 'Receipt Voucher';
  }

  addAttachment(): void {
    this.showAttachmentForm.set(true);
  }

  onFileSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const currentFiles = this.selectedFiles();
    const totalFiles = currentFiles.length + files.length;

    if (totalFiles > 5) {
      alert(this.dir() === 'rtl' 
        ? 'يمكنك اختيار 5 ملفات كحد أقصى'
        : 'You can select maximum 5 files');
      return;
    }

    this.selectedFiles.set([...currentFiles, ...files]);
    event.target.value = '';
  }

  removeFile(file: File): void {
    this.selectedFiles.update(files => files.filter(f => f !== file));
  }

  saveAttachment(): void {
    if (this.attachmentForm.valid && this.selectedFiles().length > 0) {
      // TODO: Save to backend
      console.log('Save attachment:', {
        title: this.attachmentForm.value.title,
        files: this.selectedFiles()
      });
      
      alert(this.dir() === 'rtl'
        ? `تم اختيار ${this.selectedFiles().length} ملف(ات). سيتم حفظها قريباً.`
        : `${this.selectedFiles().length} file(s) selected. Will be saved soon.`);

      // Reset form
      this.cancelAttachment();
    }
  }

  cancelAttachment(): void {
    this.showAttachmentForm.set(false);
    this.attachmentForm.reset();
    this.selectedFiles.set([]);
  }
}
