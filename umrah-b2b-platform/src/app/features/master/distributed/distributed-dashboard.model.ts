export interface DashboardRequestModel {
  Id?: number;
  StatusId?: number;
  StatusName?: string | null;
  AddedDate?: Date;
  PassengerCount?: number;
  Title?: string | null;
  Price?: number;
}

export interface DashboardVoucherModel {
  RequestVoucherID?: number;
  RequestVoucherCode?: string | null;
  SeroPackageRequestID?: number;
  RequestVoucherTypeID?: number | null;
  VoucherStatusForAgentID?: number | null;
  VoucherStatusForAdminID?: number | null;
  VoucherStatusForAgentTitle?: string | null;
  VoucherStatusForAdminTitle?: string | null;
  TotalSellingPrice?: number;
  TotalTax?: number;
  AddedDate?: Date;
}

export interface DashboardVoucherDetailsModel {
  Voucher?: DashboardVoucherModel;
}

export interface DropdownAction {
  label: string;
  value: string;
  status?: number;
}
