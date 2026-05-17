/**
 * Journal Entry Model
 * نموذج إدخالات اليومية
 */

import { Account } from './chart-of-accounts.model';

/**
 * Journal Entry Line
 * بند إدخال اليومية
 */
export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  accountNameEn: string;
  debit: number;
  credit: number;
  description?: string;
  descriptionEn?: string;
  reference?: string; // رقم مرجعي (مثل رقم فاتورة، رقم حجز)
  referenceType?: 'booking' | 'invoice' | 'payment' | 'purchase' | 'voucher' | 'other';
  costCenterId?: string; // معرف مركز التكلفة
  costCenterCode?: string; // كود مركز التكلفة
  costCenterName?: string; // اسم مركز التكلفة
}

/**
 * Journal Entry
 * إدخال اليومية
 */
export interface JournalEntry {
  id: string;
  entryNumber: string; // رقم إدخال اليومية
  date: Date;
  description: string;
  descriptionEn: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean; // هل الإدخال متوازن (مجموع المدين = مجموع الدائن)
  status: 'draft' | 'posted' | 'reversed';
  createdBy?: string;
  createdAt: Date;
  postedBy?: string;
  postedAt?: Date;
  reversedBy?: string;
  reversedAt?: Date;
  reversalEntryId?: string; // معرف إدخال الإلغاء
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Account Balance
 * رصيد الحساب
 */
export interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountNameEn: string;
  openingBalance: number;
  totalDebit: number;
  totalCredit: number;
  currentBalance: number;
  normalBalance: 'debit' | 'credit';
}

/**
 * Account Journal Entry (for display in table)
 * إدخال اليومية للحساب (للعرض في الجدول)
 */
export interface AccountJournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  description: string;
  descriptionEn: string;
  debit: number;
  credit: number;
  balance: number; // Running balance
  reference?: string;
  referenceType?: string;
}
