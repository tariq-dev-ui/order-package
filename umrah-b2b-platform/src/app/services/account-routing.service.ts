/**
 * Account Routing Service
 * خدمة توجيه الحسابات
 *
 * تخزين واسترجاع ربط الحسابات الرئيسية المستخدمة في النظام المحاسبي.
 */

import { Injectable } from '@angular/core';

const STORAGE_KEY = 'accountRouting';

export interface AccountRoutingSettings {
  /** حساب الموردين الآجل – أرصدة فواتير الشراء والالتزامات تجاه الموردين */
  suppliersDeferredAccountId: string;
  /** حساب العملاء – الذمم المدينة الناتجة عن المبيعات الآجلة */
  customersAccountId: string;
  /** حساب مبيعات الحجوزات – المبالغ من الحجوزات والدفعات المقدمة */
  reservationsSalesAccountId: string;
}

const DEFAULT_SETTINGS: AccountRoutingSettings = {
  suppliersDeferredAccountId: '',
  /** حساب العملاء الآجل (1134) في الشجرة المحاسبية – تظهر تحته الحسابات الآجلة في قائمة "اختر حساب آجل موجود" */
  customersAccountId: '1134',
  reservationsSalesAccountId: '',
};

@Injectable({
  providedIn: 'root',
})
export class AccountRoutingService {
  private cached: AccountRoutingSettings | null = null;

  /**
   * تحميل إعدادات توجيه الحسابات
   */
  getSettings(): AccountRoutingSettings {
    if (this.cached) {
      return { ...this.cached };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccountRoutingSettings>;
        this.cached = {
          suppliersDeferredAccountId: parsed.suppliersDeferredAccountId ?? DEFAULT_SETTINGS.suppliersDeferredAccountId,
          customersAccountId: parsed.customersAccountId ?? DEFAULT_SETTINGS.customersAccountId,
          reservationsSalesAccountId: parsed.reservationsSalesAccountId ?? DEFAULT_SETTINGS.reservationsSalesAccountId,
        };
        return { ...this.cached };
      }
    } catch {
      // ignore
    }
    this.cached = { ...DEFAULT_SETTINGS };
    return { ...this.cached };
  }

  /**
   * حفظ إعدادات توجيه الحسابات
   */
  saveSettings(settings: AccountRoutingSettings): void {
    this.cached = {
      suppliersDeferredAccountId: settings.suppliersDeferredAccountId ?? '',
      customersAccountId: settings.customersAccountId ?? '',
      reservationsSalesAccountId: settings.reservationsSalesAccountId ?? '',
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cached));
    } catch {
      // ignore
    }
  }

  /**
   * الحصول على معرف حساب الموردين الآجل
   */
  getSuppliersDeferredAccountId(): string {
    return this.getSettings().suppliersDeferredAccountId;
  }

  /**
   * الحصول على معرف حساب العملاء
   */
  getCustomersAccountId(): string {
    return this.getSettings().customersAccountId;
  }

  /**
   * الحصول على معرف حساب مبيعات الحجوزات
   */
  getReservationsSalesAccountId(): string {
    return this.getSettings().reservationsSalesAccountId;
  }

  /**
   * مسح الكاش (بعد تغيير التخزين من الخارج)
   */
  clearCache(): void {
    this.cached = null;
  }
}
