import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FINANCE_PAGE_META } from './finance.mock';
import {
  AccountRoutingRule,
  AccountTransaction,
  CostCenter,
  FinanceAccount,
  FinancePageKind,
  FinancePageMeta,
  FinanceWallet,
  FinancialReportTile,
  FiscalYear,
  IncomeStatementSection,
  JournalEntry,
  JournalStatus,
  OpeningBalanceRow,
  TrialBalanceRow,
} from './finance.models';
import { FinanceLocalStoreService } from './finance-local-store.service';

@Component({
  selector: 'app-finance-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="finance-page" dir="rtl">
      <header class="finance-header">
        <div class="header-title">
          <span class="header-icon material-icons-round">{{ pageMeta.icon }}</span>
          <div>
            <span class="eyebrow">{{ pageMeta.eyebrow }}</span>
            <h1>{{ pageMeta.title }}</h1>
            <p>{{ pageMeta.description }}</p>
          </div>
        </div>
        <div class="header-actions">
          <button type="button" class="btn btn-secondary" (click)="showLocalNotice('تم تحديث البيانات المحلية')">
            <span class="material-icons-round">refresh</span>
            <span>تحديث</span>
          </button>
          <button type="button" class="btn btn-primary" (click)="showLocalNotice('تم تجهيز التصدير محلياً')">
            <span class="material-icons-round">download</span>
            <span>تصدير</span>
          </button>
        </div>
      </header>

      @if (notice) {
        <div class="notice" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ notice }}</span>
        </div>
      }

      <div class="kpi-grid">
        <article class="kpi-card">
          <span class="kpi-label">إجمالي الأصول</span>
          <strong>{{ formatMoney(totalAssets) }}</strong>
          <span class="kpi-foot">من الشجرة المحاسبية</span>
        </article>
        <article class="kpi-card">
          <span class="kpi-label">إجمالي الالتزامات</span>
          <strong>{{ formatMoney(totalLiabilities) }}</strong>
          <span class="kpi-foot">ذمم وضرائب مستحقة</span>
        </article>
        <article class="kpi-card">
          <span class="kpi-label">صافي الدخل</span>
          <strong>{{ formatMoney(netIncome) }}</strong>
          <span class="kpi-foot">إيرادات ناقص مصروفات</span>
        </article>
        <article class="kpi-card">
          <span class="kpi-label">القيود المرحلة</span>
          <strong>{{ postedEntriesCount }}</strong>
          <span class="kpi-foot">بيانات محلية فقط</span>
        </article>
      </div>

      @if (pageKind === 'chart') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>الشجرة المحاسبية</h2>
              <p>واجهة RMS للحسابات مطبقة محلياً مع مستويات الحسابات والأرصدة.</p>
            </div>
            <label class="search-field">
              <span class="material-icons-round">search</span>
              <input type="text" [(ngModel)]="accountSearch" placeholder="بحث باسم أو رقم الحساب" />
            </label>
          </div>
          <div class="table-wrap">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>اسم الحساب</th>
                  <th>النوع</th>
                  <th>الطبيعة</th>
                  <th>المستوى</th>
                  <th>الرصيد</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                @for (account of filteredAccounts; track account.id) {
                  <tr>
                    <td class="mono">{{ account.code }}</td>
                    <td>
                      <div class="account-name" [style.padding-inline-start.px]="account.level * 14">
                        <span class="tree-line"></span>
                        <strong>{{ account.name }}</strong>
                      </div>
                    </td>
                    <td>{{ accountTypeLabel(account.type) }}</td>
                    <td>{{ account.nature === 'debit' ? 'مدين' : 'دائن' }}</td>
                    <td>{{ account.level + 1 }}</td>
                    <td class="amount">{{ formatMoney(account.balance) }}</td>
                    <td><span class="pill" [class.is-muted]="!account.isActive">{{ account.isActive ? 'فعال' : 'غير فعال' }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      @if (pageKind === 'fiscal-year') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>السنوات المالية</h2>
              <p>فتح وإقفال السنوات المالية بشكل محلي داخل النموذج.</p>
            </div>
            <button type="button" class="btn btn-primary" (click)="showLocalNotice('تم فتح نموذج إضافة سنة مالية محلياً')">
              <span class="material-icons-round">add</span>
              <span>إضافة سنة</span>
            </button>
          </div>
          <div class="record-grid">
            @for (year of fiscalYears; track year.id) {
              <article class="record-card">
                <div class="record-head">
                  <strong>{{ year.name }}</strong>
                  <span class="pill">{{ fiscalYearStatusLabel(year.status) }}</span>
                </div>
                <div class="record-meta">
                  <span>{{ formatDate(year.startDate) }}</span>
                  <span>{{ formatDate(year.endDate) }}</span>
                  <span>{{ year.entriesCount }} قيد</span>
                </div>
              </article>
            }
          </div>
        </section>
      }

      @if (pageKind === 'journal-entries') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>القيود المحاسبية</h2>
              <p>القائمة الرئيسية للقيود مع إجمالي المدين والدائن لكل قيد.</p>
            </div>
            <div class="segmented">
              <button type="button" [class.active]="entryStatusFilter === 'all'" (click)="entryStatusFilter = 'all'">الكل</button>
              <button type="button" [class.active]="entryStatusFilter === 'posted'" (click)="entryStatusFilter = 'posted'">مرحلة</button>
              <button type="button" [class.active]="entryStatusFilter === 'pending'" (click)="entryStatusFilter = 'pending'">معلقة</button>
              <button type="button" [class.active]="entryStatusFilter === 'draft'" (click)="entryStatusFilter = 'draft'">مسودة</button>
            </div>
          </div>
          <div class="table-wrap">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>رقم القيد</th>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المصدر</th>
                  <th>مدين</th>
                  <th>دائن</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of filteredEntries; track entry.id) {
                  <tr>
                    <td class="mono">{{ entry.number }}</td>
                    <td>{{ formatDate(entry.date) }}</td>
                    <td>{{ entry.description }}</td>
                    <td>{{ entry.source }}</td>
                    <td class="amount">{{ formatMoney(entryDebit(entry)) }}</td>
                    <td class="amount">{{ formatMoney(entryCredit(entry)) }}</td>
                    <td><span class="pill" [class.is-muted]="entry.status !== 'posted'">{{ journalStatusLabel(entry.status) }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      @if (pageKind === 'account-statement') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>كشف الحساب</h2>
              <p>اختر حساباً لعرض الحركات والرصيد الجاري.</p>
            </div>
            <label class="select-field">
              <span>الحساب</span>
              <select [(ngModel)]="selectedAccountId">
                @for (account of leafAccounts; track account.id) {
                  <option [value]="account.id">{{ account.code }} - {{ account.name }}</option>
                }
              </select>
            </label>
          </div>
          <div class="table-wrap">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>المرجع</th>
                  <th>البيان</th>
                  <th>مدين</th>
                  <th>دائن</th>
                  <th>الرصيد</th>
                </tr>
              </thead>
              <tbody>
                @for (row of accountStatementRows; track row.id) {
                  <tr>
                    <td>{{ formatDate(row.date) }}</td>
                    <td class="mono">{{ row.reference }}</td>
                    <td>{{ row.description }}</td>
                    <td class="amount">{{ formatMoney(row.debit) }}</td>
                    <td class="amount">{{ formatMoney(row.credit) }}</td>
                    <td class="amount">{{ formatMoney(row.runningBalance) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      @if (pageKind === 'trial-balance') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>ميزان المراجعة</h2>
              <p>الأرصدة الافتتاحية وحركة الفترة وأرصدة الإقفال.</p>
            </div>
          </div>
          <div class="table-wrap">
            <table class="finance-table wide-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>الحساب</th>
                  <th>افتتاحي مدين</th>
                  <th>افتتاحي دائن</th>
                  <th>حركة مدين</th>
                  <th>حركة دائن</th>
                  <th>إقفال مدين</th>
                  <th>إقفال دائن</th>
                </tr>
              </thead>
              <tbody>
                @for (row of trialBalanceRows; track row.accountCode) {
                  <tr>
                    <td class="mono">{{ row.accountCode }}</td>
                    <td>{{ row.accountName }}</td>
                    <td class="amount">{{ formatMoney(row.openingDebit) }}</td>
                    <td class="amount">{{ formatMoney(row.openingCredit) }}</td>
                    <td class="amount">{{ formatMoney(row.movementDebit) }}</td>
                    <td class="amount">{{ formatMoney(row.movementCredit) }}</td>
                    <td class="amount">{{ formatMoney(row.closingDebit) }}</td>
                    <td class="amount">{{ formatMoney(row.closingCredit) }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">الإجمالي</td>
                  <td class="amount">{{ formatMoney(totalTrial('openingDebit')) }}</td>
                  <td class="amount">{{ formatMoney(totalTrial('openingCredit')) }}</td>
                  <td class="amount">{{ formatMoney(totalTrial('movementDebit')) }}</td>
                  <td class="amount">{{ formatMoney(totalTrial('movementCredit')) }}</td>
                  <td class="amount">{{ formatMoney(totalTrial('closingDebit')) }}</td>
                  <td class="amount">{{ formatMoney(totalTrial('closingCredit')) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      }

      @if (pageKind === 'opening-balance') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>نموذج الرصيد الافتتاحي</h2>
              <p>واجهة جاهزة للربط لاحقاً، والقيم الحالية من mock محلي.</p>
            </div>
            <span class="balance-chip">{{ openingBalanceBalanced ? 'متوازن' : 'غير متوازن' }}</span>
          </div>
          <div class="table-wrap">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>الحساب</th>
                  <th>مدين</th>
                  <th>دائن</th>
                </tr>
              </thead>
              <tbody>
                @for (row of openingBalances; track row.accountId) {
                  <tr>
                    <td class="mono">{{ row.accountCode }}</td>
                    <td>{{ row.accountName }}</td>
                    <td class="amount">{{ formatMoney(row.debit) }}</td>
                    <td class="amount">{{ formatMoney(row.credit) }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2">الإجمالي</td>
                  <td class="amount">{{ formatMoney(openingDebitTotal) }}</td>
                  <td class="amount">{{ formatMoney(openingCreditTotal) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      }

      @if (pageKind === 'wallets') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>الحسابات والمحافظ</h2>
              <p>الصناديق والحسابات البنكية وطرق الدفع من واجهات RMS المالية.</p>
            </div>
          </div>
          <div class="wallet-grid">
            @for (wallet of wallets; track wallet.id) {
              <article class="wallet-card">
                <div class="wallet-head">
                  <span class="material-icons-round">{{ walletIcon(wallet) }}</span>
                  <span class="pill" [class.is-muted]="!wallet.isActive">{{ wallet.isActive ? 'فعال' : 'غير فعال' }}</span>
                </div>
                <h3>{{ wallet.name }}</h3>
                <p class="mono">{{ wallet.accountNumber }}</p>
                <strong>{{ formatMoney(wallet.balance) }} {{ wallet.currency }}</strong>
                @if (wallet.isDefault) {
                  <span class="default-label">افتراضي</span>
                }
              </article>
            }
          </div>
        </section>
      }

      @if (pageKind === 'account-routing') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>توجيه الحسابات</h2>
              <p>قواعد توجيه العمليات إلى الحسابات المناسبة.</p>
            </div>
          </div>
          <div class="route-grid">
            @for (rule of routingRules; track rule.id) {
              <article class="route-card">
                <div class="record-head">
                  <strong>{{ rule.operation }}</strong>
                  <span class="pill" [class.is-muted]="!rule.isActive">{{ rule.isActive ? 'فعال' : 'متوقف' }}</span>
                </div>
                <p>{{ rule.description }}</p>
                <div class="route-flow">
                  <span>{{ getAccountName(rule.debitAccountId) }}</span>
                  <span class="material-icons-round">keyboard_backspace</span>
                  <span>{{ getAccountName(rule.creditAccountId) }}</span>
                </div>
              </article>
            }
          </div>
        </section>
      }

      @if (pageKind === 'income-statement') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>قائمة الدخل</h2>
              <p>ملخص الإيرادات والمصروفات من الأرصدة المحلية.</p>
            </div>
          </div>
          <div class="statement-grid">
            @for (section of incomeStatementSections; track section.title) {
              <article class="statement-card">
                <h3>{{ section.title }}</h3>
                @for (line of section.lines; track line.label) {
                  <div class="statement-line">
                    <span>{{ line.label }}</span>
                    <strong>{{ formatMoney(line.amount) }}</strong>
                  </div>
                }
                <div class="statement-total">
                  <span>الإجمالي</span>
                  <strong>{{ formatMoney(sectionTotal(section)) }}</strong>
                </div>
              </article>
            }
            <article class="statement-card statement-card-total">
              <h3>صافي الدخل</h3>
              <strong>{{ formatMoney(netIncome) }}</strong>
              <p>{{ netIncome >= 0 ? 'ربح تشغيلي للفترة' : 'خسارة تشغيلية للفترة' }}</p>
            </article>
          </div>
        </section>
      }

      @if (pageKind === 'cost-centers') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>مراكز التكلفة</h2>
              <p>مقارنة الميزانية بالمصروف الفعلي حسب المركز.</p>
            </div>
            <label class="search-field">
              <span class="material-icons-round">search</span>
              <input type="text" [(ngModel)]="costCenterSearch" placeholder="بحث في مراكز التكلفة" />
            </label>
          </div>
          <div class="table-wrap">
            <table class="finance-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>المركز</th>
                  <th>المالك</th>
                  <th>الميزانية</th>
                  <th>الفعلي</th>
                  <th>المتبقي</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                @for (center of filteredCostCenters; track center.id) {
                  <tr>
                    <td class="mono">{{ center.code }}</td>
                    <td>{{ center.name }}</td>
                    <td>{{ center.owner }}</td>
                    <td class="amount">{{ formatMoney(center.budget) }}</td>
                    <td class="amount">{{ formatMoney(center.actual) }}</td>
                    <td class="amount">{{ formatMoney(center.budget - center.actual) }}</td>
                    <td><span class="pill" [class.is-muted]="!center.isActive">{{ center.isActive ? 'فعال' : 'غير فعال' }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      @if (pageKind === 'financial-reports') {
        <section class="surface-card">
          <div class="section-toolbar">
            <div>
              <h2>التقارير المالية</h2>
              <p>بطاقات التقارير المنقولة من نطاق الإدارة المالية في RMS.</p>
            </div>
          </div>
          <div class="report-grid">
            @for (report of reports; track report.id) {
              <button
                type="button"
                class="report-card"
                [class.active]="selectedReportId === report.id"
                (click)="selectedReportId = report.id">
                <span class="material-icons-round">{{ report.icon }}</span>
                <strong>{{ report.title }}</strong>
                <small>{{ report.description }}</small>
                <em>آخر تحديث: {{ formatDate(report.updatedAt) }}</em>
              </button>
            }
          </div>
          @if (selectedReport; as report) {
            <div class="report-preview">
              <span class="material-icons-round">{{ report.icon }}</span>
              <div>
                <h3>{{ report.title }}</h3>
                <p>{{ report.description }}</p>
                <button type="button" class="btn btn-secondary" (click)="showLocalNotice('تم فتح معاينة التقرير محلياً')">معاينة</button>
              </div>
            </div>
          }
        </section>
      }
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .finance-page {
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: var(--app-bg);
      color: var(--app-text-primary);
    }

    .finance-header,
    .surface-card,
    .kpi-card,
    .record-card,
    .wallet-card,
    .route-card,
    .statement-card,
    .report-preview {
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-card-bg);
    }

    .finance-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .header-icon {
      width: 42px;
      height: 42px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--app-heading) 10%, var(--app-card-bg));
      color: var(--app-heading);
      flex-shrink: 0;
    }

    .eyebrow {
      color: var(--app-heading);
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      color: var(--app-heading);
      font-size: 1.18rem;
      font-weight: 900;
    }

    h2 {
      color: var(--app-text-primary);
      font-size: 0.95rem;
      font-weight: 900;
    }

    h3 {
      color: var(--app-text-primary);
      font-size: 0.86rem;
      font-weight: 900;
    }

    p {
      color: var(--app-text-secondary);
      font-size: 0.78rem;
      line-height: 1.7;
    }

    .header-actions,
    .section-toolbar,
    .record-head,
    .wallet-head,
    .route-flow,
    .pagination-like,
    .statement-line,
    .statement-total,
    .report-preview {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-actions {
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .btn {
      min-height: 34px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 12px;
      font-family: inherit;
      font-size: 0.76rem;
      font-weight: 900;
      cursor: pointer;
      transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
    }

    .btn .material-icons-round {
      font-size: 16px;
    }

    .btn-primary {
      border-color: var(--app-heading);
      background: var(--app-heading);
      color: var(--app-card-bg);
    }

    .btn-secondary {
      background: var(--app-card-bg);
      color: var(--app-text-primary);
    }

    .btn:hover,
    .segmented button:hover,
    .report-card:hover {
      border-color: var(--app-heading);
      background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg));
      color: var(--app-heading);
    }

    .notice {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 8px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg));
      color: var(--app-heading);
      padding: 10px 12px;
      font-size: 0.78rem;
      font-weight: 900;
    }

    .notice .material-icons-round {
      font-size: 18px;
    }

    .kpi-grid,
    .record-grid,
    .wallet-grid,
    .route-grid,
    .statement-grid,
    .report-grid {
      display: grid;
      gap: 12px;
    }

    .kpi-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .kpi-card,
    .wallet-card,
    .record-card,
    .route-card,
    .statement-card {
      padding: 14px;
    }

    .kpi-label,
    .kpi-foot,
    .record-meta,
    .default-label,
    .report-card small,
    .report-card em {
      color: var(--app-text-secondary);
      font-size: 0.72rem;
      font-weight: 700;
    }

    .kpi-card strong {
      display: block;
      margin: 5px 0;
      color: var(--app-heading);
      font-size: 1.22rem;
      font-weight: 900;
      direction: ltr;
      text-align: right;
    }

    .surface-card {
      overflow: hidden;
    }

    .section-toolbar {
      justify-content: space-between;
      padding: 14px;
      border-bottom: 1px solid var(--app-border);
      flex-wrap: wrap;
    }

    .search-field,
    .select-field {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 260px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-card-bg);
      color: var(--app-text-secondary);
      padding: 0 10px;
    }

    .select-field {
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
      padding: 8px 10px;
    }

    .select-field span {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--app-text-secondary);
    }

    .search-field .material-icons-round {
      font-size: 18px;
    }

    input,
    select {
      min-height: 36px;
      width: 100%;
      border: none;
      outline: none;
      background: var(--app-card-bg);
      color: var(--app-text-primary);
      font-family: inherit;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .table-wrap {
      overflow-x: auto;
    }

    .finance-table {
      width: 100%;
      min-width: 820px;
      border-collapse: collapse;
    }

    .wide-table {
      min-width: 1080px;
    }

    .finance-table th {
      background: var(--app-heading);
      color: var(--app-card-bg);
      font-size: 0.72rem;
      font-weight: 900;
      padding: 10px 12px;
      text-align: right;
      white-space: nowrap;
    }

    .finance-table td,
    .finance-table tfoot td {
      border-bottom: 1px solid var(--app-border);
      color: var(--app-text-primary);
      font-size: 0.78rem;
      font-weight: 700;
      padding: 10px 12px;
      text-align: right;
      white-space: nowrap;
      vertical-align: middle;
    }

    .finance-table tbody tr:hover {
      background: color-mix(in srgb, var(--app-heading) 6%, var(--app-card-bg));
    }

    .finance-table tfoot td {
      background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg));
      color: var(--app-heading);
      font-weight: 900;
    }

    .amount,
    .mono {
      direction: ltr;
      text-align: left;
      font-variant-numeric: tabular-nums;
    }

    .account-name {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    .tree-line {
      width: 14px;
      height: 1px;
      background: var(--app-border);
      flex-shrink: 0;
    }

    .pill,
    .balance-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 24px;
      border: 1px solid var(--app-border);
      border-radius: 999px;
      padding: 2px 10px;
      background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg));
      color: var(--app-heading);
      font-size: 0.68rem;
      font-weight: 900;
      white-space: nowrap;
    }

    .pill.is-muted {
      background: var(--app-card-bg);
      color: var(--app-text-secondary);
    }

    .segmented {
      display: inline-flex;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .segmented button {
      min-height: 32px;
      border: none;
      border-inline-end: 1px solid var(--app-border);
      background: var(--app-card-bg);
      color: var(--app-text-secondary);
      padding: 0 10px;
      font-family: inherit;
      font-size: 0.74rem;
      font-weight: 800;
      cursor: pointer;
    }

    .segmented button:last-child {
      border-inline-end: none;
    }

    .segmented button.active,
    .report-card.active {
      background: var(--app-heading);
      color: var(--app-card-bg);
      border-color: var(--app-heading);
    }

    .record-grid,
    .wallet-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      padding: 14px;
    }

    .record-head {
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .record-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .wallet-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .wallet-head {
      justify-content: space-between;
    }

    .wallet-head .material-icons-round {
      color: var(--app-heading);
    }

    .wallet-card strong,
    .statement-card-total strong {
      color: var(--app-heading);
      font-size: 1.08rem;
      font-weight: 900;
      direction: ltr;
      text-align: right;
    }

    .route-grid,
    .statement-grid,
    .report-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      padding: 14px;
    }

    .route-card {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .route-flow {
      justify-content: space-between;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      padding: 10px;
      color: var(--app-text-secondary);
      font-size: 0.76rem;
      font-weight: 800;
    }

    .route-flow .material-icons-round {
      color: var(--app-heading);
      font-size: 18px;
      transform: scaleX(-1);
    }

    .statement-card {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .statement-line,
    .statement-total {
      justify-content: space-between;
      border-bottom: 1px solid var(--app-border);
      padding-bottom: 8px;
      color: var(--app-text-secondary);
      font-size: 0.78rem;
      font-weight: 800;
    }

    .statement-line strong,
    .statement-total strong {
      color: var(--app-text-primary);
      direction: ltr;
    }

    .statement-total {
      border-bottom: none;
      color: var(--app-heading);
      font-weight: 900;
    }

    .statement-card-total {
      justify-content: center;
      background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg));
    }

    .report-card {
      min-height: 150px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-card-bg);
      color: var(--app-text-primary);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 14px;
      text-align: right;
      font-family: inherit;
      cursor: pointer;
    }

    .report-card .material-icons-round {
      color: var(--app-heading);
    }

    .report-card.active .material-icons-round,
    .report-card.active small,
    .report-card.active em {
      color: var(--app-card-bg);
    }

    .report-preview {
      margin: 0 14px 14px;
      padding: 14px;
      align-items: flex-start;
    }

    .report-preview .material-icons-round {
      color: var(--app-heading);
      font-size: 28px;
      flex-shrink: 0;
    }

    @media (max-width: 1100px) {
      .kpi-grid,
      .record-grid,
      .wallet-grid,
      .route-grid,
      .statement-grid,
      .report-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 720px) {
      .finance-header,
      .section-toolbar {
        align-items: stretch;
        flex-direction: column;
      }

      .header-actions {
        justify-content: flex-start;
      }

      .kpi-grid,
      .record-grid,
      .wallet-grid,
      .route-grid,
      .statement-grid,
      .report-grid {
        grid-template-columns: 1fr;
      }

      .search-field,
      .select-field {
        min-width: 0;
        width: 100%;
      }
    }
  `],
})
export class FinancePageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(FinanceLocalStoreService);
  private readonly destroy$ = new Subject<void>();

  readonly accounts: FinanceAccount[] = this.store.getAccounts();
  readonly fiscalYears: FiscalYear[] = this.store.getFiscalYears();
  readonly entries: JournalEntry[] = this.store.getJournalEntries();
  readonly trialBalanceRows: TrialBalanceRow[] = this.store.getTrialBalance();
  readonly openingBalances: OpeningBalanceRow[] = this.store.getOpeningBalances();
  readonly wallets: FinanceWallet[] = this.store.getWallets();
  readonly routingRules: AccountRoutingRule[] = this.store.getRoutingRules();
  readonly incomeStatementSections: IncomeStatementSection[] = this.store.getIncomeStatementSections();
  readonly costCenters: CostCenter[] = this.store.getCostCenters();
  readonly reports: FinancialReportTile[] = this.store.getReports();

  pageKind: FinancePageKind = 'chart';
  accountSearch = '';
  costCenterSearch = '';
  entryStatusFilter: JournalStatus | 'all' = 'all';
  selectedAccountId = this.accounts.find((account) => account.id === 'acc-1111')?.id ?? this.accounts[0]?.id ?? '';
  selectedReportId = this.reports[0]?.id ?? '';
  notice = '';
  private noticeTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      const kind = data['financePage'];
      this.pageKind = this.isFinancePageKind(kind) ? kind : 'chart';
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.noticeTimer) {
      clearTimeout(this.noticeTimer);
    }
  }

  get pageMeta(): FinancePageMeta {
    return FINANCE_PAGE_META[this.pageKind];
  }

  get leafAccounts(): FinanceAccount[] {
    return this.accounts.filter((account) => account.level > 0);
  }

  get filteredAccounts(): FinanceAccount[] {
    const term = this.accountSearch.trim().toLowerCase();
    if (!term) {
      return this.accounts;
    }

    return this.accounts.filter((account) =>
      account.name.toLowerCase().includes(term) || account.code.includes(term)
    );
  }

  get filteredEntries(): JournalEntry[] {
    if (this.entryStatusFilter === 'all') {
      return this.entries;
    }

    return this.entries.filter((entry) => entry.status === this.entryStatusFilter);
  }

  get accountStatementRows(): AccountTransaction[] {
    return this.store.getAccountStatement(this.selectedAccountId);
  }

  get filteredCostCenters(): CostCenter[] {
    const term = this.costCenterSearch.trim().toLowerCase();
    if (!term) {
      return this.costCenters;
    }

    return this.costCenters.filter((center) =>
      center.name.toLowerCase().includes(term) ||
      center.code.toLowerCase().includes(term) ||
      center.owner.toLowerCase().includes(term)
    );
  }

  get selectedReport(): FinancialReportTile | undefined {
    return this.reports.find((report) => report.id === this.selectedReportId);
  }

  get totalAssets(): number {
    return this.accounts
      .filter((account) => account.type === 'asset' && account.level === 0)
      .reduce((total, account) => total + account.balance, 0);
  }

  get totalLiabilities(): number {
    return this.accounts
      .filter((account) => account.type === 'liability' && account.level === 0)
      .reduce((total, account) => total + account.balance, 0);
  }

  get totalRevenue(): number {
    return this.accounts
      .filter((account) => account.type === 'revenue' && account.level > 0)
      .reduce((total, account) => total + Math.abs(account.balance), 0);
  }

  get totalExpenses(): number {
    return this.accounts
      .filter((account) => account.type === 'expense' && account.level > 0)
      .reduce((total, account) => total + Math.abs(account.balance), 0);
  }

  get netIncome(): number {
    return this.totalRevenue - this.totalExpenses;
  }

  get postedEntriesCount(): number {
    return this.entries.filter((entry) => entry.status === 'posted').length;
  }

  get openingDebitTotal(): number {
    return this.openingBalances.reduce((total, row) => total + row.debit, 0);
  }

  get openingCreditTotal(): number {
    return this.openingBalances.reduce((total, row) => total + row.credit, 0);
  }

  get openingBalanceBalanced(): boolean {
    return this.openingDebitTotal === this.openingCreditTotal;
  }

  entryDebit(entry: JournalEntry): number {
    return entry.lines.reduce((total, line) => total + line.debit, 0);
  }

  entryCredit(entry: JournalEntry): number {
    return entry.lines.reduce((total, line) => total + line.credit, 0);
  }

  totalTrial(field: keyof TrialBalanceRow): number {
    return this.trialBalanceRows.reduce((total, row) => {
      const value = row[field];
      return typeof value === 'number' ? total + value : total;
    }, 0);
  }

  sectionTotal(section: IncomeStatementSection): number {
    return section.lines.reduce((total, line) => total + line.amount, 0);
  }

  accountTypeLabel(type: FinanceAccount['type']): string {
    const labels: Record<FinanceAccount['type'], string> = {
      asset: 'أصل',
      liability: 'التزام',
      equity: 'حقوق ملكية',
      revenue: 'إيراد',
      expense: 'مصروف',
    };
    return labels[type];
  }

  journalStatusLabel(status: JournalStatus): string {
    const labels: Record<JournalStatus, string> = {
      posted: 'مرحّل',
      pending: 'معلق',
      draft: 'مسودة',
    };
    return labels[status];
  }

  fiscalYearStatusLabel(status: FiscalYear['status']): string {
    const labels: Record<FiscalYear['status'], string> = {
      open: 'مفتوحة',
      closed: 'مغلقة',
      planned: 'مخططة',
    };
    return labels[status];
  }

  walletIcon(wallet: FinanceWallet): string {
    const icons: Record<FinanceWallet['type'], string> = {
      cash: 'payments',
      bank: 'account_balance',
      payment: 'credit_card',
    };
    return icons[wallet.type];
  }

  getAccountName(accountId: string): string {
    return this.store.getAccountName(accountId);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  showLocalNotice(message: string): void {
    this.notice = message;

    if (this.noticeTimer) {
      clearTimeout(this.noticeTimer);
    }

    this.noticeTimer = setTimeout(() => {
      this.notice = '';
      this.noticeTimer = null;
    }, 2600);
  }

  private isFinancePageKind(value: unknown): value is FinancePageKind {
    return typeof value === 'string' && value in FINANCE_PAGE_META;
  }
}
