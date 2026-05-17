/**
 * Agent Deferred Accounts Service
 * خدمة الحسابات الآجلة للجهات
 *
 * تخزين الحسابات الفرعية المُنشأة تلقائياً للجهات (عملاء/موردين)
 * تحت الحساب الرئيسي المحدد في توجيه الحسابات.
 */

import { Injectable } from '@angular/core';
import {
  Account,
  AccountType,
  AccountNature,
  AccountStatus,
} from '../models/chart-of-accounts.model';
import { ChartOfAccounts } from '../models/chart-of-accounts.model';

const STORAGE_KEY = 'agentDeferredAccounts';

export interface AgentDeferredAccount extends Account {
  /** معرف الجهة المرتبطة (إن وُجد) */
  agentId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentDeferredAccountsService {
  private cached: AgentDeferredAccount[] | null = null;

  private loadFromStorage(): AgentDeferredAccount[] {
    if (this.cached) return this.cached;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AgentDeferredAccount[];
        this.cached = Array.isArray(parsed) ? parsed : [];
        return this.cached;
      }
    } catch {
      // ignore
    }
    this.cached = [];
    return this.cached;
  }

  private saveToStorage(list: AgentDeferredAccount[]): void {
    this.cached = list;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  /**
   * الحصول على جميع الحسابات الآجلة للجهات
   */
  getAccounts(): Account[] {
    return this.loadFromStorage().map((a) => ({ ...a }));
  }

  /**
   * الحصول على حساب آجل بالمعرف
   */
  getAccountById(id: string): AgentDeferredAccount | undefined {
    return this.loadFromStorage().find((a) => a.id === id);
  }

  /**
   * الحصول على حساب آجل بالكود
   */
  getAccountByCode(code: string): AgentDeferredAccount | undefined {
    return this.loadFromStorage().find((a) => a.code === code);
  }

  /**
   * الحسابات الفرعية لحساب معين (من القائمة الديناميكية فقط)
   */
  getChildAccounts(parentId: string): AgentDeferredAccount[] {
    return this.loadFromStorage().filter((a) => a.parentId === parentId);
  }

  /**
   * توليد الرقم التسلسلي التالي لحساب فرعي تحت الحساب الأب (بدون تكرار مع الثابتة أو الديناميكية)
   */
  private getNextChildCode(parentId: string): string {
    const staticAccounts = ChartOfAccounts.getAccounts();
    const staticChildren = staticAccounts.filter((a) => a.parentId === parentId);
    const dynamicChildren = this.getChildAccounts(parentId);
    const allChildren = [...staticChildren, ...dynamicChildren];
    const parent = staticAccounts.find((a) => a.id === parentId);
    const parentCode = parent?.code ?? parentId;
    const parentNum = parseInt(parentCode, 10) || 0;

    const existingCodes = new Set(staticAccounts.map((a) => a.code));
    this.loadFromStorage().forEach((a) => existingCodes.add(a.code));

    const childrenCodes = allChildren.map((a) => a.code);
    const numericParts = childrenCodes
      .map((c) => parseInt(c, 10))
      .filter((n) => !Number.isNaN(n));
    let nextNum = numericParts.length ? Math.max(...numericParts) + 1 : parentNum + 1;
    while (existingCodes.has(String(nextNum))) nextNum++;
    return String(nextNum);
  }

  /**
   * إنشاء حساب آجل فرعي تحت الحساب الرئيسي وربطه بالجهة
   */
  addAccountForAgent(
    parentAccountId: string,
    accountName: string,
    accountNameEn: string,
    agentId?: string
  ): Account {
    const staticAccounts = ChartOfAccounts.getAccounts();
    const parent = staticAccounts.find((a) => a.id === parentAccountId);
    if (!parent) {
      throw new Error('الحساب الأب غير موجود في شجرة الحسابات');
    }

    const code = this.getNextChildCode(parentAccountId);
    const id = `dyn-${code}`;

    const newAccount: AgentDeferredAccount = {
      id,
      code,
      parentId: parentAccountId,
      name: accountName,
      nameEn: accountNameEn,
      type: parent.type,
      nature: parent.nature,
      level: parent.level + 1,
      isParent: false,
      isActive: true,
      status: AccountStatus.ACTIVE,
      balance: 0,
      openingBalance: 0,
      currency: parent.currency ?? 'SAR',
      isSystemAccount: false,
      allowManualEntry: true,
      displayOrder: 0,
      agentId,
      metadata: { source: 'agent-deferred', agentId },
    };

    const list = this.loadFromStorage();
    list.push(newAccount);
    this.saveToStorage(list);
    return { ...newAccount };
  }

  /**
   * ربط حساب آجل موجود بجهة (تحديث agentId)
   */
  linkAccountToAgent(accountId: string, agentId: string): void {
    const list = this.loadFromStorage();
    const idx = list.findIndex((a) => a.id === accountId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], agentId, metadata: { ...list[idx].metadata, agentId } };
      this.saveToStorage(list);
    }
  }

  /**
   * مسح الكاش (بعد تغيير التخزين من الخارج)
   */
  clearCache(): void {
    this.cached = null;
  }
}
