/**
 * Create Journal Entry Component
 * مكون إنشاء قيد جديد
 */

import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JournalEntriesService } from 'src/app/services/journal-entries.service';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { JournalEntry, JournalEntryLine } from 'src/app/models/journal-entry.model';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { CoreService } from 'src/app/services/core.service';
import { formatSeroCurrency } from 'src/app/shared/currency/currency-format.util';

@Component({
  selector: 'app-create-journal-entry',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
    ReactiveFormsModule
  ],
  templateUrl: './create-journal-entry.component.html',
  styleUrl: './create-journal-entry.component.scss'
})
export class CreateJournalEntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private journalService = inject(JournalEntriesService);
  private chartService = inject(ChartOfAccountsService);
  private coreService = inject(CoreService);
  private translate = inject(TranslateService);

  entryForm!: FormGroup;
  accounts = signal<Account[]>([]);
  filteredAccounts = signal<Account[]>([]);
  accountSearchQuery = signal<string>('');
  isLoading = signal(false);
  isSaving = signal(false);
  entryId: string | null = null;
  viewMode = false;
  editMode = false;
  autoEntryNumber = signal<string>(''); // Auto-generated entry number

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);
  totals = signal({ totalDebit: 0, totalCredit: 0, difference: 0 });

  get linesFormArray(): FormArray {
    return this.entryForm.get('lines') as FormArray;
  }

  get dateControl(): FormControl {
    return this.entryForm.get('date') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.entryForm.get('description') as FormControl;
  }

  get descriptionEnControl(): FormControl {
    return this.entryForm.get('descriptionEn') as FormControl;
  }

  get referenceControl(): FormControl {
    return this.entryForm.get('reference') as FormControl;
  }

  get generalCostCenterControl(): FormControl {
    return this.entryForm.get('generalCostCenter') as FormControl;
  }

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit(): void {
    // Initialize form and accounts first so they are ready before loading any entry
    this.initializeForm();
    this.loadAccounts();

    // Check if this is opening balance page
    const isOpeningBalance = this.router.url.includes('/opening-balance');

    // Check query params for view/edit mode
    this.route.queryParams.subscribe(params => {
      this.viewMode = params['view'] === 'true';
      this.editMode = params['edit'] === 'true';
    });

    // Check route params to decide between new / edit / view
    this.route.params.subscribe(params => {
      this.entryId = params['id'] || null;

      if (this.entryId) {
        // Existing entry: load its data (edit/view)
        this.loadEntry();
      } else {
        // Check if this is a duplicate entry
        this.route.queryParams.subscribe(queryParams => {
          if (queryParams['duplicate'] === 'true') {
            this.loadDuplicateEntry(queryParams);
          } else {
            // New entry: generate number and add initial lines
            if (isOpeningBalance) {
              // For opening balance, set entry type in form metadata if available
              if (this.entryForm.get('entryType')) {
                this.entryForm.patchValue({ entryType: 'opening-balance' });
              }
            }
            this.generateAutoEntryNumber();
            this.addLine();
            this.addLine();
          }
        });
      }
    });

    // Subscribe to form changes to recalculate totals
    this.entryForm.valueChanges.subscribe(() => {
      this.calculateTotals();
    });

    // Initial calculation
    this.calculateTotals();
  }

  /**
   * Generate Auto Entry Number
   */
  generateAutoEntryNumber(): void {
    const today = new Date();
    const year = String(today.getFullYear()).slice(-2); // Last 2 digits (26 instead of 2026)
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Get all entries for current month/year
    const allEntries = this.journalService.getAllEntries();
    const currentMonthEntries = allEntries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate.getFullYear() === today.getFullYear() && entryDate.getMonth() === today.getMonth();
    });
    
    // Get next sequential number for this month
    const nextNumber = currentMonthEntries.length + 1;
    const formattedNumber = String(nextNumber).padStart(3, '0');
    
    // Format: YY-MM-XXX (e.g., 26-01-001)
    this.autoEntryNumber.set(`${year}-${month}-${formattedNumber}`);
  }

  /**
   * Load Entry
   */
  loadEntry(): void {
    if (!this.entryId) return;

    this.isLoading.set(true);
    try {
      const entry = this.journalService.getEntryById(this.entryId);
      if (entry) {
        this.populateForm(entry);
        this.autoEntryNumber.set(entry.entryNumber); // Use existing entry number
        if (this.viewMode) {
          this.entryForm.disable();
        }
      } else {
        console.error('Entry not found:', this.entryId);
        alert(this.dir() === 'rtl'
          ? 'لم يتم العثور على القيد'
          : 'Entry not found');
        this.router.navigate(['/journal-entries']);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      alert(this.dir() === 'rtl'
        ? 'خطأ في تحميل القيد'
        : 'Error loading entry');
      this.router.navigate(['/journal-entries']);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Load Duplicate Entry
   */
  loadDuplicateEntry(queryParams: any): void {
    try {
      // Get lines data from sessionStorage
      const linesDataStr = sessionStorage.getItem('duplicateEntryLines');
      if (!linesDataStr) {
        console.error('No duplicate entry data found');
        this.generateAutoEntryNumber();
        this.addLine();
        this.addLine();
        return;
      }

      const linesData = JSON.parse(linesDataStr);
      
      // Clear sessionStorage
      sessionStorage.removeItem('duplicateEntryLines');

      // Set form values from query params
      if (queryParams['date']) {
        this.entryForm.patchValue({
          date: new Date(queryParams['date'])
        });
      }

      if (queryParams['description']) {
        this.entryForm.patchValue({
          description: queryParams['description']
        });
      }

      if (queryParams['reference']) {
        this.entryForm.patchValue({
          reference: queryParams['reference']
        });
      }

      // Generate new entry number
      this.generateAutoEntryNumber();

      // Clear existing lines and add duplicate lines
      while (this.linesFormArray.length > 0) {
        this.linesFormArray.removeAt(0);
      }

      // Add lines from duplicate data
      linesData.forEach((lineData: any) => {
        const account = this.accounts().find(acc => acc.code === lineData.accountCode);
        if (account) {
          this.addLine({
            id: '',
            accountId: account.id,
            accountCode: account.code,
            accountName: account.name,
            accountNameEn: account.nameEn || '',
            debit: lineData.debit || 0,
            credit: lineData.credit || 0,
            description: lineData.description || '',
            descriptionEn: ''
          });
        }
      });

      // If no lines were added, add default empty lines
      if (this.linesFormArray.length === 0) {
        this.addLine();
        this.addLine();
      }
    } catch (error) {
      console.error('Error loading duplicate entry:', error);
      this.generateAutoEntryNumber();
      this.addLine();
      this.addLine();
    }
  }

  /**
   * Load Accounts
   */
  loadAccounts(): void {
    const allAccounts = this.chartService.getAllAccounts();
    const leafAccounts = allAccounts.filter(acc => !acc.isParent && acc.isActive);
    this.accounts.set(leafAccounts);
    this.filteredAccounts.set(leafAccounts);
  }

  /**
   * Initialize Form
   */
  initializeForm(): void {
    this.entryForm = this.fb.group({
      date: [new Date(), Validators.required],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      descriptionEn: ['', [Validators.maxLength(500)]],
      generalCostCenter: [''],
      reference: [''],
      lines: this.fb.array([], [Validators.required, this.minLinesValidator(2)])
    });
  }

  // Cost Center for Excel Upload (separate from main form)
  excelCostCenter = signal<string>('');
  costCenterSearchQuery = signal<string>('');
  showCostCenterDropdown = signal<boolean>(false);
  uploadedFile = signal<{ name: string; size: number; linesCount: number } | null>(null);
  
  costCenters = [
    { id: 'CC-001', nameAr: 'قسم الاستقبال', nameEn: 'Reception Department' },
    { id: 'CC-002', nameAr: 'قسم الحجوزات', nameEn: 'Bookings Department' },
    { id: 'CC-003', nameAr: 'قسم المطبخ', nameEn: 'Kitchen Department' },
    { id: 'CC-004', nameAr: 'قسم التنظيف', nameEn: 'Housekeeping Department' },
    { id: 'CC-005', nameAr: 'قسم الصيانة', nameEn: 'Maintenance Department' },
    { id: 'CC-006', nameAr: 'قسم المبيعات', nameEn: 'Sales Department' },
    { id: 'CC-007', nameAr: 'قسم المحاسبة', nameEn: 'Accounting Department' },
    { id: 'CC-008', nameAr: 'قسم الموارد البشرية', nameEn: 'HR Department' }
  ];

  filteredCostCenters = computed(() => {
    const query = this.costCenterSearchQuery().toLowerCase();
    if (!query) return this.costCenters;
    
    return this.costCenters.filter(center => 
      center.nameAr.toLowerCase().includes(query) ||
      center.nameEn.toLowerCase().includes(query) ||
      center.id.toLowerCase().includes(query)
    );
  });

  /**
   * Populate Form with Entry Data
   */
  populateForm(entry: JournalEntry): void {
    this.entryForm.patchValue({
      date: entry.date,
      description: entry.description,
      descriptionEn: entry.descriptionEn
    });

    // Clear existing lines
    while (this.linesFormArray.length !== 0) {
      this.linesFormArray.removeAt(0);
    }

    // Add entry lines
    entry.lines.forEach(line => {
      this.addLine(line);
    });
  }

  /**
   * Add Line
   */
  addLine(line?: JournalEntryLine): void {
    const lineGroup = this.fb.group({
      accountId: [line?.accountId || '', Validators.required],
      debit: [line?.debit || 0, [Validators.required, Validators.min(0)]],
      credit: [line?.credit || 0, [Validators.required, Validators.min(0)]],
      description: [line?.description || ''],
      descriptionEn: [line?.descriptionEn || ''],
      reference: [line?.reference || ''],
      referenceType: [line?.referenceType || 'other']
    });

    lineGroup.addValidators(this.debitOrCreditValidator());
    this.linesFormArray.push(lineGroup);
  }

  /**
   * Remove Line
   */
  removeLine(index: number): void {
    if (this.linesFormArray.length > 2) {
      this.linesFormArray.removeAt(index);
      this.calculateTotals();
    }
  }

  /**
   * Filter Accounts
   */
  filterAccounts(query: string): void {
    this.accountSearchQuery.set(query);
    
    if (!query || query.trim() === '') {
      this.filteredAccounts.set(this.accounts());
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = this.accounts().filter(acc =>
      acc.code.toLowerCase().includes(lowerQuery) ||
      acc.name.toLowerCase().includes(lowerQuery) ||
      acc.nameEn.toLowerCase().includes(lowerQuery)
    );
    this.filteredAccounts.set(filtered);
  }

  /**
   * Get Account Display Name
   */
  getAccountDisplayName(accountId: string): string {
    const account = this.accounts().find(acc => acc.id === accountId);
    if (!account) return '';
    return this.dir() === 'rtl' ? account.name : account.nameEn;
  }

  /**
   * Get FormControl from FormGroup
   */
  getLineControl(line: AbstractControl, controlName: string): FormControl {
    return (line as FormGroup).get(controlName) as FormControl;
  }

  /**
   * Calculate Totals
   */
  calculateTotals(): void {
    const lines = this.linesFormArray.value;
    const totalDebit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.credit) || 0), 0);
    const difference = totalDebit - totalCredit;
    
    this.totals.set({ totalDebit, totalCredit, difference });
  }

  /**
   * Get Totals
   */
  getTotals(): { totalDebit: number; totalCredit: number; difference: number } {
    return this.totals();
  }

  /**
   * Is Form Balanced
   */
  isBalanced(): boolean {
    const { difference } = this.totals();
    return Math.abs(difference) < 0.01;
  }

  /**
   * Get Absolute Difference
   */
  getAbsoluteDifference(): number {
    return Math.abs(this.totals().difference);
  }

  /**
   * Save Entry
   */
  saveEntry(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    if (!this.isBalanced()) {
      alert(this.dir() === 'rtl' 
        ? 'القيد غير متوازن. يجب أن يكون مجموع المدين مساوياً لمجموع الدائن.'
        : 'Entry is not balanced. Total debit must equal total credit.');
      return;
    }

    this.isSaving.set(true);

    try {
      const formValue = this.entryForm.value;
      const lines: JournalEntryLine[] = formValue.lines.map((line: any, index: number) => {
        const account = this.accounts().find(acc => acc.id === line.accountId);
        if (!account) {
          throw new Error(`Account not found for line ${index + 1}`);
        }

        return {
          id: `jel-${Date.now()}-${index}`,
          accountId: line.accountId,
          accountCode: account.code,
          accountName: account.name,
          accountNameEn: account.nameEn,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
          description: line.description || '',
          descriptionEn: line.descriptionEn || '',
          reference: line.reference || '',
          referenceType: line.referenceType || 'other'
        };
      });

      const entryData = {
        date: formValue.date,
        description: formValue.description,
        descriptionEn: formValue.descriptionEn || formValue.description,
        lines,
        status: 'draft' as const,
        createdBy: 'current-user' // TODO: Get from auth service
      };

      if (this.editMode && this.entryId) {
        // TODO: Implement update
        // this.journalService.updateEntry(this.entryId, entryData);
      } else {
        this.journalService.createEntry(entryData);
      }

      // Show success notification
      this.snackBar.open(
        this.dir() === 'rtl' 
          ? 'تم إضافة القيد بنجاح ✓'
          : 'Entry added successfully ✓',
        '',
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        }
      );

      // Navigate after short delay to show the notification
      setTimeout(() => {
        this.router.navigate(['/journal-entries']);
      }, 500);
    } catch (error: any) {
      console.error('Error saving entry:', error);
      this.snackBar.open(
        this.dir() === 'rtl' 
          ? `خطأ في حفظ القيد: ${error.message}`
          : `Error saving entry: ${error.message}`,
        '',
        {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        }
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  /**
   * Reset Form
   */
  resetForm(): void {
    // Reset form
    this.entryForm.reset({
      date: new Date(),
      description: '',
      descriptionEn: '',
      generalCostCenter: '',
      reference: ''
    });

    // Clear lines array
    while (this.linesFormArray.length !== 0) {
      this.linesFormArray.removeAt(0);
    }

    // Add initial two lines
    this.addLine();
    this.addLine();

    // Generate new entry number
    this.generateAutoEntryNumber();

    // Recalculate totals
    this.calculateTotals();
  }

  /**
   * Cancel
   */
  cancel(): void {
    this.router.navigate(['/journal-entries']);
  }

  /**
   * Validators
   */
  minLinesValidator(min: number) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const lines = control as FormArray;
      return lines.length >= min ? null : { minLines: { value: lines.length, min } };
    };
  }

  debitOrCreditValidator() {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const debit = control.get('debit')?.value || 0;
      const credit = control.get('credit')?.value || 0;
      
      if (debit > 0 && credit > 0) {
        return { bothDebitCredit: true };
      }
      
      if (debit === 0 && credit === 0) {
        return { noDebitCredit: true };
      }
      
      return null;
    };
  }

  /**
   * Get Cost Center Name
   */
  getCostCenterName(centerId: string): string {
    if (!centerId) return '';
    const center = this.costCenters.find(c => c.id === centerId);
    if (!center) return '';
    return this.dir() === 'rtl' ? center.nameAr : center.nameEn;
  }

  /**
   * On General Cost Center Change
   */
  onGeneralCostCenterChange(centerId: string): void {
    this.costCenterSearchQuery.set('');
  }


  /**
   * Toggle Cost Center Dropdown
   */
  toggleCostCenterDropdown(): void {
    this.showCostCenterDropdown.update(v => !v);
    if (this.showCostCenterDropdown()) {
      this.costCenterSearchQuery.set('');
      // Focus search input after dropdown opens
      setTimeout(() => {
        const searchInput = document.querySelector('.cost-center-dropdown .search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  /**
   * Select Cost Center
   */
  selectCostCenter(centerId: string): void {
    this.excelCostCenter.set(centerId);
    this.showCostCenterDropdown.set(false);
    this.costCenterSearchQuery.set('');
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.cost-center-selector');
    
    if (!clickedInside && this.showCostCenterDropdown()) {
      this.showCostCenterDropdown.set(false);
    }
  }

  /**
   * Format Currency
   */
  formatCurrency(amount: number): string {
    return formatSeroCurrency(amount);
  }

  /**
   * Download Excel Template
   */
  downloadTemplate(): void {
    // Create template data
    const templateData = [
      ['الحساب', 'المدين', 'الدائن', 'الوصف', 'المرجع'],
      ['1111', '1000.00', '', 'وصف البند 1', 'REF-001'],
      ['4111', '', '1000.00', 'وصف البند 2', 'REF-002']
    ];

    // Convert to CSV
    let csvContent = '\uFEFF'; // BOM for UTF-8
    templateData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'journal_entry_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Handle File Selection
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      alert(this.dir() === 'rtl' 
        ? 'الرجاء اختيار ملف Excel أو CSV صحيح (.xlsx، .xls، أو .csv)'
        : 'Please select a valid Excel or CSV file (.xlsx, .xls, or .csv)');
      return;
    }

    // Check if cost center is selected
    if (!this.excelCostCenter()) {
      alert(this.dir() === 'rtl' 
        ? 'الرجاء اختيار مركز التكلفة أولاً'
        : 'Please select a cost center first');
      return;
    }

    // Mock data parsing - simulating Excel file reading
    this.parseExcelFileMock(file);
    
    // Reset file input
    event.target.value = '';
  }

  /**
   * Mock Excel File Parsing
   * محاكاة قراءة ملف Excel وإضافة البنود
   */
  parseExcelFileMock(file: File): void {
    // Clear existing lines
    while (this.linesFormArray.length !== 0) {
      this.linesFormArray.removeAt(0);
    }

    // Mock data - simulating Excel rows
    const mockExcelData = [
      {
        accountId: '1111', // الصندوق الرئيسي
        debit: 15000,
        credit: 0,
        description: 'استلام دفعة نقدية',
        descriptionEn: 'Cash payment received'
      },
      {
        accountId: '4111', // إيرادات إيجار الغرف
        debit: 0,
        credit: 15000,
        description: 'إيرادات حجوزات',
        descriptionEn: 'Booking revenue'
      },
      {
        accountId: '5111', // رواتب وأجور
        debit: 8000,
        credit: 0,
        description: 'رواتب موظفين',
        descriptionEn: 'Employees salaries'
      },
      {
        accountId: '1111', // الصندوق الرئيسي
        debit: 0,
        credit: 8000,
        description: 'دفع رواتب نقداً',
        descriptionEn: 'Salary payment in cash'
      }
    ];

    // Add lines from mock data
    mockExcelData.forEach(data => {
      const lineGroup = this.fb.group({
        accountId: [data.accountId, Validators.required],
        debit: [data.debit, [Validators.required, Validators.min(0)]],
        credit: [data.credit, [Validators.required, Validators.min(0)]],
        description: [data.description],
        descriptionEn: [data.descriptionEn],
        lineCostCenter: [this.excelCostCenter()],
        reference: [''],
        referenceType: ['other']
      });

      lineGroup.addValidators(this.debitOrCreditValidator());
      this.linesFormArray.push(lineGroup);
    });

    // Recalculate totals
    this.calculateTotals();

    // Store uploaded file info
    this.uploadedFile.set({
      name: file.name,
      size: file.size,
      linesCount: mockExcelData.length
    });

    // Show success message
    const message = this.dir() === 'rtl'
      ? `تم استيراد ${mockExcelData.length} بند من الملف بنجاح!`
      : `Successfully imported ${mockExcelData.length} entries!`;

    alert(message);
  }

  /**
   * Remove Uploaded File
   */
  removeUploadedFile(): void {
    if (confirm(this.dir() === 'rtl'
      ? 'هل أنت متأكد من حذف البنود المستوردة؟'
      : 'Are you sure you want to remove imported entries?')) {
      
      // Clear all lines
      while (this.linesFormArray.length !== 0) {
        this.linesFormArray.removeAt(0);
      }

      // Add initial two lines
      this.addLine();
      this.addLine();

      // Clear uploaded file info
      this.uploadedFile.set(null);

      // Recalculate totals
      this.calculateTotals();
    }
  }
}
