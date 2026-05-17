import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CoreService } from 'src/app/services/core.service';
import { JournalEntriesService } from 'src/app/services/journal-entries.service';

export interface JournalEntryLine {
  id: number;
  accountCode: string;
  accountName: string;
  accountNameEn?: string;
  debit: number;
  credit: number;
  costCenter?: string;
  description: string;
  addedBy?: string;
  addedDate?: Date;
  modifiedBy?: string;
  modifiedDate?: Date;
}

export interface JournalEntryDetails {
  documentNumber: string;
  entryValue: number;
  entryType: string;
  entryNumber: string;
  entryTitle: string;
  entryDate: Date;
  entryStatus: string;
  addedBy?: string;
  referenceNumber?: string;
  addedDate?: Date;
  modifiedBy?: string;
  modifiedDate?: Date;
  lines: JournalEntryLine[];
  attachments?: any[];
}

@Component({
  selector: 'app-journal-entry-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
    ReactiveFormsModule
  ],
  templateUrl: './journal-entry-details-dialog.component.html',
  styleUrl: './journal-entry-details-dialog.component.scss'
})
export class JournalEntryDetailsDialogComponent {
  private dialogRef = inject(MatDialogRef<JournalEntryDetailsDialogComponent>);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private coreService = inject(CoreService);
  private journalService = inject(JournalEntriesService);
  
  data = inject<{ entry: JournalEntryDetails; entries?: JournalEntryDetails[]; currentIndex?: number }>(MAT_DIALOG_DATA);
  entry = signal<JournalEntryDetails>(this.data.entry);
  allEntries = signal<JournalEntryDetails[]>(this.data.entries || []);
  currentIndex = signal<number>(this.data.currentIndex || 0);

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  // Attachment form
  showAttachmentForm = signal(false);
  attachmentForm!: FormGroup;
  selectedFiles = signal<File[]>([]);

  get titleControl(): FormControl {
    return this.attachmentForm.get('title') as FormControl;
  }

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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }

  formatDateTime(date: Date | undefined): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(date);
  }

  getTotalDebit(): number {
    return this.entry().lines.reduce((sum, line) => sum + line.debit, 0);
  }

  getTotalCredit(): number {
    return this.entry().lines.reduce((sum, line) => sum + line.credit, 0);
  }

  toggleAttachmentForm(): void {
    this.showAttachmentForm.set(!this.showAttachmentForm());
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.selectedFiles.set([...this.selectedFiles(), ...files]);
    }
  }

  removeFile(index: number): void {
    const files = this.selectedFiles();
    files.splice(index, 1);
    this.selectedFiles.set([...files]);
  }

  uploadAttachment(): void {
    if (this.attachmentForm.valid && this.selectedFiles().length > 0) {
      // TODO: Implement upload logic
      console.log('Uploading attachments:', this.selectedFiles());
      this.attachmentForm.reset();
      this.selectedFiles.set([]);
      this.showAttachmentForm.set(false);
    }
  }

  copyEntry(): void {
    // Open create journal entry page with current entry data
    this.duplicateEntry();
  }

  duplicateEntry(): void {
    // Prepare entry data before closing dialog
    const entry = this.entry();
    const queryParams: any = {
      duplicate: 'true',
      date: entry.entryDate.toISOString(),
      description: entry.entryTitle,
      reference: entry.documentNumber || entry.entryNumber
    };

    // Convert entry lines to query params format
    const linesData = entry.lines.map((line, index) => ({
      accountCode: line.accountCode,
      accountName: line.accountName,
      debit: line.debit,
      credit: line.credit,
      costCenter: line.costCenter || '',
      description: line.description || ''
    }));

    // Store lines data in sessionStorage for the create page to read
    sessionStorage.setItem('duplicateEntryLines', JSON.stringify(linesData));

    // Close the dialog first
    this.dialogRef.close();

    // Navigate after a short delay to ensure dialog is closed
    setTimeout(() => {
      this.router.navigate(['/pages/journal-entries/create'], { queryParams }).catch(err => {
        console.error('Navigation error:', err);
      });
    }, 100);
  }

  editEntry(): void {
    const entry = this.entry();
    
    // Try to find the entry by entryNumber to get its ID
    const allEntries = this.journalService.getAllEntries();
    const foundEntry = allEntries.find(e => e.entryNumber === entry.entryNumber);
    
    if (foundEntry) {
      // Close current dialog
      this.dialogRef.close();
      
      // Navigate to edit page with entry ID
      setTimeout(() => {
        this.router.navigate(['/pages/journal-entries', foundEntry.id], { 
          queryParams: { edit: 'true' } 
        }).catch(err => {
          console.error('Navigation error:', err);
        });
      }, 100);
    } else {
      // If entry not found, show error or use entryNumber as fallback
      console.warn('Entry not found in journal entries, using entryNumber as ID');
      this.dialogRef.close();
      
      setTimeout(() => {
        this.router.navigate(['/pages/journal-entries', entry.entryNumber], { 
          queryParams: { edit: 'true' } 
        }).catch(err => {
          console.error('Navigation error:', err);
        });
      }, 100);
    }
  }

  printEntry(): void {
    const printContent = document.querySelector('.journal-entry-details-dialog');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the HTML content
    const htmlContent = printContent.innerHTML;
    
    // Create a complete HTML document for printing
    const printDocument = `
      <!DOCTYPE html>
      <html dir="${this.dir()}">
        <head>
          <meta charset="UTF-8">
          <title>تفاصيل القيد - ${this.entry().documentNumber || this.entry().entryNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Noto Kufi Arabic', 'Roboto', sans-serif;
              padding: 20px;
              color: #2a3524;
              background: #fff;
            }
            .dialog-header {
              border-bottom: 3px solid #3a472a;
              padding: 20px 0;
              margin-bottom: 30px;
            }
            .dialog-title {
              font-size: 24px;
              font-weight: 700;
              color: #3a472a;
            }
            .section-title {
              font-size: 18px;
              font-weight: 700;
              color: #3a472a;
              margin: 30px 0 15px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #3a472a;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0;
              border: 1px solid #c6ccb8;
              border-radius: 4px;
              overflow: hidden;
            }
            .info-item {
              display: flex;
              justify-content: space-between;
              padding: 12px 16px;
              border-bottom: 1px solid #c6ccb8;
              border-inline-end: 1px solid #c6ccb8;
            }
            .info-item:nth-child(even) {
              border-inline-end: none;
            }
            .info-item:nth-last-child(-n+2) {
              border-bottom: none;
            }
            .info-label {
              font-weight: 700;
              font-size: 12px;
              text-transform: uppercase;
              color: #6b7280;
            }
            .info-value {
              font-weight: 600;
              color: #2a3524;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            .details-table th,
            .details-table td {
              padding: 10px;
              border: 1px solid #c6ccb8;
              text-align: right;
            }
            .details-table th {
              background: #f8f9f7;
              font-weight: 700;
              font-size: 12px;
              text-transform: uppercase;
            }
            .details-table .text-end {
              text-align: left;
              font-family: 'Courier New', monospace;
            }
            .total-row {
              background: #f8f9f7;
              font-weight: 700;
            }
            @media print {
              body {
                padding: 0;
              }
              .section-actions,
              .dialog-actions,
              .attachments-section {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    printWindow.document.write(printDocument);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  hasPrevious(): boolean {
    return this.currentIndex() > 0;
  }

  hasNext(): boolean {
    return this.currentIndex() < this.allEntries().length - 1;
  }

  previousEntry(): void {
    if (this.hasPrevious()) {
      const newIndex = this.currentIndex() - 1;
      this.currentIndex.set(newIndex);
      this.entry.set(this.allEntries()[newIndex]);
    }
  }

  nextEntry(): void {
    if (this.hasNext()) {
      const newIndex = this.currentIndex() + 1;
      this.currentIndex.set(newIndex);
      this.entry.set(this.allEntries()[newIndex]);
    }
  }
}
