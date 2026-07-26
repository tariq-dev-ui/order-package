import { CommonModule } from '@angular/common';
import { Component, Input, Signal, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ActionsDropdownComponent } from '../../../../components/actions-dropdown/actions-dropdown.component';
import { GeneralVoucherTableComponent } from '../../operations/components/general-voucher-table/general-voucher-table.component';
import { LoadingSpinnerComponent } from '../../operations/components/loading-spinner/loading-spinner.component';
import { OperationVoucher } from '../../operations/models/operation-voucher.model';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';

@Component({
  selector: 'dashboard-vouchers',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ActionsDropdownComponent, TranslateModule, SeroCurrencyPipe],
  templateUrl: './dashboard-vouchers.component.html',
})
export class DashboardVouchersComponent extends GeneralVoucherTableComponent {
  @Input() isLoadingVoucher: Signal<boolean> = signal(false);

  override getVoucherActionsList(status: number) {
    return super.getVoucherActionsList(status).filter((action) => action.value !== 'voucher_status_change');
  }

  trackVoucher(_index: number, voucher: OperationVoucher): number {
    return voucher.RequestVoucherID;
  }
}
