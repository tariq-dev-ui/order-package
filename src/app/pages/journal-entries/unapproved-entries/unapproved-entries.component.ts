/**
 * Unapproved Entries Component
 * مكون القيود غير المعتمدة
 */

import { Component, OnInit, AfterViewInit, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { JournalEntriesService } from 'src/app/services/journal-entries.service';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { JournalEntry } from 'src/app/models/journal-entry.model';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { CoreService } from 'src/app/services/core.service';
import { ViewEntryDialogComponent } from '../pending-entries/view-entry-dialog/view-entry-dialog.component';
import { formatSeroCurrency } from 'src/app/shared/currency/currency-format.util';

@Component({
  selector: 'app-unapproved-entries',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
    ReactiveFormsModule
  ],
  templateUrl: './unapproved-entries.component.html',
  styleUrl: './unapproved-entries.component.scss'
})
export class UnapprovedEntriesComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private journalService = inject(JournalEntriesService);
  private chartService = inject(ChartOfAccountsService);
  private coreService = inject(CoreService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  searchForm!: FormGroup;
  dataSource = new MatTableDataSource<JournalEntry>([]);
  isLoading = signal(false);
  accounts = signal<Account[]>([]);
  selectedIds = signal<Set<string>>(new Set<string>());

  displayedColumns: string[] = [
    'select',
    'documentNumber',
    'entryType',
    'entryNumber',
    'totalAmount',
    'description',
    'date',
    'status',
    'actions'
  ];

  entryTypes = [
    { id: 'receipt', nameAr: 'سند قبض', nameEn: 'Receipt Voucher' },
    { id: 'payment', nameAr: 'سند صرف', nameEn: 'Payment Voucher' },
    { id: 'general', nameAr: 'قيد يومي', nameEn: 'General Entry' },
    { id: 'opening', nameAr: 'قيد افتتاحي', nameEn: 'Opening Entry' }
  ];

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);
  hasSelection = computed(() => this.selectedIds().size > 0);

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadAccounts();
    this.loadEntries();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Initialize Search Form
   */
  initializeForm(): void {
    const dateFrom = new Date(2026, 0, 1); // 1/1/2026
    const dateTo = new Date(2026, 11, 31); // 31/12/2026

    this.searchForm = this.fb.group({
      entryType: [''],
      accountId: [''],
      dateFrom: [dateFrom],
      dateTo: [dateTo],
      documentNumber: [''],
      description: ['']
    });
  }

  /**
   * Load Accounts
   */
  loadAccounts(): void {
    const allAccounts = this.chartService.getAllAccounts();
    const leafAccounts = allAccounts.filter(acc => !acc.isParent && acc.isActive);
    this.accounts.set(leafAccounts);
  }

  /**
   * Load Unapproved Entries
   */
  loadEntries(): void {
    this.isLoading.set(true);

    try {
      let entries = this.journalService.getAllEntries();

      // In this demo, we will treat all draft entries as "غير معتمدة"
      entries = entries.filter(e => e.status === 'draft');

      const formValue = this.searchForm.value;

      if (formValue.accountId) {
        entries = entries.filter(e =>
          e.lines.some(line => line.accountId === formValue.accountId)
        );
      }

      if (formValue.dateFrom) {
        entries = entries.filter(e => e.date >= formValue.dateFrom);
      }

      if (formValue.dateTo) {
        entries = entries.filter(e => e.date <= formValue.dateTo);
      }

      if (formValue.documentNumber) {
        const query = formValue.documentNumber.toLowerCase();
        entries = entries.filter(e =>
          e.entryNumber.toLowerCase().includes(query)
        );
      }

      if (formValue.description) {
        const query = formValue.description.toLowerCase();
        entries = entries.filter(e =>
          e.description.toLowerCase().includes(query) ||
          e.descriptionEn.toLowerCase().includes(query)
        );
      }

      // Sort by date (newest first)
      entries.sort((a, b) => b.date.getTime() - a.date.getTime());

      this.dataSource.data = entries;
      // Reset selection when data changes
      this.selectedIds.set(new Set<string>());
    } catch (error) {
      console.error('Error loading unapproved entries:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Search
   */
  onSearch(): void {
    this.loadEntries();
  }

  /**
   * Clear Filters
   */
  clearFilters(): void {
    this.initializeForm();
    this.loadEntries();
  }

  /**
   * Actions
   */
  editEntry(entry: JournalEntry): void {
    this.router.navigate(['/journal-entries', entry.id], { queryParams: { edit: 'true' } });
  }

  printEntry(entry: JournalEntry, event: Event): void {
    event.stopPropagation();
    alert(this.dir() === 'rtl'
      ? `سيتم طباعة القيد رقم: ${entry.entryNumber}`
      : `Printing entry: ${entry.entryNumber}`);
  }

  exportToExcel(): void {
    alert(
      this.dir() === 'rtl'
        ? 'سيتم تصدير القيود غير المعتمدة إلى ملف Excel (تنفيذ تجريبي).'
        : 'Unapproved entries will be exported to Excel (demo only).'
    );
  }

  exportToPDF(): void {
    alert(
      this.dir() === 'rtl'
        ? 'سيتم تصدير القيود غير المعتمدة إلى ملف PDF (تنفيذ تجريبي).'
        : 'Unapproved entries will be exported to PDF (demo only).'
    );
  }

  approveSelected(): void {
    if (!this.hasSelection()) {
      return;
    }
    const count = this.selectedIds().size;
    alert(
      this.dir() === 'rtl'
        ? `سيتم اعتماد ${count} من القيود المحددة (تنفيذ تجريبي).`
        : `Will approve ${count} selected entries (demo only).`
    );
    // TODO: هنا يمكن لاحقاً استدعاء خدمة لاعتماد القيود فعلياً
  }

  /**
   * Selection Helpers
   */
  isRowSelected(entry: JournalEntry): boolean {
    return this.selectedIds().has(entry.id);
  }

  toggleRow(entry: JournalEntry, checked: boolean): void {
    const set = new Set(this.selectedIds());
    if (checked) {
      set.add(entry.id);
    } else {
      set.delete(entry.id);
    }
    this.selectedIds.set(set);
  }

  isAllSelected(): boolean {
    const data = this.dataSource.data;
    if (!data.length) return false;
    return data.every(e => this.selectedIds().has(e.id));
  }

  isSomeSelected(): boolean {
    const size = this.selectedIds().size;
    return size > 0 && !this.isAllSelected();
  }

  toggleAll(checked: boolean): void {
    if (checked) {
      const allIds = new Set(this.dataSource.data.map(e => e.id));
      this.selectedIds.set(allIds);
    } else {
      this.selectedIds.set(new Set<string>());
    }
  }

  /**
   * Open View Dialog
   */
  viewEntry(entry: JournalEntry): void {
    this.dialog.open(ViewEntryDialogComponent, {
      width: '95%',
      maxWidth: '1200px',
      data: { entry }
    });
  }

  /**
   * Back to Journal Entries
   */
  goBack(): void {
    this.router.navigate(['/journal-entries']);
  }

  getDescription(entry: JournalEntry): string {
    return this.dir() === 'rtl' ? entry.description : entry.descriptionEn;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  }

  formatCurrency(amount: number): string {
    return formatSeroCurrency(amount);
  }

  getEntryTypeName(entry: JournalEntry): string {
    // Demo: infer type based on first line
    const firstLine = entry.lines[0];
    if (!firstLine) return '';

    const accountId = firstLine.accountId;
    if (accountId === '1111' && firstLine.debit > 0) {
      return this.dir() === 'rtl' ? 'سند قبض' : 'Receipt Voucher';
    }
    if (accountId === '1111' && firstLine.credit > 0) {
      return this.dir() === 'rtl' ? 'سند صرف' : 'Payment Voucher';
    }
    return this.dir() === 'rtl' ? 'قيد يومي' : 'General Entry';
  }

  getStatusLabel(): string {
    return this.dir() === 'rtl' ? 'غير معتمد' : 'Unapproved';
  }
}

