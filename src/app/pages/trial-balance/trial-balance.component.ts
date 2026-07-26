import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { JournalEntriesService } from 'src/app/services/journal-entries.service';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { CoreService } from 'src/app/services/core.service';
import { FormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { formatSeroCurrency } from 'src/app/shared/currency/currency-format.util';

interface TrialBalanceItem {
  id: string;
  accountCode: string;
  accountName: string;
  accountNameEn: string;
  openingBalanceDebit: number;
  openingBalanceCredit: number;
  totalDebit: number;
  totalCredit: number;
  closingBalanceDebit: number;
  closingBalanceCredit: number;
}

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    TablerIconComponent,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './trial-balance.component.html',
  styleUrl: './trial-balance.component.scss',
})
export class TrialBalanceComponent implements OnInit {
  private snackBarService = inject(AppSnackBarService);
  private translate = inject(TranslateService);
  private chartOfAccountsService = inject(ChartOfAccountsService);
  private coreService = inject(CoreService);
  private journalEntriesService = inject(JournalEntriesService);

  isLoading = signal(false);
  trialBalanceItems = signal<TrialBalanceItem[]>([]);

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
    } else {
      this.selectedAccount.set(null);
    }
    this.onFilterChange();
  }

  loadData() {
    this.isLoading.set(true);

    setTimeout(() => {
      try {
        const allAccounts = this.chartOfAccountsService.getAllAccounts();
        const activeAccounts = allAccounts.filter(acc => !acc.isParent && acc.isActive);

        const items: TrialBalanceItem[] = activeAccounts.map((account) => {
          // Use real data from journal entries service
          let accountBalance;
          try {
            accountBalance = this.journalEntriesService.getAccountBalance(account.id);
          } catch (error) {
            // If account has no entries, use default values
            accountBalance = {
              accountId: account.id,
              accountCode: account.code,
              accountName: account.name,
              accountNameEn: account.nameEn,
              openingBalance: account.openingBalance || 0,
              totalDebit: 0,
              totalCredit: 0,
              currentBalance: account.openingBalance || 0,
              normalBalance: account.nature
            };
          }

          // Calculate opening balance based on nature
          const openingBalance = accountBalance.openingBalance || 0;
          const openingDebit = openingBalance > 0 ? openingBalance : 0;
          const openingCredit = openingBalance < 0 ? Math.abs(openingBalance) : 0;

          // Use real transaction totals from journal entries
          const totalDebit = accountBalance.totalDebit;
          const totalCredit = accountBalance.totalCredit;

          // Calculate closing balance based on account nature
          let closingBalance = accountBalance.currentBalance;
          const closingDebit = closingBalance > 0 ? closingBalance : 0;
          const closingCredit = closingBalance < 0 ? Math.abs(closingBalance) : 0;

          return {
            id: account.id,
            accountCode: account.code,
            accountName: account.name,
            accountNameEn: account.nameEn || account.name,
            openingBalanceDebit: openingDebit,
            openingBalanceCredit: openingCredit,
            totalDebit: totalDebit,
            totalCredit: totalCredit,
            closingBalanceDebit: closingDebit,
            closingBalanceCredit: closingCredit,
          };
        });

        this.trialBalanceItems.set(items);
      } catch (error) {
        console.error('Error loading trial balance:', error);
        this.trialBalanceItems.set([]);
      }

      this.isLoading.set(false);
    }, 1000);
  }

  getFilteredItems(): TrialBalanceItem[] {
    const items = this.trialBalanceItems();
    const selectedAccount = this.selectedAccount();
    const searchQuery = this.tableSearchQuery().toLowerCase();

    return items.filter(item => {
      // Account filter
      if (selectedAccount) {
        if (item.id !== selectedAccount.id) return false;
      }

      // Table search filter
      if (searchQuery) {
        const matchesCode = item.accountCode.toLowerCase().includes(searchQuery);
        const matchesName = item.accountName.toLowerCase().includes(searchQuery);
        const matchesNameEn = item.accountNameEn.toLowerCase().includes(searchQuery);
        if (!matchesCode && !matchesName && !matchesNameEn) return false;
      }

      return true;
    });
  }

  getTotalOpeningDebit(): number {
    return this.getFilteredItems().reduce((sum, item) => sum + item.openingBalanceDebit, 0);
  }

  getTotalOpeningCredit(): number {
    return this.getFilteredItems().reduce((sum, item) => sum + item.openingBalanceCredit, 0);
  }

  getTotalDebit(): number {
    return this.getFilteredItems().reduce((sum, item) => sum + item.totalDebit, 0);
  }

  getTotalCredit(): number {
    return this.getFilteredItems().reduce((sum, item) => sum + item.totalCredit, 0);
  }

  getTotalClosingDebit(): number {
    return this.getFilteredItems().reduce((sum, item) => sum + item.closingBalanceDebit, 0);
  }

  getTotalClosingCredit(): number {
    return this.getFilteredItems().reduce((sum, item) => sum + item.closingBalanceCredit, 0);
  }

  onFilterChange() {
    // Filtering is handled by getFilteredItems()
  }

  searchReports() {
    this.onFilterChange();
  }

  onTableSearchChange() {
    // Search is handled by getFilteredItems()
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
