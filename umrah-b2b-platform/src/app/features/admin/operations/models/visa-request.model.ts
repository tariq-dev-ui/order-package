import { OperationVoucher } from './operation-voucher.model';

export interface VisaRequest extends OperationVoucher {
  RequestVoucherTypeID: 3;
}
