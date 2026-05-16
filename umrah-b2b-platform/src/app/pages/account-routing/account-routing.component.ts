/**
 * Account Routing Component
 * مكون توجيه الحسابات
 *
 * ربط وتحديد الحسابات الرئيسية المستخدمة داخل النظام المحاسبي.
 */

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { FormsModule } from '@angular/forms';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { AccountRoutingService, AccountRoutingSettings } from 'src/app/services/account-routing.service';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';
import { CoreService } from 'src/app/services/core.service';
import { Account } from 'src/app/models/chart-of-accounts.model';

@Component({
  selector: 'app-account-routing',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
    FormsModule,
    ReactiveFormsModule,
    NgxMatSelectSearchModule,
  ],
  templateUrl: './account-routing.component.html',
  styleUrl: './account-routing.component.scss',
})
export class AccountRoutingComponent implements OnInit {
  private chartOfAccountsService = inject(ChartOfAccountsService);
  private accountRoutingService = inject(AccountRoutingService);
  private snackBar = inject(AppSnackBarService);
  private translate = inject(TranslateService);
  private coreService = inject(CoreService);

  /** الحسابات المتاحة للاختيار (حسابات نهائية نشطة فقط) */
  accounts = signal<Account[]>([]);
  /** الحسابات بعد تطبيق البحث (للدروب داون الموحد) */
  filteredAccounts = signal<Account[]>([]);
  /** حقل البحث الموحد للدروب داون */
  accountSearchControl = new FormControl('');

  /** إعدادات التوجيه الحالية */
  suppliersDeferredAccountId = signal<string>('');
  customersAccountId = signal<string>('');
  reservationsSalesAccountId = signal<string>('');
  /** حالة الحفظ */
  saving = signal(false);
  /** اتجاه الواجهة */
  dir = computed(() => (this.coreService.getOptions().dir === 'rtl' ? 'rtl' : 'ltr'));

  constructor() {
    this.coreService.notify.subscribe(() => {});
  }

  ngOnInit(): void {
    this.loadAccounts();
    this.setupAccountSearch();
    this.loadSettings();
  }

  /** تحميل الحسابات من شجرة الحسابات (النهائية النشطة فقط) */
  loadAccounts(): void {
    try {
      const all = this.chartOfAccountsService.getAllAccounts();
      const leafActive = all.filter((a) => !a.isParent && a.isActive);
      this.accounts.set(leafActive);
      this.filteredAccounts.set(leafActive);
    } catch {
      this.accounts.set([]);
      this.filteredAccounts.set([]);
    }
  }

  /** إعداد البحث الموحد في قائمة الحسابات */
  setupAccountSearch(): void {
    this.accountSearchControl.valueChanges.subscribe((term) => {
      if (!term || typeof term !== 'string' || term.trim() === '') {
        this.filteredAccounts.set(this.accounts());
      } else {
        const q = term.toLowerCase().trim();
        const list = this.accounts().filter(
          (a) =>
            a.code.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            (a.nameEn && a.nameEn.toLowerCase().includes(q))
        );
        this.filteredAccounts.set(list);
      }
    });
  }

  /** تحميل إعدادات التوجيه المحفوظة */
  loadSettings(): void {
    const s = this.accountRoutingService.getSettings();
    this.suppliersDeferredAccountId.set(s.suppliersDeferredAccountId ?? '');
    this.customersAccountId.set(s.customersAccountId ?? '');
    this.reservationsSalesAccountId.set(s.reservationsSalesAccountId ?? '');
  }

  /** عرض اسم الحساب في القائمة */
  accountLabel(account: Account): string {
    const name = this.dir() === 'rtl' ? account.name : account.nameEn;
    return `${account.code} - ${name}`;
  }

  /** حفظ التوجيه وتطبيقه */
  save(): void {
    this.saving.set(true);
    try {
      const settings: AccountRoutingSettings = {
        suppliersDeferredAccountId: this.suppliersDeferredAccountId() || '',
        customersAccountId: this.customersAccountId() || '',
        reservationsSalesAccountId: this.reservationsSalesAccountId() || '',
      };
      this.accountRoutingService.saveSettings(settings);
      this.snackBar.showSuccessSnackBar(this.translate.instant('تم حفظ توجيه الحسابات بنجاح'));
    } catch (e) {
      this.snackBar.showErrorSnackBar(this.translate.instant('حدث خطأ أثناء الحفظ'));
    } finally {
      this.saving.set(false);
    }
  }

  /** إعادة تعيين البحث عند إغلاق لوحة أي دروب داون */
  onSelectPanelClosed(open: boolean): void {
    if (!open) {
      this.accountSearchControl.setValue('', { emitEvent: false });
      this.filteredAccounts.set(this.accounts());
    }
  }

  /** التحقق من وجود تغييرات غير محفوظة */
  hasChanges(): boolean {
    const s = this.accountRoutingService.getSettings();
    return (
      this.suppliersDeferredAccountId() !== (s.suppliersDeferredAccountId ?? '') ||
      this.customersAccountId() !== (s.customersAccountId ?? '') ||
      this.reservationsSalesAccountId() !== (s.reservationsSalesAccountId ?? '')
    );
  }
}
