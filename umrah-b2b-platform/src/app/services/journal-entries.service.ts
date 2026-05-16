/**
 * Journal Entries Service
 * خدمة إدخالات اليومية
 */

import { Injectable, signal, computed } from '@angular/core';
import { 
  JournalEntry, 
  JournalEntryLine, 
  AccountJournalEntry,
  AccountBalance 
} from '../models/journal-entry.model';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { Account } from '../models/chart-of-accounts.model';

@Injectable({
  providedIn: 'root'
})
export class JournalEntriesService {
  private entries = signal<JournalEntry[]>([]);
  private nextEntryNumber = signal(1000);

  constructor(private chartService: ChartOfAccountsService) {
    // Initialize with sample data
    this.initializeSampleData();
  }

  /**
   * Get All Journal Entries
   */
  getAllEntries(): JournalEntry[] {
    return this.entries();
  }

  /**
   * Get Journal Entry by ID
   */
  getEntryById(id: string): JournalEntry | undefined {
    return this.entries().find(entry => entry.id === id);
  }

  /**
   * Get Journal Entries for Account
   */
  getEntriesForAccount(accountId: string): AccountJournalEntry[] {
    const allEntries = this.entries();
    const accountEntries: AccountJournalEntry[] = [];
    let runningBalance = 0;

    // Get account opening balance
    const account = this.chartService.getAccountById(accountId);
    if (account) {
      runningBalance = account.openingBalance;
    }

    // Process all entries and extract lines for this account
    allEntries
      .filter(entry => entry.status === 'posted')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .forEach(entry => {
        const line = entry.lines.find(l => l.accountId === accountId);
        if (line) {
          // Update running balance based on account nature
          if (account?.nature === 'debit') {
            runningBalance = runningBalance + line.debit - line.credit;
          } else {
            runningBalance = runningBalance + line.credit - line.debit;
          }

          accountEntries.push({
            id: entry.id,
            entryNumber: entry.entryNumber,
            date: entry.date,
            description: line.description || entry.description,
            descriptionEn: line.descriptionEn || entry.descriptionEn,
            debit: line.debit,
            credit: line.credit,
            balance: runningBalance,
            reference: line.reference,
            referenceType: line.referenceType
          });
        }
      });

    return accountEntries;
  }

  /**
   * Get Account Balance
   */
  getAccountBalance(accountId: string): AccountBalance {
    const account = this.chartService.getAccountById(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    const entries = this.getEntriesForAccount(accountId);
    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

    let currentBalance = account.openingBalance;
    if (account.nature === 'debit') {
      currentBalance = account.openingBalance + totalDebit - totalCredit;
    } else {
      currentBalance = account.openingBalance + totalCredit - totalDebit;
    }

    return {
      accountId: account.id,
      accountCode: account.code,
      accountName: account.name,
      accountNameEn: account.nameEn,
      openingBalance: account.openingBalance,
      totalDebit,
      totalCredit,
      currentBalance,
      normalBalance: account.nature
    };
  }

  /**
   * Create Journal Entry
   */
  createEntry(entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'totalDebit' | 'totalCredit' | 'isBalanced' | 'createdAt'>): JournalEntry {
    const totalDebit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + line.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01; // Allow small rounding differences

    if (!isBalanced) {
      throw new Error('Journal entry is not balanced. Total debit must equal total credit.');
    }

    const newEntry: JournalEntry = {
      ...entry,
      id: this.generateId(),
      entryNumber: `JE-${this.nextEntryNumber()}`,
      totalDebit,
      totalCredit,
      isBalanced,
      createdAt: new Date()
    };

    this.nextEntryNumber.update(n => n + 1);
    this.entries.update(entries => [...entries, newEntry]);

    return newEntry;
  }

  /**
   * Post Journal Entry
   */
  postEntry(entryId: string, postedBy: string): void {
    this.entries.update(entries =>
      entries.map(entry =>
        entry.id === entryId
          ? { ...entry, status: 'posted', postedBy, postedAt: new Date() }
          : entry
      )
    );
  }

  /**
   * Reverse Journal Entry
   */
  reverseEntry(entryId: string, reversedBy: string): JournalEntry {
    const originalEntry = this.getEntryById(entryId);
    if (!originalEntry) {
      throw new Error(`Entry ${entryId} not found`);
    }

    if (originalEntry.status !== 'posted') {
      throw new Error('Only posted entries can be reversed');
    }

    // Create reversal entry
    const reversalLines: JournalEntryLine[] = originalEntry.lines.map(line => ({
      ...line,
      id: this.generateId(),
      debit: line.credit, // Swap debit and credit
      credit: line.debit,
      description: `Reversal: ${line.description || ''}`,
      descriptionEn: `Reversal: ${line.descriptionEn || ''}`
    }));

    const reversalEntry = this.createEntry({
      date: new Date(),
      description: `Reversal of ${originalEntry.entryNumber}`,
      descriptionEn: `Reversal of ${originalEntry.entryNumber}`,
      lines: reversalLines,
      status: 'posted',
      createdBy: reversedBy
    });

    // Mark original entry as reversed
    this.entries.update(entries =>
      entries.map(entry =>
        entry.id === entryId
          ? { ...entry, status: 'reversed', reversedBy, reversedAt: new Date(), reversalEntryId: reversalEntry.id }
          : entry
      )
    );

    return reversalEntry;
  }

  /**
   * Initialize Sample Data
   */
  private initializeSampleData(): void {
    const sampleEntries: JournalEntry[] = [
      // Sample: Booking Revenue Entry
      {
        id: 'je-001',
        entryNumber: 'JE-1001',
        date: new Date(2024, 0, 15),
        description: 'إيرادات حجز غرفة',
        descriptionEn: 'Room Booking Revenue',
        lines: [
          {
            id: 'jel-001-1',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 5000,
            credit: 0,
            description: 'استلام نقدي من حجز',
            descriptionEn: 'Cash received from booking',
            reference: 'BK-2024-001',
            referenceType: 'booking'
          },
          {
            id: 'jel-001-2',
            accountId: '4111',
            accountCode: '4111',
            accountName: 'إيرادات إيجار الغرف',
            accountNameEn: 'Room Rental Revenue',
            debit: 0,
            credit: 5000,
            description: 'إيرادات حجز غرفة',
            descriptionEn: 'Room booking revenue',
            reference: 'BK-2024-001',
            referenceType: 'booking'
          }
        ],
        totalDebit: 5000,
        totalCredit: 5000,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2024, 0, 15),
        postedBy: 'system',
        postedAt: new Date(2024, 0, 15)
      },

      // Sample: Restaurant Revenue Entry
      {
        id: 'je-002',
        entryNumber: 'JE-1002',
        date: new Date(2024, 0, 16),
        description: 'إيرادات مطعم',
        descriptionEn: 'Restaurant Revenue',
        lines: [
          {
            id: 'jel-002-1',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 1200,
            credit: 0,
            description: 'استلام نقدي من المطعم',
            descriptionEn: 'Cash received from restaurant',
            reference: 'REST-2024-001',
            referenceType: 'other'
          },
          {
            id: 'jel-002-2',
            accountId: '4121',
            accountCode: '4121',
            accountName: 'إيرادات الإفطار',
            accountNameEn: 'Breakfast Revenue',
            debit: 0,
            credit: 1200,
            description: 'إيرادات إفطار',
            descriptionEn: 'Breakfast revenue',
            reference: 'REST-2024-001',
            referenceType: 'other'
          }
        ],
        totalDebit: 1200,
        totalCredit: 1200,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2024, 0, 16),
        postedBy: 'system',
        postedAt: new Date(2024, 0, 16)
      },

      // Sample: Purchase Entry
      {
        id: 'je-003',
        entryNumber: 'JE-1003',
        date: new Date(2024, 0, 17),
        description: 'شراء مواد غذائية',
        descriptionEn: 'Food Purchase',
        lines: [
          {
            id: 'jel-003-1',
            accountId: '1141',
            accountCode: '1141',
            accountName: 'مخزون المطعم',
            accountNameEn: 'Restaurant Inventory',
            debit: 3000,
            credit: 0,
            description: 'شراء مواد غذائية',
            descriptionEn: 'Food purchase',
            reference: 'PUR-2024-001',
            referenceType: 'purchase'
          },
          {
            id: 'jel-003-2',
            accountId: '2111',
            accountCode: '2111',
            accountName: 'ذمم موردين',
            accountNameEn: 'Suppliers Payable',
            debit: 0,
            credit: 3000,
            description: 'ذمم مورد مواد غذائية',
            descriptionEn: 'Food supplier payable',
            reference: 'PUR-2024-001',
            referenceType: 'purchase'
          }
        ],
        totalDebit: 3000,
        totalCredit: 3000,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2024, 0, 17),
        postedBy: 'system',
        postedAt: new Date(2024, 0, 17)
      },

      // Sample: Payment Entry
      {
        id: 'je-004',
        entryNumber: 'JE-1004',
        date: new Date(2024, 0, 18),
        description: 'دفع لمورد',
        descriptionEn: 'Supplier Payment',
        lines: [
          {
            id: 'jel-004-1',
            accountId: '2111',
            accountCode: '2111',
            accountName: 'ذمم موردين',
            accountNameEn: 'Suppliers Payable',
            debit: 2000,
            credit: 0,
            description: 'دفع لمورد',
            descriptionEn: 'Payment to supplier',
            reference: 'PAY-2024-001',
            referenceType: 'payment'
          },
          {
            id: 'jel-004-2',
            accountId: '1121',
            accountCode: '1121',
            accountName: 'البنك الأهلي - حساب جاري',
            accountNameEn: 'Al Ahli Bank - Current Account',
            debit: 0,
            credit: 2000,
            description: 'سحب من البنك',
            descriptionEn: 'Bank withdrawal',
            reference: 'PAY-2024-001',
            referenceType: 'payment'
          }
        ],
        totalDebit: 2000,
        totalCredit: 2000,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2024, 0, 18),
        postedBy: 'system',
        postedAt: new Date(2024, 0, 18)
      },

      // Sample: Payroll Entry
      {
        id: 'je-005',
        entryNumber: 'JE-1005',
        date: new Date(2024, 0, 25),
        description: 'رواتب الموظفين',
        descriptionEn: 'Employee Salaries',
        lines: [
          {
            id: 'jel-005-1',
            accountId: '5121',
            accountCode: '5121',
            accountName: 'الرواتب والأجور',
            accountNameEn: 'Salaries and Wages',
            debit: 15000,
            credit: 0,
            description: 'رواتب الموظفين',
            descriptionEn: 'Employee salaries',
            reference: 'PAYROLL-2024-001',
            referenceType: 'other'
          },
          {
            id: 'jel-005-2',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 0,
            credit: 15000,
            description: 'دفع رواتب',
            descriptionEn: 'Salary payment',
            reference: 'PAYROLL-2024-001',
            referenceType: 'payment'
          }
        ],
        totalDebit: 15000,
        totalCredit: 15000,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2024, 0, 25),
        postedBy: 'system',
        postedAt: new Date(2024, 0, 25)
      },

      // Sample: Depreciation Entry
      {
        id: 'je-006',
        entryNumber: 'JE-1006',
        date: new Date(2024, 0, 31),
        description: 'إهلاك المعدات',
        descriptionEn: 'Equipment Depreciation',
        lines: [
          {
            id: 'jel-006-1',
            accountId: '5152',
            accountCode: '5152',
            accountName: 'إهلاك المعدات',
            accountNameEn: 'Equipment Depreciation',
            debit: 500,
            credit: 0,
            description: 'إهلاك شهري للمعدات',
            descriptionEn: 'Monthly equipment depreciation',
            reference: 'DEP-2024-001',
            referenceType: 'other'
          },
          {
            id: 'jel-006-2',
            accountId: '1250',
            accountCode: '1250',
            accountName: 'مخصص إهلاك الأصول الثابتة',
            accountNameEn: 'Accumulated Depreciation',
            debit: 0,
            credit: 500,
            description: 'مخصص إهلاك',
            descriptionEn: 'Accumulated depreciation',
            reference: 'DEP-2024-001',
            referenceType: 'other'
          }
        ],
        totalDebit: 500,
        totalCredit: 500,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2024, 0, 31),
        postedBy: 'system',
        postedAt: new Date(2024, 0, 31)
      },

      // Sample: Tax Entry
      {
        id: 'je-007',
        entryNumber: 'JE-1007',
        date: new Date(2024, 1, 1),
        description: 'ضريبة القيمة المضافة',
        descriptionEn: 'VAT',
        lines: [
          {
            id: 'jel-007-1',
            accountId: '4111',
            accountCode: '4111',
            accountName: 'إيرادات إيجار الغرف',
            accountNameEn: 'Room Rental Revenue',
            debit: 750,
            credit: 0,
            description: 'ضريبة القيمة المضافة على الإيرادات',
            descriptionEn: 'VAT on revenue',
            reference: 'TAX-2024-001',
            referenceType: 'other'
          },
          {
            id: 'jel-007-2',
            accountId: '2121',
            accountCode: '2121',
            accountName: 'ضريبة القيمة المضافة المستحقة',
            accountNameEn: 'VAT Payable',
            debit: 0,
            credit: 750,
            description: 'ضريبة مستحقة',
            descriptionEn: 'VAT payable',
            reference: 'TAX-2024-001',
            referenceType: 'other'
          }
        ],
        totalDebit: 750,
        totalCredit: 750,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2024, 1, 1),
        postedBy: 'system',
        postedAt: new Date(2024, 1, 1)
      },

      // Sample: Sales Entries for 2026-01-14 (for "جميع القيود" demo)
      {
        id: 'je-2026-018',
        entryNumber: '18',
        date: new Date(2026, 0, 14),
        description: 'مبيعات نقدية',
        descriptionEn: 'Cash sales',
        lines: [
          {
            id: 'jel-2026-018-1',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 15.0,
            credit: 0,
            description: 'مبيعات نقدية',
            descriptionEn: 'Cash sales',
            reference: 'INV-2026-018',
            referenceType: 'invoice'
          },
          {
            id: 'jel-2026-018-2',
            accountId: '4111',
            accountCode: '4111',
            accountName: 'إيرادات إيجار الغرف',
            accountNameEn: 'Room Rental Revenue',
            debit: 0,
            credit: 15.0,
            description: 'إيرادات مبيعات',
            descriptionEn: 'Sales revenue',
            reference: 'INV-2026-018',
            referenceType: 'invoice'
          }
        ],
        totalDebit: 15.0,
        totalCredit: 15.0,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2026, 0, 14),
        postedBy: 'system',
        postedAt: new Date(2026, 0, 14)
      },
      {
        id: 'je-2026-017',
        entryNumber: '17',
        date: new Date(2026, 0, 14),
        description: 'مبيعات نقدية',
        descriptionEn: 'Cash sales',
        lines: [
          {
            id: 'jel-2026-017-1',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 17250.0,
            credit: 0,
            description: 'مبيعات نقدية',
            descriptionEn: 'Cash sales',
            reference: 'INV-2026-017',
            referenceType: 'invoice'
          },
          {
            id: 'jel-2026-017-2',
            accountId: '4111',
            accountCode: '4111',
            accountName: 'إيرادات إيجار الغرف',
            accountNameEn: 'Room Rental Revenue',
            debit: 0,
            credit: 17250.0,
            description: 'إيرادات مبيعات',
            descriptionEn: 'Sales revenue',
            reference: 'INV-2026-017',
            referenceType: 'invoice'
          }
        ],
        totalDebit: 17250.0,
        totalCredit: 17250.0,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2026, 0, 14),
        postedBy: 'system',
        postedAt: new Date(2026, 0, 14)
      },
      {
        id: 'je-2026-016',
        entryNumber: '16',
        date: new Date(2026, 0, 14),
        description: 'مبيعات نقدية',
        descriptionEn: 'Cash sales',
        lines: [
          {
            id: 'jel-2026-016-1',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 10.0,
            credit: 0,
            description: 'مبيعات نقدية',
            descriptionEn: 'Cash sales',
            reference: 'INV-2026-016',
            referenceType: 'invoice'
          },
          {
            id: 'jel-2026-016-2',
            accountId: '4111',
            accountCode: '4111',
            accountName: 'إيرادات إيجار الغرف',
            accountNameEn: 'Room Rental Revenue',
            debit: 0,
            credit: 10.0,
            description: 'إيرادات مبيعات',
            descriptionEn: 'Sales revenue',
            reference: 'INV-2026-016',
            referenceType: 'invoice'
          }
        ],
        totalDebit: 10.0,
        totalCredit: 10.0,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2026, 0, 14),
        postedBy: 'system',
        postedAt: new Date(2026, 0, 14)
      },
      {
        id: 'je-2026-015',
        entryNumber: '15',
        date: new Date(2026, 0, 14),
        description: 'مبيعات نقدية',
        descriptionEn: 'Cash sales',
        lines: [
          {
            id: 'jel-2026-015-1',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 100.01,
            credit: 0,
            description: 'مبيعات نقدية',
            descriptionEn: 'Cash sales',
            reference: 'INV-2026-015',
            referenceType: 'invoice'
          },
          {
            id: 'jel-2026-015-2',
            accountId: '4111',
            accountCode: '4111',
            accountName: 'إيرادات إيجار الغرف',
            accountNameEn: 'Room Rental Revenue',
            debit: 0,
            credit: 100.01,
            description: 'إيرادات مبيعات',
            descriptionEn: 'Sales revenue',
            reference: 'INV-2026-015',
            referenceType: 'invoice'
          }
        ],
        totalDebit: 100.01,
        totalCredit: 100.01,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2026, 0, 14),
        postedBy: 'system',
        postedAt: new Date(2026, 0, 14)
      },
      {
        id: 'je-2026-014',
        entryNumber: '14',
        date: new Date(2026, 0, 14),
        description: 'مبيعات نقدية',
        descriptionEn: 'Cash sales',
        lines: [
          {
            id: 'jel-2026-014-1',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 9.2,
            credit: 0,
            description: 'مبيعات نقدية',
            descriptionEn: 'Cash sales',
            reference: 'INV-2026-014',
            referenceType: 'invoice'
          },
          {
            id: 'jel-2026-014-2',
            accountId: '4111',
            accountCode: '4111',
            accountName: 'إيرادات إيجار الغرف',
            accountNameEn: 'Room Rental Revenue',
            debit: 0,
            credit: 9.2,
            description: 'إيرادات مبيعات',
            descriptionEn: 'Sales revenue',
            reference: 'INV-2026-014',
            referenceType: 'invoice'
          }
        ],
        totalDebit: 9.2,
        totalCredit: 9.2,
        isBalanced: true,
        status: 'posted',
        createdBy: 'system',
        createdAt: new Date(2026, 0, 14),
        postedBy: 'system',
        postedAt: new Date(2026, 0, 14)
      }
    ];

    // Add draft (pending) entries
    const draftEntries: JournalEntry[] = [
      {
        id: 'je-draft-001',
        entryNumber: 'JE-2001',
        date: new Date(2026, 0, 10),
        description: 'سند قبض من عميل',
        descriptionEn: 'Receipt from customer',
        lines: [
          {
            id: 'jel-d001-1',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 50000,
            credit: 0,
            description: 'استلام دفعة من عميل',
            descriptionEn: 'Payment received from customer',
            reference: 'REC-001',
            referenceType: 'payment'
          },
          {
            id: 'jel-d001-2',
            accountId: '1311',
            accountCode: '1311',
            accountName: 'عملاء محليون',
            accountNameEn: 'Local Customers',
            debit: 0,
            credit: 50000,
            description: 'تحصيل من عميل',
            descriptionEn: 'Collection from customer',
            reference: 'REC-001',
            referenceType: 'payment'
          }
        ],
        totalDebit: 50000,
        totalCredit: 50000,
        isBalanced: true,
        status: 'draft',
        createdBy: 'محمد أحمد',
        createdAt: new Date(2026, 0, 10)
      },
      {
        id: 'je-draft-002',
        entryNumber: 'JE-2002',
        date: new Date(2026, 0, 12),
        description: 'سند صرف رواتب',
        descriptionEn: 'Payroll payment voucher',
        lines: [
          {
            id: 'jel-d002-1',
            accountId: '5112',
            accountCode: '5112',
            accountName: 'رواتب الموظفين',
            accountNameEn: 'Employees Salaries',
            debit: 30000,
            credit: 0,
            description: 'رواتب شهر يناير',
            descriptionEn: 'January salaries',
            reference: 'PAY-001',
            referenceType: 'payment'
          },
          {
            id: 'jel-d002-2',
            accountId: '1111',
            accountCode: '1111',
            accountName: 'الصندوق الرئيسي',
            accountNameEn: 'Main Cash',
            debit: 0,
            credit: 30000,
            description: 'دفع رواتب',
            descriptionEn: 'Salary payment',
            reference: 'PAY-001',
            referenceType: 'payment'
          }
        ],
        totalDebit: 30000,
        totalCredit: 30000,
        isBalanced: true,
        status: 'draft',
        createdBy: 'سارة علي',
        createdAt: new Date(2026, 0, 12)
      }
    ];

    this.entries.set([...sampleEntries, ...draftEntries]);
    this.nextEntryNumber.set(2010);
  }

  /**
   * Generate Unique ID
   */
  private generateId(): string {
    return `je-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
