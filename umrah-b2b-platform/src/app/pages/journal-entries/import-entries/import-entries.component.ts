/**
 * Import Entries Component
 * مكون استيراد القيود
 */

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-import-entries',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent
  ],
  templateUrl: './import-entries.component.html',
  styleUrl: './import-entries.component.scss'
})
export class ImportEntriesComponent {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private coreService = inject(CoreService);

  selectedCostCenter = signal<string>('');
  uploadedFile = signal<File | null>(null);
  isProcessing = signal(false);

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  costCenters = [
    { id: 'CC-001', nameAr: 'قسم الاستقبال', nameEn: 'Reception Department' },
    { id: 'CC-002', nameAr: 'قسم الحجوزات', nameEn: 'Bookings Department' },
    { id: 'CC-003', nameAr: 'قسم المطبخ', nameEn: 'Kitchen Department' },
    { id: 'CC-004', nameAr: 'قسم التنظيف', nameEn: 'Housekeeping Department' },
    { id: 'CC-005', nameAr: 'قسم الصيانة', nameEn: 'Maintenance Department' }
  ];

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  downloadTemplate(): void {
    const templateData = [
      ['رقم القيد', 'رقم الحساب', 'المدين', 'الدائن', 'البيان'],
      ['REF-001', '1111', '5000.00', '', 'استلام نقدي'],
      ['REF-001', '4111', '', '5000.00', 'إيرادات حجوزات']
    ];

    let csvContent = '\uFEFF';
    templateData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'journal_entries_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      this.snackBar.open(
        this.dir() === 'rtl' 
          ? 'الرجاء اختيار ملف Excel أو CSV صحيح'
          : 'Please select a valid Excel or CSV file',
        '',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
      return;
    }

    this.uploadedFile.set(file);
    event.target.value = '';
  }

  removeFile(): void {
    this.uploadedFile.set(null);
  }

  importFile(): void {
    if (!this.uploadedFile() || !this.selectedCostCenter()) {
      return;
    }

    this.isProcessing.set(true);

    // Mock import process
    setTimeout(() => {
      const entriesCount = Math.floor(Math.random() * 5) + 3; // 3-7 entries
      
      this.snackBar.open(
        this.dir() === 'rtl' 
          ? `تم استيراد ${entriesCount} قيد بنجاح ✓`
          : `Successfully imported ${entriesCount} entries ✓`,
        '',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );

      this.isProcessing.set(false);
      
      setTimeout(() => {
        this.router.navigate(['/journal-entries']);
      }, 1000);
    }, 2000);
  }

  goBack(): void {
    this.router.navigate(['/journal-entries']);
  }

  getCostCenterName(centerId: string): string {
    const center = this.costCenters.find(c => c.id === centerId);
    if (!center) return '';
    return this.dir() === 'rtl' ? center.nameAr : center.nameEn;
  }
}
