/**
 * Journal Entries Component
 * مكون القيود (إدخالات اليومية)
 */

import { Component, OnInit, inject, signal, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JournalEntriesService } from 'src/app/services/journal-entries.service';
import { JournalEntry } from 'src/app/models/journal-entry.model';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { CoreService } from 'src/app/services/core.service';
import { formatSeroCurrency } from 'src/app/shared/currency/currency-format.util';

@Component({
  selector: 'app-journal-entries',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
    FormsModule
  ],
  templateUrl: './journal-entries.component.html',
  styleUrl: './journal-entries.component.scss'
})
export class JournalEntriesComponent implements OnInit, AfterViewInit {
  private journalService = inject(JournalEntriesService);
  private coreService = inject(CoreService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private chartService = inject(ChartOfAccountsService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<JournalEntry>([]);
  isLoading = signal(false);
  accounts = signal<Account[]>([]);
  
  // Filters
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  entryTypeFilter = signal<string>('');
  accountIdFilter = signal<string>('');
  documentNumberFilter = signal<string>('');
  descriptionFilter = signal<string>('');
  statusFilter = signal<'all' | 'draft' | 'posted' | 'reversed'>('all');
  showUnbalanced = signal(false);
  showUnposted = signal(false);

  displayedColumns: string[] = [
    'documentNumber',
    'entryType',
    'entryNumber',
    'totalAmount',
    'description',
    'date',
    'status',
    'actions'
  ];

  pageSize = signal(10);
  pageIndex = signal(0);
  totalEntries = signal(0);

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit(): void {
    // Default period: 1/1/2026 - 31/12/2026 as requested
    this.dateFrom.set(new Date(2026, 0, 1));
    this.dateTo.set(new Date(2026, 11, 31));

    // Load accounts for account filter
    const allAccounts = this.chartService.getAllAccounts();
    this.accounts.set(allAccounts.filter(acc => !acc.isParent && acc.isActive));

    this.loadEntries();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Load Journal Entries
   */
  loadEntries(): void {
    this.isLoading.set(true);
    try {
      let entries = this.journalService.getAllEntries();

      // Apply status filter
      if (this.statusFilter() !== 'all') {
        entries = entries.filter(e => e.status === this.statusFilter());
      }

      // Apply unbalanced filter
      if (this.showUnbalanced()) {
        entries = entries.filter(e => !e.isBalanced);
      }

      // Apply unposted filter
      if (this.showUnposted()) {
        entries = entries.filter(e => e.status === 'draft');
      }

      // Apply date filter
      if (this.dateFrom()) {
        entries = entries.filter(e => e.date >= this.dateFrom()!);
      }
      if (this.dateTo()) {
        entries = entries.filter(e => e.date <= this.dateTo()!);
      }

      // Filter by account
      if (this.accountIdFilter()) {
        const accountId = this.accountIdFilter();
        entries = entries.filter(e =>
          e.lines.some(l => l.accountId === accountId)
        );
      }

      // Filter by document number (entry number)
      if (this.documentNumberFilter()) {
        const query = this.documentNumberFilter().toLowerCase();
        entries = entries.filter(e =>
          e.entryNumber.toLowerCase().includes(query)
        );
      }

      // Filter by description
      if (this.descriptionFilter()) {
        const q = this.descriptionFilter().toLowerCase();
        entries = entries.filter(e =>
          e.description.toLowerCase().includes(q) ||
          e.descriptionEn.toLowerCase().includes(q)
        );
      }

      // Sort by date (newest first)
      entries.sort((a, b) => b.date.getTime() - a.date.getTime());

      this.dataSource.data = entries;
      this.totalEntries.set(entries.length);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Create New Journal Entry
   */
  createEntry(): void {
    this.router.navigate(['/journal-entries/create']);
  }

  /**
   * Create Tax Expense Entry
   * إنشاء قيد مصروف ضريبي
   */
  createTaxExpenseEntry(): void {
    this.router.navigate(['/journal-entries-tax-expense']);
  }

  /**
   * Import Entries
   */
  importEntries(): void {
    this.router.navigate(['/journal-entries-import']);
  }

  /**
   * View Entry Details
   */
  viewEntry(entry: JournalEntry): void {
    this.router.navigate(['/journal-entries', entry.id], { queryParams: { view: 'true' } });
  }

  /**
   * Edit Entry
   */
  editEntry(entry: JournalEntry): void {
    if (entry.status === 'posted') {
      // Cannot edit posted entries
      return;
    }
    
    this.router.navigate(['/journal-entries', entry.id], { queryParams: { edit: 'true' } });
  }

  /**
   * Print Entry (placeholder)
   */
  printEntry(entry: JournalEntry, event: Event): void {
    event.stopPropagation();
    const msg = this.dir() === 'rtl'
      ? `سيتم طباعة القيد رقم: ${entry.entryNumber}`
      : `Printing entry: ${entry.entryNumber}`;
    alert(msg);
  }

  exportToExcel(): void {
    const msg = this.dir() === 'rtl'
      ? 'سيتم تصدير جميع القيود إلى ملف Excel (تجريبي).'
      : 'Exporting all entries to Excel (demo).';
    alert(msg);
  }

  exportToPDF(): void {
    const msg = this.dir() === 'rtl'
      ? 'سيتم تصدير جميع القيود إلى ملف PDF (تجريبي).'
      : 'Exporting all entries to PDF (demo).';
    alert(msg);
  }

  /**
   * Delete Entry
   */
  deleteEntry(entry: JournalEntry): void {
    if (entry.status === 'posted') {
      // Cannot delete posted entries
      return;
    }
    
    if (confirm(this.dir() === 'rtl' 
      ? `هل أنت متأكد من حذف القيد ${entry.entryNumber}؟`
      : `Are you sure you want to delete entry ${entry.entryNumber}?`)) {
      // TODO: Implement delete in service
      this.loadEntries();
    }
  }

  /**
   * Post Entry
   */
  postEntry(entry: JournalEntry): void {
    if (entry.status === 'draft' && entry.isBalanced) {
      // TODO: Implement post in service
      this.loadEntries();
    }
  }

  /**
   * Reverse Entry
   */
  reverseEntry(entry: JournalEntry): void {
    if (entry.status === 'posted' && !entry.reversalEntryId) {
      if (confirm(this.dir() === 'rtl'
        ? `هل أنت متأكد من عكس القيد ${entry.entryNumber}؟`
        : `Are you sure you want to reverse entry ${entry.entryNumber}?`)) {
        // TODO: Implement reverse in service
        this.loadEntries();
      }
    }
  }

  /**
   * Filter Handlers
   */
  onDateFilterChange(): void {
    this.loadEntries();
  }

  onSearch(): void {
    this.loadEntries();
  }

  onStatusFilterChange(): void {
    this.loadEntries();
  }

  /**
   * Entry type label (heuristic)
   */
  getEntryTypeName(entry: JournalEntry): string {
    const firstLine = entry.lines[0];
    if (!firstLine) return '';

    const accountId = firstLine.accountId;
    if (accountId === '1111' && firstLine.debit > 0) {
      return this.dir() === 'rtl' ? 'مبيعات' : 'Sales';
    }
    if (accountId === '1111' && firstLine.credit > 0) {
      return this.dir() === 'rtl' ? 'سند صرف' : 'Payment Voucher';
    }
    return this.dir() === 'rtl' ? 'قيد يومي' : 'General Entry';
  }

  clearFilters(): void {
    // Reset to default period 1/1/2026 - 31/12/2026
    this.dateFrom.set(new Date(2026, 0, 1));
    this.dateTo.set(new Date(2026, 11, 31));

    // Clear search filters
    this.entryTypeFilter.set('');
    this.accountIdFilter.set('');
    this.documentNumberFilter.set('');
    this.descriptionFilter.set('');

    this.statusFilter.set('all');
    this.showUnbalanced.set(false);
    this.showUnposted.set(false);
    this.loadEntries();
  }

  /**
   * Filter by Status
   */
  filterByStatus(status: 'all' | 'draft' | 'posted' | 'reversed'): void {
    if (status === 'draft') {
      // Navigate to pending entries page
      this.router.navigate(['/journal-entries-pending']);
      return;
    }
    
    if (this.statusFilter() === status) {
      this.statusFilter.set('all');
    } else {
      this.statusFilter.set(status);
    }
    this.showUnbalanced.set(false);
    this.showUnposted.set(false);
    this.loadEntries();
  }

  /**
   * Filter Unbalanced Entries
   */
  filterUnbalanced(): void {
    // Navigate to unapproved entries page
    this.router.navigate(['/journal-entries-unapproved']);
  }

  /**
   * Filter Unposted Entries
   */
  filterUnposted(): void {
    this.showUnposted.update(val => !val);
    if (this.showUnposted()) {
      this.statusFilter.set('all');
      this.showUnbalanced.set(false);
    }
    this.loadEntries();
  }

  /**
   * Format Helpers
   */
  getDescription(entry: JournalEntry): string {
    return this.dir() === 'rtl' ? entry.description : entry.descriptionEn;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  formatCurrency(amount: number): string {
    return formatSeroCurrency(amount);
  }

  getStatusColor(status: 'draft' | 'posted' | 'reversed'): string {
    switch (status) {
      case 'draft':
        return 'warn';
      case 'posted':
        return 'primary';
      case 'reversed':
        return 'accent';
      default:
        return '';
    }
  }

  getStatusLabel(status: 'draft' | 'posted' | 'reversed'): string {
    switch (status) {
      case 'draft':
        return this.dir() === 'rtl' ? 'مسودة' : 'Draft';
      case 'posted':
        return this.dir() === 'rtl' ? 'مرحل' : 'Posted';
      case 'reversed':
        return this.dir() === 'rtl' ? 'معكوس' : 'Reversed';
      default:
        return status;
    }
  }

  /**
   * Page Change Handler
   */
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  /**
   * Export to CSV
   */
  exportToCSV(): void {
    const headers = [
      'Entry Number',
      'Date',
      'Description',
      'Total Debit',
      'Total Credit',
      'Balanced',
      'Status',
      'Created At'
    ];
    
    const rows = this.dataSource.data.map(entry => [
      entry.entryNumber,
      this.formatDate(entry.date),
      this.getDescription(entry),
      this.formatCurrency(entry.totalDebit),
      this.formatCurrency(entry.totalCredit),
      entry.isBalanced ? 'Yes' : 'No',
      this.getStatusLabel(entry.status),
      this.formatDate(entry.createdAt)
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `journal_entries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
