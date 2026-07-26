import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { CoreService } from 'src/app/services/core.service';
import { FormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { JournalEntryDetailsDialogComponent, JournalEntryDetails } from '../financial-reports/journal-entry-details-dialog/journal-entry-details-dialog.component';
import { formatSeroCurrency } from 'src/app/shared/currency/currency-format.util';

interface AccountStatement {
  id: number;
  accountName: string;
  accountCode: string;
  date: Date;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  documentNumber?: string;
  costCenter?: string;
  addedBy?: string;
  addedDate?: Date;
}

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    TablerIconComponent,
    MatTableModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './account-statement.component.html',
  styleUrl: './account-statement.component.scss',
})
export class AccountStatementComponent implements OnInit {
  private dialog = inject(MatDialog);
  private snackBarService = inject(AppSnackBarService);
  private translate = inject(TranslateService);
  private chartOfAccountsService = inject(ChartOfAccountsService);
  private coreService = inject(CoreService);

  isLoading = signal(false);
  accountStatements = signal<AccountStatement[]>([]);

  // Selected account
  selectedAccount = signal<Account | null>(null);
  selectedAccountId = signal<string>('');
  availableAccounts = signal<Account[]>([]);
  filteredAccounts = signal<Account[]>([]);
  accountSearchControl = new FormControl('');

  // Date filters
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);

  // Table search
  tableSearchQuery = signal<string>('');

  // Options
  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit() {
    // Default period: 1/1/2026 - 31/12/2026
    this.dateFrom.set(new Date(2026, 0, 1));
    this.dateTo.set(new Date(2026, 11, 31));

    this.loadAccounts();
    this.setupAccountSearch();
    this.loadData();
  }

  loadAccounts() {
    try {
      const allAccounts = this.chartOfAccountsService.getAllAccounts();
      const accounts = allAccounts.filter(acc => !acc.isParent && acc.isActive);
      this.availableAccounts.set(accounts);
      this.filteredAccounts.set(accounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
      this.availableAccounts.set([]);
      this.filteredAccounts.set([]);
    }
  }

  setupAccountSearch() {
    this.accountSearchControl.valueChanges.subscribe(searchTerm => {
      if (!searchTerm || searchTerm.trim() === '') {
        this.filteredAccounts.set(this.availableAccounts());
      } else {
        const term = searchTerm.toLowerCase().trim();
        const filtered = this.availableAccounts().filter(account => {
          const codeMatch = account.code.toLowerCase().includes(term);
          const nameMatch = account.name.toLowerCase().includes(term);
          const nameEnMatch = account.nameEn?.toLowerCase().includes(term);
          return codeMatch || nameMatch || nameEnMatch;
        });
        this.filteredAccounts.set(filtered);
      }
    });
  }

  onAccountChange(accountId: string) {
    this.selectedAccountId.set(accountId);
    if (accountId) {
      const account = this.availableAccounts().find(acc => acc.id === accountId);
      this.selectedAccount.set(account || null);
      this.loadData();
    } else {
      this.selectedAccount.set(null);
      this.loadData();
    }
    this.onFilterChange();
  }

  loadData() {
    this.isLoading.set(true);

    setTimeout(() => {
      const selectedAccount = this.selectedAccount();

      const allMockData: AccountStatement[] = [
        {
          id: 1,
          accountName: 'النقدية',
          accountCode: '101',
          date: new Date('2026-01-01'),
          description: 'الرصيد الافتتاحي',
          debit: 0,
          credit: 0,
          balance: 0,
          documentNumber: '',
          costCenter: '',
          addedBy: '',
          addedDate: undefined,
        },
        {
          id: 2,
          accountName: 'النقدية',
          accountCode: '101',
          date: new Date('2026-01-06'),
          description: 'مبيعات آجل فاتورة رقم 10-02-4-26013 للعميل يوم 06/01/2026 فرع: 02-منفذ بيع مطاعم',
          debit: 16.10,
          credit: 0,
          balance: 16.10,
          documentNumber: '2',
          costCenter: 'منفذ بيع مطاعم',
          addedBy: 'h.Alwahishi@admin',
          addedDate: new Date('2026-01-06T21:26:10'),
        },
        {
          id: 3,
          accountName: 'النقدية',
          accountCode: '101',
          date: new Date('2026-01-06'),
          description: 'مبيعات كاش يوم 06/01/2026 فرع: منفذ بيع لايت',
          debit: 2.30,
          credit: 0,
          balance: 18.40,
          documentNumber: '',
          costCenter: 'منفذ بيع لايت',
          addedBy: 'AUTO',
          addedDate: new Date('2026-01-07'),
        },
        {
          id: 4,
          accountName: 'النقدية',
          accountCode: '101',
          date: new Date('2026-01-07'),
          description: 'مبيعات كاش يوم 07/01/2026 فرع: منفذ بيع تجزئة',
          debit: 437.00,
          credit: 0,
          balance: 455.40,
          documentNumber: '',
          costCenter: 'منفذ بيع تجزئة',
          addedBy: 'AUTO',
          addedDate: new Date('2026-01-08'),
        },
        {
          id: 5,
          accountName: 'النقدية',
          accountCode: '101',
          date: new Date('2026-01-07'),
          description: 'مرتجع مبيعات كاش يوم 07/01/2026 فرع: منفذ بيع تجزئة',
          debit: 0,
          credit: 402.50,
          balance: 52.90,
          documentNumber: '',
          costCenter: 'منفذ بيع تجزئة',
          addedBy: 'AUTO',
          addedDate: new Date('2026-01-08'),
        },
        {
          id: 6,
          accountName: 'صندوق الاستقبال',
          accountCode: '1112',
          date: new Date('2026-01-01'),
          description: 'الرصيد الافتتاحي',
          debit: 0,
          credit: 0,
          balance: 0,
          documentNumber: '',
          costCenter: '',
          addedBy: '',
          addedDate: undefined,
        },
        {
          id: 7,
          accountName: 'صندوق الاستقبال',
          accountCode: '1112',
          date: new Date('2026-01-10'),
          description: 'إيداع نقدي من الحجوزات',
          debit: 5000.00,
          credit: 0,
          balance: 5000.00,
          documentNumber: 'DEP-001',
          costCenter: 'الاستقبال',
          addedBy: 'Admin@INT',
          addedDate: new Date('2026-01-10'),
        },
        {
          id: 8,
          accountName: 'البنك الأهلي - حساب جاري',
          accountCode: '1121',
          date: new Date('2026-01-01'),
          description: 'الرصيد الافتتاحي',
          debit: 0,
          credit: 0,
          balance: 0,
          documentNumber: '',
          costCenter: '',
          addedBy: '',
          addedDate: undefined,
        },
        {
          id: 9,
          accountName: 'البنك الأهلي - حساب جاري',
          accountCode: '1121',
          date: new Date('2026-01-15'),
          description: 'تحويل بنكي من صندوق الاستقبال',
          debit: 10000.00,
          credit: 0,
          balance: 10000.00,
          documentNumber: 'TRF-001',
          costCenter: 'المالية',
          addedBy: 'Admin@INT',
          addedDate: new Date('2026-01-15'),
        },
      ];

      let mockAccountStatements: AccountStatement[] = [];
      if (selectedAccount) {
        mockAccountStatements = allMockData.filter(item => item.accountCode === selectedAccount.code);
      } else {
        mockAccountStatements = [];
      }

      this.accountStatements.set(mockAccountStatements);
      this.isLoading.set(false);
    }, 1000);
  }

  openEntryDetails(entry: AccountStatement): void {
    const allEntries = this.getFilteredAccountStatements();
    const currentIndex = allEntries.findIndex(e => e.id === entry.id);

    const allEntryDetails: JournalEntryDetails[] = allEntries.map(e => ({
      documentNumber: e.documentNumber || e.id.toString(),
      entryValue: e.debit > 0 ? e.debit : e.credit,
      entryType: this.getEntryTypeFromDescription(e.description),
      entryNumber: e.id.toString(),
      entryTitle: e.description,
      entryDate: e.date,
      entryStatus: 'posted',
      addedBy: e.addedBy,
      referenceNumber: e.documentNumber,
      addedDate: e.addedDate || e.date,
      modifiedBy: e.addedBy,
      modifiedDate: e.addedDate,
      lines: this.generateEntryLines(e),
      attachments: []
    }));

    const entryDetails: JournalEntryDetails = allEntryDetails[currentIndex];

    this.dialog.open(JournalEntryDetailsDialogComponent, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        entry: entryDetails,
        entries: allEntryDetails,
        currentIndex: currentIndex
      },
      direction: this.dir(),
      panelClass: 'journal-entry-details-dialog-panel'
    });
  }

  getEntryTypeFromDescription(description: string): string {
    if (description.includes('مبيعات')) return 'مبيعات';
    if (description.includes('مشتريات')) return 'مشتريات';
    if (description.includes('تحويل')) return 'تحويل';
    if (description.includes('إيداع')) return 'إيداع';
    return 'قيد يومي';
  }

  generateEntryLines(entry: AccountStatement): any[] {
    const lines: any[] = [];

    if (entry.debit > 0 || entry.credit > 0) {
      lines.push({
        id: 1,
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        accountNameEn: entry.accountName,
        debit: entry.debit,
        credit: entry.credit,
        costCenter: entry.costCenter,
        description: entry.description,
        addedBy: entry.addedBy,
        addedDate: entry.addedDate || entry.date,
        modifiedBy: entry.addedBy,
        modifiedDate: entry.addedDate
      });
    }

    return lines;
  }

  getFilteredAccountStatements(): AccountStatement[] {
    const items = this.accountStatements();
    const selectedAccount = this.selectedAccount();
    const fromDate = this.dateFrom();
    const toDate = this.dateTo();
    const searchQuery = this.tableSearchQuery().toLowerCase();

    return items.filter(item => {
      if (selectedAccount) {
        if (item.accountCode !== selectedAccount.code) return false;
      }

      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (item.date < from) return false;
      }

      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (item.date > to) return false;
      }

      if (searchQuery) {
        const matchesCode = item.accountCode.toLowerCase().includes(searchQuery);
        const matchesName = item.accountName.toLowerCase().includes(searchQuery);
        const matchesDescription = item.description.toLowerCase().includes(searchQuery);
        const matchesDocument = (item.documentNumber || '').toLowerCase().includes(searchQuery);
        const matchesCostCenter = (item.costCenter || '').toLowerCase().includes(searchQuery);
        const matchesAddedBy = (item.addedBy || '').toLowerCase().includes(searchQuery);
        if (!matchesCode && !matchesName && !matchesDescription && !matchesDocument && !matchesCostCenter && !matchesAddedBy) return false;
      }

      return true;
    });
  }

  onFilterChange() {
    // Filtering is handled by getFilteredAccountStatements()
  }

  searchReports() {
    this.onFilterChange();
  }

  onTableSearchChange() {
    // Search is handled by getFilteredAccountStatements()
  }

  clearTableSearch() {
    this.tableSearchQuery.set('');
    this.onTableSearchChange();
  }

  exportToPDF() {
    this.snackBarService.showSuccessSnackBar('سيتم تصدير التقرير إلى PDF');
  }

  exportToExcel() {
    this.snackBarService.showSuccessSnackBar('سيتم تصدير التقرير إلى Excel');
  }

  formatCurrency(amount: number): string {
    return formatSeroCurrency(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}
