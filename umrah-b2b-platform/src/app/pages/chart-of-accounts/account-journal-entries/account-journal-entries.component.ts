/**
 * Account Journal Entries Component
 * مكون إدخالات اليومية للحساب
 */

import { Component, Input, OnInit, AfterViewInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { 
  JournalEntriesService 
} from 'src/app/services/journal-entries.service';
import { 
  Account 
} from 'src/app/models/chart-of-accounts.model';
import { 
  AccountJournalEntry,
  AccountBalance 
} from 'src/app/models/journal-entry.model';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-account-journal-entries',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent
  ],
  templateUrl: './account-journal-entries.component.html',
  styleUrl: './account-journal-entries.component.scss'
})
export class AccountJournalEntriesComponent implements OnInit, AfterViewInit {
  @Input() account!: Account;
  @Input() accountBalance: AccountBalance | null = null;

  private journalService = inject(JournalEntriesService);
  private coreService = inject(CoreService);

  // Data
  entries = signal<AccountJournalEntry[]>([]);
  dataSource = new MatTableDataSource<AccountJournalEntry>([]);
  
  // Pagination
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  pageSize = signal(10);
  pageIndex = signal(0);
  totalEntries = signal(0);

  // Filtering
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  searchQuery = signal('');

  // Display
  displayedColumns: string[] = ['date', 'entryNumber', 'description', 'debit', 'credit', 'balance', 'reference'];

  // Options
  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit(): void {
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
    try {
      let entries = this.journalService.getEntriesForAccount(this.account.id);

      // Apply date filter
      const dateFrom = this.dateFrom();
      const dateTo = this.dateTo();
      if (dateFrom) {
        entries = entries.filter(e => {
          const entryDate = new Date(e.date);
          entryDate.setHours(0, 0, 0, 0);
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          return entryDate >= fromDate;
        });
      }
      if (dateTo) {
        entries = entries.filter(e => {
          const entryDate = new Date(e.date);
          entryDate.setHours(23, 59, 59, 999);
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          return entryDate <= toDate;
        });
      }

      // Apply search filter
      if (this.searchQuery()) {
        const query = this.searchQuery().toLowerCase();
        entries = entries.filter(e => 
          e.description.toLowerCase().includes(query) ||
          e.descriptionEn.toLowerCase().includes(query) ||
          e.entryNumber.toLowerCase().includes(query) ||
          (e.reference && e.reference.toLowerCase().includes(query))
        );
      }

      // Sort by date descending (newest first)
      entries.sort((a, b) => b.date.getTime() - a.date.getTime());

      this.entries.set(entries);
      this.totalEntries.set(entries.length);
      this.dataSource.data = entries;
    } catch (error) {
      console.error('Error loading journal entries:', error);
      this.entries.set([]);
      this.dataSource.data = [];
    }
  }

  /**
   * Format Date
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Format Currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get Display Name
   */
  getDisplayName(): string {
    return this.dir() === 'rtl' ? this.account.name : this.account.nameEn;
  }

  /**
   * Get Description
   */
  getDescription(entry: AccountJournalEntry): string {
    return this.dir() === 'rtl' ? entry.description : entry.descriptionEn;
  }

  /**
   * On Search
   */
  onSearch(query: string): void {
    this.searchQuery.set(query);
    this.loadEntries();
  }

  /**
   * On Date Filter Change
   */
  onDateFilterChange(): void {
    this.loadEntries();
  }

  /**
   * Clear Filters
   */
  clearFilters(): void {
    this.dateFrom.set(null);
    this.dateTo.set(null);
    this.searchQuery.set('');
    this.loadEntries();
  }

  /**
   * Get Reference Type Label
   */
  getReferenceTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      'booking': 'حجز',
      'invoice': 'فاتورة',
      'payment': 'دفعة',
      'purchase': 'شراء',
      'voucher': 'سند',
      'other': 'أخرى'
    };
    return labels[type || 'other'] || 'أخرى';
  }

  /**
   * Get Reference Type Icon
   */
  getReferenceTypeIcon(type?: string): string {
    const icons: Record<string, string> = {
      'booking': 'calendar',
      'invoice': 'receipt',
      'payment': 'wallet',
      'purchase': 'shopping-cart',
      'voucher': 'file-text',
      'other': 'circle'
    };
    return icons[type || 'other'] || 'circle';
  }

  /**
   * Export to CSV
   */
  exportToCSV(): void {
    const entries = this.entries();
    const headers = ['التاريخ', 'رقم الإدخال', 'الوصف', 'مدين', 'دائن', 'الرصيد', 'المرجع'];
    const rows = entries.map(e => [
      this.formatDate(e.date),
      e.entryNumber,
      e.description,
      e.debit.toString(),
      e.credit.toString(),
      this.formatCurrency(e.balance),
      e.reference || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `journal-entries-${this.account.code}-${new Date().getTime()}.csv`;
    link.click();
  }
}
