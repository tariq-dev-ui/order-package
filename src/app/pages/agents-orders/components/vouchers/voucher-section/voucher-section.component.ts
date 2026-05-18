import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, Input, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DropdownAction } from 'src/app/components/actions-dropdown/actions-dropdown.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';
import { AdminAPIClient, RequestModel, SeroRequestROVViewModel, VoucherDetailsModel } from 'src/app/services/admin.api.client';
import { VoucherTableComponent } from '../voucher-table/voucher-table.component';

type VoucherTabKey = 'vouchers' | 'rov_open' | 'rov_closed';
type VoucherCreateType = 'hotel' | 'visa' | 'catering' | 'transport' | 'ticket';

@Component({
  selector: 'voucher-section',
  standalone: true,
  imports: [CommonModule, VoucherTableComponent, LoadingSpinnerComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Toolbar -->
      <div class="bg-white p-2 ms-2">
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-start gap-4">
          <div class="bg-white p-1 w-full">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <i class="fas fa-ticket-alt text-primary-500"></i>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ 'Quotation' | translate }}</h3>
                  <p class="text-sm text-gray-500">{{ 'Manage and review quotation details' | translate }}</p>
                </div>
              </div>

              <div class="flex flex-wrap gap-3">
                <button type="button" class="px-4 py-2 text-xs rounded-lg border border-gray-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white" (click)="openModal('hotel')"><i class="fas fa-hotel me-1"></i>{{ 'Hotel' | translate }}</button>
                <button type="button" class="px-4 py-2 text-xs rounded-lg border border-gray-200 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white" (click)="openModal('catering')"><i class="fas fa-utensils me-1"></i>{{ 'Catering' | translate }}</button>
                <button type="button" class="px-4 py-2 text-xs rounded-lg border border-gray-200 bg-violet-50 text-violet-600 hover:bg-violet-500 hover:text-white" (click)="openModal('transport')"><i class="fas fa-bus me-1"></i>{{ 'Transport' | translate }}</button>
                <button type="button" class="px-4 py-2 text-xs rounded-lg border border-gray-200 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white" (click)="openModal('visa')"><i class="fas fa-passport me-1"></i>{{ 'Visa' | translate }}</button>
                <button type="button" class="px-4 py-2 text-xs rounded-lg border border-gray-200 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white" (click)="openModal('ticket')"><i class="fas fa-ticket-alt me-1"></i>{{ 'Ticket' | translate }}</button>
                <button type="button" class="px-4 py-2 text-xs rounded-lg border border-gray-200 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white" (click)="openROVsDialog()"><i class="fas fa-hotel me-1"></i>{{ 'RoQ' | translate }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-100">
        <div class="border-b border-gray-100">
          <nav class="flex items-center gap-2 bg-transparent px-3 py-3" role="tablist" [attr.aria-label]="'Quotation tabs' | translate">
            <button type="button" role="tab" [attr.aria-selected]="activeTab() === 'vouchers'" (click)="setActiveTab('vouchers')" [class]="tabButtonClasses('vouchers')" [attr.title]="'Quotations' | translate">
              <i class="fas fa-ticket-alt me-2" aria-hidden="true"></i>
              <span class="truncate">{{ 'Quotations' | translate }}</span>
              <span class="ms-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full" [class]="activeTab() === 'vouchers' ? 'bg-white text-primary-700' : 'bg-primary-100 text-primary-700'">{{ voucherCount() }}</span>
            </button>

            <button type="button" role="tab" [attr.aria-selected]="activeTab() === 'rov_open'" (click)="setActiveTab('rov_open')" [class]="tabButtonClasses('rov_open')" [attr.title]="'Current RoQ' | translate">
              <i class="fas fa-hotel me-2" aria-hidden="true"></i>
              <span class="truncate">{{ 'Current RoQ' | translate }}</span>
              <span class="ms-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full" [class]="activeTab() === 'rov_open' ? 'bg-white text-primary-700' : 'bg-primary-100 text-primary-700'">{{ currentRequestROVCount() }}</span>
            </button>

            <button type="button" role="tab" [attr.aria-selected]="activeTab() === 'rov_closed'" (click)="setActiveTab('rov_closed')" [class]="tabButtonClasses('rov_closed')" [attr.title]="'Closed RoQ' | translate">
              <i class="fas fa-archive me-2" aria-hidden="true"></i>
              <span class="truncate">{{ 'Closed RoQ' | translate }}</span>
              <span class="ms-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full" [class]="activeTab() === 'rov_closed' ? 'bg-white text-primary-700' : 'bg-primary-100 text-primary-700'">{{ closedRequestROVCount() }}</span>
            </button>
          </nav>
        </div>

        <div class="p-5">
          @if (activeTab() === 'vouchers') {
            <div class="relative">
              <loading-spinner [isLoading]="isLoading()" [message]="'Loading Quotations...' | translate" />
              <voucher-table [vouchers]="vouchers()" [voucherActionsList]="voucherActionsList()" (refreshVouchers)="refreshVouchersList()" />
            </div>
          }

          @if (activeTab() === 'rov_open') {
            <div class="relative">
              <loading-spinner [isLoading]="isLoadingROVs()" [message]="'Loading RoQ requests...' | translate" />
              <ng-container *ngTemplateOutlet="rovTable; context: { rows: currentRequestROVData() }"></ng-container>
            </div>
          }

          @if (activeTab() === 'rov_closed') {
            <div class="relative">
              <loading-spinner [isLoading]="isLoadingROVs()" [message]="'Loading RoQ requests...' | translate" />
              <ng-container *ngTemplateOutlet="rovTable; context: { rows: closedRequestROVData() }"></ng-container>
            </div>
          }
        </div>
      </div>

      <ng-template #rovTable let-rows="rows">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{{ 'RoQ No.' | translate }}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{{ 'Provider' | translate }}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{{ 'Status' | translate }}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{{ 'Price' | translate }}</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{{ 'Date' | translate }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (row of rows; track row.RequestROVID) {
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">#{{ row.RequestROVID }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ row.ProviderName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">
                    <span class="px-2 py-1 rounded-full border text-xs" [class]="row.IsClosed ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'">
                      {{ row.IsClosed ? ('Closed' | translate) : ('Open' | translate) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ row.Price | number }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ row.AddedDate | date:'mediumDate' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">{{ 'No RoQ requests found' | translate }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </ng-template>

      <br />
    </div>
  `,
})
export class VoucherSectionComponent {
  private readonly adminAPIClient = inject(AdminAPIClient);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  @Input() requestId!: number;
  @Input() agentId!: number;
  @Input() request?: RequestModel;

  private hasLoadedVouchers = signal(false);
  private hasLoadedROVs = signal(false);

  private _isExpanded = false;
  @Input()
  set isExpanded(value: boolean) {
    if (value && !this._isExpanded) {
      if (!this.hasLoadedVouchers()) {
        this.loadVouchers();
        this.hasLoadedVouchers.set(true);
      }
      if (!this.hasLoadedROVs()) {
        this.loadRovRequestsByRequestId();
        this.hasLoadedROVs.set(true);
      }
    }
    this._isExpanded = value;
  }
  get isExpanded(): boolean {
    return this._isExpanded;
  }

  vouchers = signal<VoucherDetailsModel[]>([]);
  requestROVData = signal<SeroRequestROVViewModel[]>([]);
  activeTab = signal<VoucherTabKey>('vouchers');
  isLoading = signal(false);
  isLoadingROVs = signal(false);

  voucherCount = computed(() => this.vouchers().length);
  currentRequestROVData = computed(() => this.requestROVData().filter(rov => !rov.IsClosed));
  closedRequestROVData = computed(() => this.requestROVData().filter(rov => rov.IsClosed));
  currentRequestROVCount = computed(() => this.currentRequestROVData().length);
  closedRequestROVCount = computed(() => this.closedRequestROVData().length);

  voucherActionsList(): DropdownAction[] {
    return [
      { label: this.translate.instant('View Quotation Details'), value: 'voucher_details' },
      { label: this.translate.instant('Agent Details'), value: 'agent_details' },
      { label: this.translate.instant('Request Details'), value: 'request_details' },
      { label: this.translate.instant('Admin Log'), value: 'voucher_admin_log' },
      { label: this.translate.instant('Agent Log'), value: 'voucher_agent_log' },
      { label: this.translate.instant('Download Quotation PDF'), value: 'download_voucher_pdf' },
      { label: this.translate.instant('Send to Agent'), value: 'voucher_status_change', status: 2 },
      { label: this.translate.instant('Account Manager Approval'), value: 'voucher_status_change', status: 4 },
    ];
  }

  setActiveTab(tab: VoucherTabKey): void {
    this.activeTab.set(tab);
    if (tab === 'vouchers' && !this.hasLoadedVouchers()) {
      this.loadVouchers();
      this.hasLoadedVouchers.set(true);
    }
    if ((tab === 'rov_open' || tab === 'rov_closed') && !this.hasLoadedROVs()) {
      this.loadRovRequestsByRequestId();
      this.hasLoadedROVs.set(true);
    }
  }

  tabButtonClasses(tab: VoucherTabKey): string {
    const base = 'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300';
    return this.activeTab() === tab
      ? `${base} bg-primary-500 text-white shadow-sm ring-1 ring-primary-200`
      : `${base} text-gray-700 bg-white/0 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200`;
  }

  loadVouchers(): void {
    if (!this.requestId || !this.agentId || this.isLoading()) return;
    this.isLoading.set(true);
    this.adminAPIClient.getVoucherByRequestId({ requestId: this.requestId, agentId: this.agentId }).subscribe({
      next: data => this.vouchers.set(data ?? []),
      error: () => this.vouchers.set([]),
      complete: () => this.isLoading.set(false),
    });
  }

  loadRovRequestsByRequestId(): void {
    if (!this.requestId || this.isLoadingROVs()) return;
    this.isLoadingROVs.set(true);
    this.adminAPIClient.getROVsByRequestId({ requestID: this.requestId }).subscribe({
      next: data => this.requestROVData.set(data.ReturnedValue ?? []),
      error: () => this.requestROVData.set([]),
      complete: () => this.isLoadingROVs.set(false),
    });
  }

  openModal(type: VoucherCreateType): void {
    const ref = this.dialog.open(VoucherCreateDialogComponent, {
      width: '860px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: { type, requestId: this.requestId, agentId: this.agentId, request: this.request },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.refreshAfterVoucherCreation();
      }
    });
  }

  openROVsDialog(): void {
    this.setActiveTab('rov_open');
    if (!this.hasLoadedROVs()) {
      this.loadRovRequestsByRequestId();
      this.hasLoadedROVs.set(true);
    }
  }

  refreshVouchersList(): void {
    this.loadVouchers();
  }

  refreshAfterVoucherCreation(): void {
    this.activeTab.set('vouchers');
    this.hasLoadedVouchers.set(true);
    this.loadVouchers();
  }
}

@Component({
  selector: 'voucher-create-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, LoadingSpinnerComponent, TranslateModule],
  template: `
    <div class="relative overflow-hidden">
      <loading-spinner [isLoading]="isSubmitting()" [message]="'Saving quotation...' | translate" />
      <div class="flex items-center gap-3 p-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas" [class]="iconClass"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold">{{ title | translate }}</h2>
          <p class="text-sm text-gray-500">{{ 'Fill in quotation details' | translate }}</p>
        </div>
        <button type="button" (click)="cancel()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="max-h-[65vh] overflow-y-auto custom-scroll p-5 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1">{{ 'Count' | translate }}</span>
              <input type="number" min="1" formControlName="Count" class="w-full p-3 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-500">
            </label>
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1">{{ 'Tax' | translate }} %</span>
              <input type="number" min="0" formControlName="Tax" class="w-full p-3 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-500">
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1">{{ 'Cost Unit Price' | translate }}</span>
              <input type="number" min="0" formControlName="CostUnitPrice" class="w-full p-3 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-500">
            </label>
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1">{{ 'Original Unit Price' | translate }}</span>
              <input type="number" min="0" formControlName="OriginalUnitPrice" class="w-full p-3 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-500">
            </label>
            <label class="block">
              <span class="block text-sm font-medium text-gray-700 mb-1">{{ 'Selling Unit Price' | translate }}</span>
              <input type="number" min="0" formControlName="SellingUnitPrice" class="w-full p-3 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-500">
            </label>
          </div>

          <div class="rounded-lg bg-primary-50 border border-primary-100 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div class="text-xs text-gray-500">{{ 'Subtotal' | translate }}</div>
              <div class="text-lg font-semibold">{{ subtotal() | number }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">{{ 'Tax Amount' | translate }}</div>
              <div class="text-lg font-semibold">{{ taxAmount() | number }}</div>
            </div>
            <div>
              <div class="text-xs text-gray-500">{{ 'Total' | translate }}</div>
              <div class="text-lg font-semibold text-primary-700">{{ total() | number }}</div>
            </div>
          </div>

          <label class="block">
            <span class="block text-sm font-medium text-gray-700 mb-1">{{ 'Notes' | translate }}</span>
            <textarea formControlName="Notes" rows="3" class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"></textarea>
          </label>
        </div>

        <hr class="border-gray-100">
        <div class="flex justify-end gap-3 p-5">
          <button type="button" (click)="cancel()" class="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <i class="fas fa-times"></i>
            <span>{{ 'CANCEL' | translate }}</span>
          </button>
          <button type="submit" [disabled]="form.invalid || isSubmitting()" class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
            <span>{{ 'CONFIRM' | translate }}</span>
            <i class="fas fa-check"></i>
          </button>
        </div>
      </form>
    </div>
  `,
})
export class VoucherCreateDialogComponent {
  private readonly api = inject(AdminAPIClient);
  private readonly dialogRef = inject(MatDialogRef<VoucherCreateDialogComponent>);

  isSubmitting = signal(false);

  form = new FormGroup({
    Count: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    CostUnitPrice: new FormControl<number>(120, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    OriginalUnitPrice: new FormControl<number>(140, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    SellingUnitPrice: new FormControl<number>(180, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    Tax: new FormControl<number>(15, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    Notes: new FormControl<string>('', { nonNullable: true }),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { type: VoucherCreateType; requestId: number; agentId: number; request?: RequestModel },
  ) {}

  get title(): string {
    return ({
      hotel: 'Hotel Quotation',
      visa: 'Visa Quotation',
      catering: 'Catering Quotation',
      transport: 'Transport Quotation',
      ticket: 'Ticket Quotation',
    } as Record<VoucherCreateType, string>)[this.data.type];
  }

  get iconClass(): string {
    return ({
      hotel: 'fa-hotel',
      visa: 'fa-passport',
      catering: 'fa-utensils',
      transport: 'fa-bus',
      ticket: 'fa-ticket-alt',
    } as Record<VoucherCreateType, string>)[this.data.type];
  }

  subtotal(): number {
    return (Number(this.form.controls.Count.value) || 0) * (Number(this.form.controls.SellingUnitPrice.value) || 0);
  }

  taxAmount(): number {
    return this.subtotal() * ((Number(this.form.controls.Tax.value) || 0) / 100);
  }

  total(): number {
    return this.subtotal() + this.taxAmount();
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = [{ ...this.form.getRawValue() }];
    const params = { requestId: this.data.requestId, agentId: this.data.agentId, body };
    const source = this.data.type === 'hotel'
      ? this.api.createHotelVoucher(params)
      : this.data.type === 'transport'
        ? this.api.createTransportationVoucher(params)
        : this.data.type === 'visa'
          ? this.api.createVisaVoucher(params)
          : this.data.type === 'catering'
            ? this.api.createCateringVoucher(params)
            : this.api.createTicketVoucher(params);

    this.isSubmitting.set(true);
    this.form.disable();
    source.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.isSubmitting.set(false);
        this.form.enable();
      },
      complete: () => this.isSubmitting.set(false),
    });
  }
}
