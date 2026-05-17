import { Injectable } from '@angular/core';
import {
  ACCOUNT_ROUTING_RULES,
  COST_CENTERS,
  FINANCE_ACCOUNTS,
  FINANCE_WALLETS,
  FINANCIAL_REPORTS,
  FISCAL_YEARS,
  JOURNAL_ENTRIES,
  OPENING_BALANCES,
} from './finance.mock';
import {
  AccountTransaction,
  CostCenter,
  FinanceAccount,
  FinanceWallet,
  FinancialReportTile,
  FiscalYear,
  IncomeStatementSection,
  JournalEntry,
  OpeningBalanceRow,
  TrialBalanceRow,
  AccountRoutingRule,
} from './finance.models';

@Injectable({ providedIn: 'root' })
export class FinanceLocalStoreService {
  private readonly accounts = FINANCE_ACCOUNTS.map((account) => ({ ...account }));
  private readonly fiscalYears = FISCAL_YEARS.map((year) => ({ ...year }));
  private readonly journalEntries = JOURNAL_ENTRIES.map((entry) => ({
    ...entry,
    lines: entry.lines.map((line) => ({ ...line })),
  }));
  private readonly openingBalances = OPENING_BALANCES.map((row) => ({ ...row }));
  private readonly costCenters = COST_CENTERS.map((center) => ({ ...center }));
  private readonly routingRules = ACCOUNT_ROUTING_RULES.map((rule) => ({ ...rule }));
  private readonly wallets = FINANCE_WALLETS.map((wallet) => ({ ...wallet }));
  private readonly reports = FINANCIAL_REPORTS.map((report) => ({ ...report }));

  getAccounts(): FinanceAccount[] {
    return this.accounts.map((account) => ({ ...account }));
  }

  getFiscalYears(): FiscalYear[] {
    return this.fiscalYears.map((year) => ({ ...year }));
  }

  getJournalEntries(): JournalEntry[] {
    return this.journalEntries.map((entry) => ({
      ...entry,
      lines: entry.lines.map((line) => ({ ...line })),
    }));
  }

  getOpeningBalances(): OpeningBalanceRow[] {
    return this.openingBalances.map((row) => ({ ...row }));
  }

  getCostCenters(): CostCenter[] {
    return this.costCenters.map((center) => ({ ...center }));
  }

  getRoutingRules(): AccountRoutingRule[] {
    return this.routingRules.map((rule) => ({ ...rule }));
  }

  getWallets(): FinanceWallet[] {
    return this.wallets.map((wallet) => ({ ...wallet }));
  }

  getReports(): FinancialReportTile[] {
    return this.reports.map((report) => ({ ...report }));
  }

  getAccountStatement(accountId: string): AccountTransaction[] {
    let runningBalance = this.openingBalances
      .filter((row) => row.accountId === accountId)
      .reduce((total, row) => total + row.debit - row.credit, 0);

    const transactions: AccountTransaction[] = [];

    for (const entry of this.journalEntries.filter((item) => item.status === 'posted')) {
      for (const line of entry.lines.filter((item) => item.accountId === accountId)) {
        runningBalance += line.debit - line.credit;
        transactions.push({
          id: `${entry.id}-${line.accountId}`,
          date: entry.date,
          reference: entry.number,
          description: entry.description,
          debit: line.debit,
          credit: line.credit,
          runningBalance,
        });
      }
    }

    return transactions;
  }

  getTrialBalance(): TrialBalanceRow[] {
    return this.accounts
      .filter((account) => account.level > 0)
      .map((account) => {
        const opening = this.openingBalances
          .filter((row) => row.accountId === account.id)
          .reduce((total, row) => total + row.debit - row.credit, 0);

        const postedLines = this.journalEntries
          .filter((entry) => entry.status === 'posted')
          .flatMap((entry) => entry.lines)
          .filter((line) => line.accountId === account.id);

        const movementDebit = postedLines.reduce((total, line) => total + line.debit, 0);
        const movementCredit = postedLines.reduce((total, line) => total + line.credit, 0);
        const closing = opening + movementDebit - movementCredit;

        return {
          accountCode: account.code,
          accountName: account.name,
          openingDebit: Math.max(opening, 0),
          openingCredit: Math.max(-opening, 0),
          movementDebit,
          movementCredit,
          closingDebit: Math.max(closing, 0),
          closingCredit: Math.max(-closing, 0),
        };
      });
  }

  getIncomeStatementSections(): IncomeStatementSection[] {
    const revenueAccounts = this.accounts.filter((account) => account.type === 'revenue' && account.level > 0);
    const expenseAccounts = this.accounts.filter((account) => account.type === 'expense' && account.level > 0);

    return [
      {
        title: 'الإيرادات',
        lines: revenueAccounts.map((account) => ({ label: account.name, amount: Math.abs(account.balance) })),
      },
      {
        title: 'المصروفات',
        lines: expenseAccounts.map((account) => ({ label: account.name, amount: Math.abs(account.balance) })),
      },
    ];
  }

  getAccountName(accountId: string): string {
    return this.accounts.find((account) => account.id === accountId)?.name ?? accountId;
  }
}
