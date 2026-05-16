/**
 * Chart of Accounts Service
 * خدمة الشجرة المحاسبية
 *
 * Provides helper functions and utilities for working with the chart of accounts.
 * يدمج الحسابات الثابتة مع الحسابات الآجلة للجهات (المُنشأة من توجيه الحسابات).
 */

import { Injectable, inject } from '@angular/core';
import { ChartOfAccounts, Account, AccountType, AccountNature } from '../models/chart-of-accounts.model';
import { AgentDeferredAccountsService } from './agent-deferred-accounts.service';

@Injectable({
  providedIn: 'root',
})
export class ChartOfAccountsService {
  private agentDeferred = inject(AgentDeferredAccountsService);

  /**
   * Get All Accounts (ثابتة + حسابات الجهات الآجلة)
   */
  getAllAccounts(): Account[] {
    const staticAccounts = ChartOfAccounts.getAccounts();
    const dynamicAccounts = this.agentDeferred.getAccounts();
    return [...staticAccounts, ...dynamicAccounts];
  }

  /**
   * Get Accounts by Type
   */
  getAccountsByType(type: AccountType): Account[] {
    return this.getAllAccounts().filter((account) => account.type === type);
  }

  /**
   * Get Account by ID (ثابت أو آجل للجهات)
   */
  getAccountById(id: string): Account | undefined {
    return ChartOfAccounts.getAccountById(id) ?? this.agentDeferred.getAccountById(id);
  }

  /**
   * Get Account by Code
   */
  getAccountByCode(code: string): Account | undefined {
    return ChartOfAccounts.getAccountByCode(code) ?? this.agentDeferred.getAccountByCode(code);
  }

  /**
   * Get Parent Accounts
   */
  getParentAccounts(): Account[] {
    return ChartOfAccounts.getParentAccounts();
  }

  /**
   * Get Child Accounts (ثابتة + آجلة للجهات تحت نفس الأب)
   */
  getChildAccounts(parentId: string): Account[] {
    const staticChildren = ChartOfAccounts.getChildAccounts(parentId);
    const dynamicChildren = this.agentDeferred.getChildAccounts(parentId);
    return [...staticChildren, ...dynamicChildren];
  }

  /**
   * Get Account Tree
   * الحصول على هيكل الشجرة
   */
  getAccountTree(): Account[] {
    return ChartOfAccounts.getAccountTree();
  }

  /**
   * Get Accounts for Select/Dropdown (ثابتة + آجلة للجهات)
   */
  getAccountsForSelect(includeInactive: boolean = false): Array<{ value: string; label: string; labelEn: string }> {
    const staticList = ChartOfAccounts.getAccountsForSelect(includeInactive);
    const dynamicList = this.agentDeferred
      .getAccounts()
      .filter((a) => includeInactive || a.isActive)
      .map((a) => ({ value: a.id, label: a.name, labelEn: a.nameEn }));
    return [...staticList, ...dynamicList];
  }

  /**
   * Get Accounts by Type for Select
   * الحصول على حسابات نوع معين للقوائم المنسدلة
   */
  getAccountsByTypeForSelect(type: AccountType, includeInactive: boolean = false): Array<{ value: string; label: string; labelEn: string }> {
    return this.getAccountsByType(type)
      .filter(account => includeInactive || account.isActive)
      .filter(account => !account.isParent) // Only leaf accounts
      .map(account => ({
        value: account.id,
        label: account.name,
        labelEn: account.nameEn
      }));
  }

  /**
   * Calculate Total Balance for Account Type
   * حساب إجمالي الرصيد لنوع معين من الحسابات
   */
  calculateTotalBalanceByType(type: AccountType): number {
    return this.getAccountsByType(type)
      .filter(account => !account.isParent) // Only leaf accounts
      .reduce((total, account) => total + account.balance, 0);
  }

  /**
   * Calculate Total Balance for Parent Account
   * حساب إجمالي الرصيد لحساب أب معين
   */
  calculateTotalBalanceForParent(parentId: string): number {
    const children = this.getChildAccounts(parentId);
    return children
      .filter(account => !account.isParent) // Only leaf accounts
      .reduce((total, account) => total + account.balance, 0);
  }

  /**
   * Get Account Full Path
   * الحصول على المسار الكامل للحساب
   */
  getAccountFullPath(accountId: string): string {
    const account = this.getAccountById(accountId);
    if (!account) return '';

    const path: string[] = [account.name];
    let currentAccount = account;

    while (currentAccount.parentId) {
      const parent = this.getAccountById(currentAccount.parentId);
      if (parent) {
        path.unshift(parent.name);
        currentAccount = parent;
      } else {
        break;
      }
    }

    return path.join(' > ');
  }

  /**
   * Get Account Full Path (English)
   * الحصول على المسار الكامل للحساب بالإنجليزية
   */
  getAccountFullPathEn(accountId: string): string {
    const account = this.getAccountById(accountId);
    if (!account) return '';

    const path: string[] = [account.nameEn];
    let currentAccount = account;

    while (currentAccount.parentId) {
      const parent = this.getAccountById(currentAccount.parentId);
      if (parent) {
        path.unshift(parent.nameEn);
        currentAccount = parent;
      } else {
        break;
      }
    }

    return path.join(' > ');
  }

  /**
   * Search Accounts
   * البحث في الحسابات
   */
  searchAccounts(query: string, language: 'ar' | 'en' = 'ar'): Account[] {
    const accounts = this.getAllAccounts();
    const lowerQuery = query.toLowerCase();

    return accounts.filter(account => {
      const searchText = language === 'ar' ? account.name : account.nameEn;
      const searchCode = account.code.toLowerCase();
      return searchText.toLowerCase().includes(lowerQuery) || 
             searchCode.includes(lowerQuery);
    });
  }

  /**
   * Validate Account Code
   * التحقق من صحة كود الحساب
   */
  validateAccountCode(code: string): { valid: boolean; message?: string } {
    if (!code || code.trim() === '') {
      return { valid: false, message: 'كود الحساب مطلوب' };
    }

    // Check if code already exists
    const existingAccount = this.getAccountByCode(code);
    if (existingAccount) {
      return { valid: false, message: 'كود الحساب موجود بالفعل' };
    }

    // Validate format (should be numeric or alphanumeric)
    const codePattern = /^[0-9]+(-[0-9]+)*$/;
    if (!codePattern.test(code)) {
      return { valid: false, message: 'كود الحساب يجب أن يكون أرقام فقط' };
    }

    return { valid: true };
  }

  /**
   * Get Accounts by Level
   * الحصول على الحسابات حسب المستوى
   */
  getAccountsByLevel(level: number): Account[] {
    return this.getAllAccounts().filter(account => account.level === level);
  }

  /**
   * Get Leaf Accounts (Accounts without children)
   * الحصول على الحسابات الورقية (الحسابات بدون أبناء)
   */
  getLeafAccounts(): Account[] {
    return this.getAllAccounts().filter(account => !account.isParent);
  }

  /**
   * Check if Account is Debit Account
   * التحقق من أن الحساب حساب مدين
   */
  isDebitAccount(accountId: string): boolean {
    const account = this.getAccountById(accountId);
    return account?.nature === AccountNature.DEBIT;
  }

  /**
   * Check if Account is Credit Account
   * التحقق من أن الحساب حساب دائن
   */
  isCreditAccount(accountId: string): boolean {
    const account = this.getAccountById(accountId);
    return account?.nature === AccountNature.CREDIT;
  }

  /**
   * Get Account Balance with Sign
   * الحصول على رصيد الحساب مع الإشارة
   */
  getAccountBalanceWithSign(accountId: string): number {
    const account = this.getAccountById(accountId);
    if (!account) return 0;

    // For debit accounts, positive balance is normal
    // For credit accounts, positive balance is normal
    // But we need to consider the nature
    if (account.nature === AccountNature.DEBIT) {
      return account.balance;
    } else {
      return account.balance;
    }
  }

  /**
   * Get Summary by Account Type
   * الحصول على ملخص حسب نوع الحساب
   */
  getSummaryByAccountType(): Array<{
    type: AccountType;
    typeName: string;
    typeNameEn: string;
    count: number;
    totalBalance: number;
  }> {
    const types = [
      { type: AccountType.ASSET, name: 'الأصول', nameEn: 'Assets' },
      { type: AccountType.LIABILITY, name: 'الخصوم', nameEn: 'Liabilities' },
      { type: AccountType.EQUITY, name: 'حقوق الملكية', nameEn: 'Equity' },
      { type: AccountType.REVENUE, name: 'الإيرادات', nameEn: 'Revenue' },
      { type: AccountType.EXPENSE, name: 'المصروفات', nameEn: 'Expenses' }
    ];

    return types.map(({ type, name, nameEn }) => {
      const accounts = this.getAccountsByType(type);
      const leafAccounts = accounts.filter(acc => !acc.isParent);
      const totalBalance = leafAccounts.reduce((sum, acc) => sum + acc.balance, 0);

      return {
        type,
        typeName: name,
        typeNameEn: nameEn,
        count: leafAccounts.length,
        totalBalance
      };
    });
  }

  /**
   * Get Account Hierarchy
   * الحصول على التسلسل الهرمي للحساب
   */
  getAccountHierarchy(accountId: string): Account[] {
    const hierarchy: Account[] = [];
    let currentAccount = this.getAccountById(accountId);

    while (currentAccount) {
      hierarchy.unshift(currentAccount);
      if (currentAccount.parentId) {
        currentAccount = this.getAccountById(currentAccount.parentId);
      } else {
        break;
      }
    }

    return hierarchy;
  }

  /**
   * Check if Account Can Have Transactions
   * التحقق من إمكانية إجراء معاملات على الحساب
   */
  canAccountHaveTransactions(accountId: string): boolean {
    const account = this.getAccountById(accountId);
    if (!account) return false;

    // Only leaf accounts (non-parent accounts) can have transactions
    return !account.isParent && account.isActive;
  }

  /**
   * Get Active Accounts Only
   * الحصول على الحسابات النشطة فقط
   */
  getActiveAccounts(): Account[] {
    return this.getAllAccounts().filter(account => account.isActive);
  }

  /**
   * Get System Accounts
   * الحصول على الحسابات النظامية
   */
  getSystemAccounts(): Account[] {
    return this.getAllAccounts().filter(account => account.isSystemAccount);
  }

  /**
   * Get Manual Entry Allowed Accounts
   * الحصول على الحسابات التي تسمح بالإدخال اليدوي
   */
  getManualEntryAllowedAccounts(): Account[] {
    return this.getAllAccounts().filter(account => account.allowManualEntry && account.isActive);
  }
}
