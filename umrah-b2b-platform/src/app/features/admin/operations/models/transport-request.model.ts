import { OperationVoucher } from './operation-voucher.model';

export interface TransportRequest extends OperationVoucher {
  RequestVoucherTypeID: 2;
}
