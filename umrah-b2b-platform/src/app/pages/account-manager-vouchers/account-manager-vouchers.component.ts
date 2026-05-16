import { ChangeDetectionStrategy, Component, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";

interface RequestVoucherModel {
  id?: number;
}

interface DropdownAction {
  label: string;
  value: string;
  status?: number;
}

@Component({
  selector: 'account-manager-vouchers',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div *ngIf="isLoading()" class="flex justify-center py-8">
        <div class="text-lg">Loading Account Manager Vouchers...</div>
      </div>
      <div *ngIf="!isLoading()" class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b">
          <h2 class="text-xl font-semibold">Account Manager Vouchers</h2>
        </div>
        <div class="p-6">
          <p class="text-gray-600">{{ vouchers().length }} vouchers found.</p>
        </div>
      </div>
    </div>
  `
})
export class AccountManagerVouchersComponent {
  readonly  typeIds = [1,2,3,4];
  isLoading = signal(false);

  readonly voucherActionsList: DropdownAction[] = [
      { label: 'View Details', value: 'voucher_details' },
      { label: 'Admin Log', value: 'voucher_admin_log' }, 
      { label: 'Agent Log', value: 'voucher_agent_log' }, 
      { label: 'Send to Agent', value: 'voucher_status_change', status: 2 },
      { label: 'Account Manager Approval', value: 'voucher_status_change', status: 4 },
      // { label: 'Operation Approval', value: 'voucher_status_change', status: 5 },
      // { label: 'Finance Approval', value: 'voucher_status_change', status: 6 },
      // { label: 'Issue', value: 'voucher_status_change', status: 7 },
    ];

  readonly vouchers = signal<RequestVoucherModel[] | []>([]);

  ngOnInit() {
    this.loadVouchers();
  }

  loadVouchers() {
    this.isLoading.set(true);
    // this.voucherService.getVouchers()
    //   .subscribe(data => {
    //     // this.vouchers.set(data);
    //     this.isLoading.set(false);  
    //     console.log('Vouchers loaded:', this.vouchers());
    //   });
  }

  refreshVouchersList() {
    console.log('Refreshing vouchers list...');
    this.loadVouchers();
  }
}
