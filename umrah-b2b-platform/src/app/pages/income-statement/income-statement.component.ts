/**
 * Income Statement Component
 * مكون قائمة الدخل
 */

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

interface IncomeStatementItem {
  id: string;
  accountCode: string;
  accountName: string;
  accountNameEn: string;
  amount: number;
  type: 'revenue' | 'expense';
  category: 'operating' | 'non-operating' | 'admin' | 'other';
  parentId?: string;
  parentName?: string;
  level: number;
}

@Component({
  selector: 'app-income-statement',
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
  templateUrl: './income-statement.component.html',
  styleUrl: './income-statement.component.scss',
})
export class IncomeStatementComponent implements OnInit {
  private snackBarService = inject(AppSnackBarService);
  private translate = inject(TranslateService);
  private chartOfAccountsService = inject(ChartOfAccountsService);
  private journalEntriesService = inject(JournalEntriesService);
  private coreService = inject(CoreService);

  isLoading = signal(false);
  incomeStatementItems = signal<IncomeStatementItem[]>([]);

  // Selected account filter
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
      // Get revenue and expense accounts (including parent accounts for grouping)
      const accounts = allAccounts.filter(acc => 
        acc.isActive && 
        (acc.type === 'revenue' || acc.type === 'expense')
      );
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
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    setTimeout(() => {
      // Calculate from real journal entries (posted entries only)
      const allAccounts = this.chartOfAccountsService.getAllAccounts();
      
      // Get all revenue and expense accounts (leaf accounts only)
      let revenueAccounts = allAccounts.filter(acc => acc.type === 'revenue' && !acc.isParent && acc.isActive);
      let expenseAccounts = allAccounts.filter(acc => acc.type === 'expense' && !acc.isParent && acc.isActive);
      
      // Filter by selected account or parent if any
      const selectedAccount = this.selectedAccount();
      if (selectedAccount) {
        if (selectedAccount.isParent) {
          // If parent account is selected, show all children
          const childIds = this.chartOfAccountsService.getChildAccounts(selectedAccount.id)
            .map(acc => acc.id);
          
          if (selectedAccount.type === 'revenue') {
            revenueAccounts = revenueAccounts.filter(acc => 
              acc.id === selectedAccount.id || childIds.includes(acc.id)
            );
            expenseAccounts = [];
          } else if (selectedAccount.type === 'expense') {
            expenseAccounts = expenseAccounts.filter(acc => 
              acc.id === selectedAccount.id || childIds.includes(acc.id)
            );
            revenueAccounts = [];
          }
        } else {
          // Leaf account selected
          if (selectedAccount.type === 'revenue') {
            revenueAccounts = revenueAccounts.filter(acc => acc.id === selectedAccount.id);
            expenseAccounts = [];
          } else if (selectedAccount.type === 'expense') {
            expenseAccounts = expenseAccounts.filter(acc => acc.id === selectedAccount.id);
            revenueAccounts = [];
          }
        }
      }

      const items: IncomeStatementItem[] = [];

      // Process revenue accounts
      revenueAccounts.forEach((account) => {
        try {
          const balance = this.journalEntriesService.getAccountBalance(account.id);
          
          // Only show accounts with activity in the period
          if (balance.totalCredit > 0 || balance.totalDebit > 0) {
            // Determine category based on account code/name
            let category: 'operating' | 'non-operating' = 'operating';
            
            // Non-operating revenue indicators
            if (account.name.includes('أخرى') || 
                account.name.includes('استثمار') || 
                account.name.includes('فوائد') ||
                account.nameEn.toLowerCase().includes('other') ||
                account.nameEn.toLowerCase().includes('investment') ||
                account.nameEn.toLowerCase().includes('interest')) {
              category = 'non-operating';
            }

            items.push({
              id: account.id,
              accountCode: account.code,
              accountName: account.name,
              accountNameEn: account.nameEn,
              amount: Math.abs(balance.currentBalance),
              type: 'revenue',
              category: category,
              parentId: account.parentId,
              level: account.level,
            });
          }
        } catch (error) {
          console.error(`Error loading balance for account ${account.id}:`, error);
        }
      });

      // Process expense accounts
      expenseAccounts.forEach((account) => {
        try {
          const balance = this.journalEntriesService.getAccountBalance(account.id);
          
          // Only show accounts with activity in the period
          if (balance.totalDebit > 0 || balance.totalCredit > 0) {
            // Determine category based on account code/name
            let category: 'operating' | 'non-operating' | 'admin' | 'other' = 'operating';
            
            // Admin expenses indicators
            if (account.name.includes('إدارية') || 
                account.name.includes('عمومية') ||
                account.nameEn.toLowerCase().includes('admin') ||
                account.nameEn.toLowerCase().includes('general')) {
              category = 'admin';
            }
            // Other/non-operating expenses
            else if (account.name.includes('أخرى') || 
                     account.name.includes('مالية') ||
                     account.name.includes('فوائد') ||
                     account.nameEn.toLowerCase().includes('other') ||
                     account.nameEn.toLowerCase().includes('financial') ||
                     account.nameEn.toLowerCase().includes('interest')) {
              category = 'other';
            }

            items.push({
              id: account.id,
              accountCode: account.code,
              accountName: account.name,
              accountNameEn: account.nameEn,
              amount: Math.abs(balance.currentBalance),
              type: 'expense',
              category: category,
              parentId: account.parentId,
              level: account.level,
            });
          }
        } catch (error) {
          console.error(`Error loading balance for account ${account.id}:`, error);
        }
      });

      this.incomeStatementItems.set(items);
      this.isLoading.set(false);
    }, 1000);
  }

  getFilteredItems(): IncomeStatementItem[] {
    const items = this.incomeStatementItems();
    const searchQuery = this.tableSearchQuery().toLowerCase();

    return items.filter(item => {
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

  // Get revenue items by category
  getOperatingRevenue(): IncomeStatementItem[] {
    return this.getFilteredItems().filter(item => item.type === 'revenue' && item.category === 'operating');
  }

  getNonOperatingRevenue(): IncomeStatementItem[] {
    return this.getFilteredItems().filter(item => item.type === 'revenue' && item.category === 'non-operating');
  }

  getTotalOperatingRevenue(): number {
    return this.getOperatingRevenue().reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalNonOperatingRevenue(): number {
    return this.getNonOperatingRevenue().reduce((sum, item) => sum + item.amount, 0);
  }

  // Get expense items by category
  getOperatingExpenses(): IncomeStatementItem[] {
    return this.getFilteredItems().filter(item => item.type === 'expense' && item.category === 'operating');
  }

  getAdminExpenses(): IncomeStatementItem[] {
    return this.getFilteredItems().filter(item => item.type === 'expense' && item.category === 'admin');
  }

  getOtherExpenses(): IncomeStatementItem[] {
    return this.getFilteredItems().filter(item => item.type === 'expense' && item.category === 'other');
  }

  getTotalOperatingExpenses(): number {
    return this.getOperatingExpenses().reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalAdminExpenses(): number {
    return this.getAdminExpenses().reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalOtherExpenses(): number {
    return this.getOtherExpenses().reduce((sum, item) => sum + item.amount, 0);
  }

  // Calculate operating income
  getOperatingIncome(): number {
    return this.getTotalOperatingRevenue() - this.getTotalOperatingExpenses();
  }

  // Calculate income before tax (EBIT)
  getIncomeBeforeTax(): number {
    return this.getTotalRevenue() - this.getTotalExpenses();
  }

  getTotalRevenue(): number {
    return this.getFilteredItems()
      .filter(item => item.type === 'revenue')
      .reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalExpenses(): number {
    return this.getFilteredItems()
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
  }

  getNetIncome(): number {
    return this.getTotalRevenue() - this.getTotalExpenses();
  }

  // Expose Math for use in template
  Math = Math;

  onFilterChange() {
    this.loadData();
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}
