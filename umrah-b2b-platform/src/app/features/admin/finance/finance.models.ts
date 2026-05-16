export type FinancePageKind =
  | 'chart'
  | 'fiscal-year'
  | 'journal-entries'
  | 'account-statement'
  | 'trial-balance'
  | 'opening-balance'
  | 'wallets'
  | 'account-routing'
  | 'income-statement'
  | 'cost-centers'
  | 'financial-reports';

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type AccountNature = 'debit' | 'credit';
export type JournalStatus = 'posted' | 'pending' | 'draft';
export type FiscalYearStatus = 'open' | 'closed' | 'planned';

export interface FinancePageMeta {
  kind: FinancePageKind;
  title: string;
  eyebrow: string;
  description: string;
  icon: string;
}

export interface FinanceAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  nature: AccountNature;
  level: number;
  parentCode?: string;
  balance: number;
  isActive: boolean;
}

export interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: FiscalYearStatus;
  entriesCount: number;
}

export interface JournalLine {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  costCenterId?: string;
}

export interface JournalEntry {
  id: string;
  number: string;
  date: string;
  description: string;
  status: JournalStatus;
  source: string;
  lines: JournalLine[];
}

export interface AccountTransaction {
  id: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit: number;
  closingCredit: number;
}

export interface OpeningBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface IncomeStatementLine {
  label: string;
  amount: number;
}

export interface IncomeStatementSection {
  title: string;
  lines: IncomeStatementLine[];
}

export interface CostCenter {
  id: string;
  code: string;
  name: string;
  owner: string;
  budget: number;
  actual: number;
  isActive: boolean;
}

export interface AccountRoutingRule {
  id: string;
  operation: string;
  description: string;
  debitAccountId: string;
  creditAccountId: string;
  isActive: boolean;
}

export interface FinanceWallet {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'payment';
  accountNumber: string;
  currency: string;
  balance: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface FinancialReportTile {
  id: string;
  title: string;
  description: string;
  icon: string;
  updatedAt: string;
}
