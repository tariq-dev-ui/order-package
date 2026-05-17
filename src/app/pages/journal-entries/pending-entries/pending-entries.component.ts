/**
 * Pending Entries Component
 * مكون القيود المعلقة
 */

import { Component, OnInit, inject, signal, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { JournalEntriesService } from 'src/app/services/journal-entries.service';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { JournalEntry } from 'src/app/models/journal-entry.model';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { CoreService } from 'src/app/services/core.service';
import { ViewEntryDialogComponent } from './view-entry-dialog/view-entry-dialog.component';

@Component({
  selector: 'app-pending-entries',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
    ReactiveFormsModule
  ],
  templateUrl: './pending-entries.component.html',
  styleUrl: './pending-entries.component.scss'
})
export class PendingEntriesComponent implements OnInit, AfterViewInit {
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

  entryTypes = [
    { id: 'receipt', nameAr: 'سند قبض', nameEn: 'Receipt Voucher' },
    { id: 'payment', nameAr: 'سند صرف', nameEn: 'Payment Voucher' },
    { id: 'general', nameAr: 'قيد عام', nameEn: 'General Entry' },
    { id: 'opening', nameAr: 'قيد افتتاحي', nameEn: 'Opening Entry' }
  ];

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

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
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

    this.searchForm = this.fb.group({
      entryType: [''],
      accountId: [''],
      dateFrom: [firstDayOfYear],
      dateTo: [lastDayOfYear],
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
   * Load Entries
   */
  loadEntries(): void {
    this.isLoading.set(true);
    
    try {
      let entries = this.journalService.getAllEntries();

      // Filter by status (draft = pending)
      entries = entries.filter(e => e.status === 'draft');

      // Apply search filters
      const formValue = this.searchForm.value;

      if (formValue.entryType) {
        // TODO: Filter by entry type when we add this field to JournalEntry model
      }

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
    } catch (error) {
      console.error('Error loading entries:', error);
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
    this.searchForm.reset({
      entryType: '',
      accountId: '',
      dateFrom: new Date(new Date().getFullYear(), 0, 1),
      dateTo: new Date(new Date().getFullYear(), 11, 31),
      documentNumber: '',
      description: ''
    });
    this.loadEntries();
  }

  /**
   * View Entry
   */
  viewEntry(entry: JournalEntry): void {
    this.dialog.open(ViewEntryDialogComponent, {
      width: '95%',
      maxWidth: '1200px',
      data: { entry }
    });
  }

  /**
   * Edit Entry
   */
  editEntry(entry: JournalEntry): void {
    this.router.navigate(['/journal-entries', entry.id], { queryParams: { edit: 'true' } });
  }

  /**
   * Print Entry
   */
  printEntry(entry: JournalEntry, event: Event): void {
    event.stopPropagation();
    // TODO: Implement print functionality
    console.log('Print entry:', entry.entryNumber);
    alert(this.dir() === 'rtl' 
      ? 'سيتم إضافة وظيفة الطباعة قريباً'
      : 'Print functionality will be added soon');
  }

  /**
   * Back to Journal Entries
   */
  goBack(): void {
    this.router.navigate(['/journal-entries']);
  }

  /**
   * Get Account Name
   */
  getAccountName(accountId: string): string {
    const account = this.accounts().find(acc => acc.id === accountId);
    if (!account) return '';
    return this.dir() === 'rtl' ? account.name : account.nameEn;
  }

  /**
   * Get Description
   */
  getDescription(entry: JournalEntry): string {
    return this.dir() === 'rtl' ? entry.description : entry.descriptionEn;
  }

  /**
   * Format Date
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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
   * Get Entry Type Name
   */
  getEntryTypeName(type: string): string {
    const entryType = this.entryTypes.find(t => t.id === type);
    if (!entryType) return type;
    return this.dir() === 'rtl' ? entryType.nameAr : entryType.nameEn;
  }
}
