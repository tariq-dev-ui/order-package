import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MockDataService } from 'src/app/services/mock-data.service';
import { OperationsMockService } from 'src/app/features/admin/operations/operations-mock.service';
import { DocumentationStatusSwitcherComponent } from 'src/app/features/admin/operations/components/documentation-status-switcher/documentation-status-switcher.component';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { JournalEntriesService } from 'src/app/services/journal-entries.service';
import { CostCentersService } from 'src/app/services/cost-centers.service';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { CoreService } from 'src/app/services/core.service';
import { FormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { JournalEntryDetailsDialogComponent, JournalEntryDetails } from './journal-entry-details-dialog/journal-entry-details-dialog.component';

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

interface IncomeStatement {
  id: number;
  category: string;
  item: string;
  amount: number;
  type: 'revenue' | 'expense';
}

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

interface CostCenter {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-financial-reports',
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
    DocumentationStatusSwitcherComponent,
  ],
  templateUrl: './financial-reports.component.html',
  styleUrl: './financial-reports.component.scss',
})
export class FinancialReportsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private mockDataService = inject(MockDataService);
  private snackBarService = inject(AppSnackBarService);
  private translate = inject(TranslateService);
  private chartOfAccountsService = inject(ChartOfAccountsService);
  private journalEntriesService = inject(JournalEntriesService);
  private costCentersService = inject(CostCentersService);
  private coreService = inject(CoreService);
  private operationsMock = inject(OperationsMockService);
  // reference to component to satisfy compiler usage checks
  private readonly _docSwitcher = DocumentationStatusSwitcherComponent;

  isLoading = signal(false);
  accountStatements = signal<AccountStatement[]>([]);
  incomeStatements = signal<IncomeStatement[]>([]);
  
  // Selected report type
  selectedReportType: 'account-statement' | 'income-statement' | 'trial-balance' | 'cost-centers' = 'account-statement';
  
  // Trial Balance data
  trialBalanceItems = signal<TrialBalanceItem[]>([]);
  
  // Cost Centers data
  costCenters = signal<CostCenter[]>([]);

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

  // documentation switcher state for financial window summary
  documentationFilter = signal<'pending' | 'documented'>('pending');
  docsPendingCount = computed(() => this.operationsMock ? this.operationsMock['voucherDetails']().map(d => d.Voucher).filter(v => (v.documentationStatus ?? 'pending') === 'pending').length : 0);
  docsDocumentedCount = computed(() => this.operationsMock ? this.operationsMock['voucherDetails']().map(d => d.Voucher).filter(v => v.documentationStatus === 'documented').length : 0);

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
      // Reload data for the selected account
      this.loadData();
    } else {
      this.selectedAccount.set(null);
      // Reload all data
      this.loadData();
    }
    this.onFilterChange();
  }

  loadData() {
    this.isLoading.set(true);
    
    // Load real data from journal entries service
    setTimeout(() => {
      const selectedAccount = this.selectedAccount();
      
      // Account Statement - Use real data from journal entries
      let realAccountStatements: AccountStatement[] = [];
      if (selectedAccount) {
        try {
          // Get real entries for the selected account
          const accountEntries = this.journalEntriesService.getEntriesForAccount(selectedAccount.id);
          
          // Add opening balance entry
          realAccountStatements.push({
            id: 0,
            accountName: selectedAccount.name,
            accountCode: selectedAccount.code,
            date: this.dateFrom() || new Date(2026, 0, 1),
            description: 'الرصيد الافتتاحي',
            debit: 0,
            credit: 0,
            balance: selectedAccount.openingBalance || 0,
            documentNumber: '',
            costCenter: '',
            addedBy: '',
            addedDate: undefined,
          });

          // Convert journal entries to account statements
          accountEntries.forEach((entry, index) => {
            realAccountStatements.push({
              id: index + 1,
              accountName: selectedAccount.name,
              accountCode: selectedAccount.code,
              date: entry.date,
              description: entry.description,
              debit: entry.debit,
              credit: entry.credit,
              balance: entry.balance,
              documentNumber: entry.reference || entry.entryNumber,
              costCenter: '', // Will be populated when cost centers are integrated
              addedBy: '', // Can be added to journal entry model
              addedDate: entry.date,
            });
          });
        } catch (error) {
          console.error('Error loading account entries:', error);
          // Fall back to showing just opening balance
          realAccountStatements = [{
            id: 0,
            accountName: selectedAccount.name,
            accountCode: selectedAccount.code,
            date: this.dateFrom() || new Date(2026, 0, 1),
            description: 'الرصيد الافتتاحي',
            debit: 0,
            credit: 0,
            balance: selectedAccount.openingBalance || 0,
            documentNumber: '',
            costCenter: '',
            addedBy: '',
            addedDate: undefined,
          }];
        }
      }
      
      // Income Statement - Calculate from real journal entries
      const allAccounts = this.chartOfAccountsService.getAllAccounts();
      const revenueAccounts = allAccounts.filter(acc => acc.type === 'revenue' && !acc.isParent);
      const expenseAccounts = allAccounts.filter(acc => acc.type === 'expense' && !acc.isParent);
      
      const realIncomeStatements: IncomeStatement[] = [];
      
      // Add revenue entries
      revenueAccounts.forEach((account, index) => {
        try {
          const balance = this.journalEntriesService.getAccountBalance(account.id);
          if (balance.totalCredit > 0 || balance.totalDebit > 0) {
            realIncomeStatements.push({
              id: index + 1,
              category: 'الإيرادات',
              item: account.name,
              amount: Math.abs(balance.currentBalance),
              type: 'revenue',
            });
          }
        } catch (error) {
          console.error(`Error loading balance for account ${account.id}:`, error);
        }
      });
      
      // Add expense entries
      expenseAccounts.forEach((account, index) => {
        try {
          const balance = this.journalEntriesService.getAccountBalance(account.id);
          if (balance.totalDebit > 0 || balance.totalCredit > 0) {
            realIncomeStatements.push({
              id: revenueAccounts.length + index + 1,
              category: 'المصروفات',
              item: account.name,
              amount: Math.abs(balance.currentBalance),
              type: 'expense',
            });
          }
        } catch (error) {
          console.error(`Error loading balance for account ${account.id}:`, error);
        }
      });
      
      this.accountStatements.set(realAccountStatements);
      this.incomeStatements.set(realIncomeStatements);
      this.isLoading.set(false);
    }, 1000);
  }

  openEntryDetails(entry: AccountStatement): void {
    // Get all entries for the current account
    const allEntries = this.getFilteredAccountStatements();
    const currentIndex = allEntries.findIndex(e => e.id === entry.id);
    
    // Convert all entries to JournalEntryDetails format
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

    // Prepare current entry details data
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
    if (description.includes('مرتجع')) return 'مرتجع مبيعات';
    if (description.includes('تحويل')) return 'تحويل';
    return 'قيد يومي';
  }

  generateEntryLines(entry: AccountStatement): any[] {
    // Generate entry lines based on the account statement
    const lines: any[] = [];

    // Main account line
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

      // Add opposite entry if debit
      if (entry.debit > 0 && entry.description.includes('مبيعات')) {
        const netAmount = entry.debit / 1.15; // Assuming 15% VAT
        const taxAmount = entry.debit - netAmount;
        
        lines.push({
          id: 2,
          accountCode: '10000000202100005',
          accountName: 'عبدالعزيز حجازي',
          accountNameEn: 'Abdulaziz Hejazi',
          debit: 0,
          credit: entry.debit,
          costCenter: entry.costCenter,
          description: entry.description,
          addedBy: entry.addedBy,
          addedDate: entry.addedDate || entry.date,
          modifiedBy: entry.addedBy,
          modifiedDate: entry.addedDate
        });
        
        lines.push({
          id: 3,
          accountCode: '401',
          accountName: 'المبيعات',
          accountNameEn: 'Sales',
          debit: 0,
          credit: netAmount,
          costCenter: entry.costCenter,
          description: entry.description,
          addedBy: entry.addedBy,
          addedDate: entry.addedDate || entry.date,
          modifiedBy: entry.addedBy,
          modifiedDate: entry.addedDate
        });
        
        lines.push({
          id: 4,
          accountCode: '20221',
          accountName: 'ضريبة المبيعات',
          accountNameEn: 'Sales Tax',
          debit: 0,
          credit: taxAmount,
          costCenter: entry.costCenter,
          description: entry.description,
          addedBy: entry.addedBy,
          addedDate: entry.addedDate || entry.date,
          modifiedBy: entry.addedBy,
          modifiedDate: entry.addedDate
        });
      }
    }

    return lines;
  }

  generateAccountData(account: Account): AccountStatement[] {
    // Generate sample data for the selected account
    const data: AccountStatement[] = [
      {
        id: 1,
        accountName: account.name,
        accountCode: account.code,
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
    ];

    // Add sample transactions
    const sampleTransactions = [
      { date: '2026-01-10', desc: 'إيداع نقدي', debit: 5000, credit: 0, doc: 'DEP-001', center: 'الاستقبال' },
      { date: '2026-01-12', desc: 'سحب نقدي', debit: 0, credit: 2000, doc: 'WTH-001', center: 'المالية' },
      { date: '2026-01-15', desc: 'تحويل بنكي', debit: 10000, credit: 0, doc: 'TRF-001', center: 'المالية' },
    ];

    let runningBalance = 0;
    sampleTransactions.forEach((trans, index) => {
      runningBalance = runningBalance + trans.debit - trans.credit;
      data.push({
        id: index + 2,
        accountName: account.name,
        accountCode: account.code,
        date: new Date(trans.date),
        description: trans.desc,
        debit: trans.debit,
        credit: trans.credit,
        balance: runningBalance,
        documentNumber: trans.doc,
        costCenter: trans.center,
        addedBy: 'Admin@INT',
        addedDate: new Date(trans.date),
      });
    });

    return data;
  }


  exportReport() {
    // TODO: Implement export functionality
    this.snackBarService.showSuccessSnackBar('سيتم تصدير التقرير');
  }

  switchReportType(type: 'account-statement' | 'income-statement' | 'trial-balance' | 'cost-centers') {
    this.selectedReportType = type;
    
    // Load data based on report type
    if (type === 'trial-balance') {
      this.loadTrialBalanceData();
    } else if (type === 'cost-centers') {
      this.loadCostCentersData();
    }
    
    this.onFilterChange();
  }
  
  /**
   * Load Trial Balance Data
   */
  loadTrialBalanceData() {
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
  
  /**
   * Load Cost Centers Data
   */
  loadCostCentersData() {
    this.isLoading.set(true);
    
    setTimeout(() => {
      const allCostCenters = this.costCentersService.getAllCostCenters();
      this.costCenters.set(allCostCenters);
      this.isLoading.set(false);
    }, 500);
  }
  
  /**
   * Get Filtered Trial Balance Items
   */
  getFilteredTrialBalanceItems(): TrialBalanceItem[] {
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
  
  /**
   * Get Trial Balance Totals
   */
  getTotalOpeningDebit(): number {
    return this.getFilteredTrialBalanceItems().reduce((sum, item) => sum + item.openingBalanceDebit, 0);
  }

  getTotalOpeningCredit(): number {
    return this.getFilteredTrialBalanceItems().reduce((sum, item) => sum + item.openingBalanceCredit, 0);
  }

  getTotalDebit(): number {
    return this.getFilteredTrialBalanceItems().reduce((sum, item) => sum + item.totalDebit, 0);
  }

  getTotalCredit(): number {
    return this.getFilteredTrialBalanceItems().reduce((sum, item) => sum + item.totalCredit, 0);
  }

  getTotalClosingDebit(): number {
    return this.getFilteredTrialBalanceItems().reduce((sum, item) => sum + item.closingBalanceDebit, 0);
  }

  getTotalClosingCredit(): number {
    return this.getFilteredTrialBalanceItems().reduce((sum, item) => sum + item.closingBalanceCredit, 0);
  }
  
  /**
   * Get Filtered Cost Centers
   */
  getFilteredCostCenters(): CostCenter[] {
    const centers = this.costCenters();
    const searchQuery = this.tableSearchQuery().toLowerCase();

    return centers.filter(center => {
      // Table search filter
      if (searchQuery) {
        const matchesCode = center.code.toLowerCase().includes(searchQuery);
        const matchesNameAr = center.nameAr.toLowerCase().includes(searchQuery);
        const matchesNameEn = center.nameEn.toLowerCase().includes(searchQuery);
        const matchesDescription = (center.description || '').toLowerCase().includes(searchQuery);
        return matchesCode || matchesNameAr || matchesNameEn || matchesDescription;
      }

      return true;
    });
  }

  getFilteredAccountStatements(): AccountStatement[] {
    const items = this.accountStatements();
    const selectedAccount = this.selectedAccount();
    const fromDate = this.dateFrom();
    const toDate = this.dateTo();
    const searchQuery = this.tableSearchQuery().toLowerCase();
    
    return items.filter(item => {
      // Account filter
      if (selectedAccount) {
        if (item.accountCode !== selectedAccount.code) return false;
      }
      
      // Date filters
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
      
      // Table search filter
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

  getFilteredIncomeStatements(): IncomeStatement[] {
    const items = this.incomeStatements();
    const searchQuery = this.tableSearchQuery().toLowerCase();
    
    return items.filter(item => {
      // Table search filter
      if (searchQuery) {
        const matchesCategory = item.category.toLowerCase().includes(searchQuery);
        const matchesItem = item.item.toLowerCase().includes(searchQuery);
        if (!matchesCategory && !matchesItem) return false;
      }
      
      return true;
    });
  }

  onFilterChange() {
    // Filtering is handled by getFilteredAccountStatements() and getFilteredIncomeStatements()
  }


  searchReports() {
    this.onFilterChange();
  }

  onTableSearchChange() {
    // Search is handled by getFilteredAccountStatements() and getFilteredIncomeStatements()
  }

  clearTableSearch() {
    this.tableSearchQuery.set('');
    this.onTableSearchChange();
  }

  exportToPDF() {
    // TODO: Implement PDF export
    this.snackBarService.showSuccessSnackBar('سيتم تصدير التقرير إلى PDF');
  }

  exportToExcel() {
    // TODO: Implement Excel export
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

  getTotalRevenue(): number {
    return this.incomeStatements()
      .filter(item => item.type === 'revenue')
      .reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalExpenses(): number {
    return this.incomeStatements()
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
  }

  getNetIncome(): number {
    return this.getTotalRevenue() - this.getTotalExpenses();
  }
}
