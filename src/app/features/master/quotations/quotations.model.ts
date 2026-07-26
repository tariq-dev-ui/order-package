export type QuotationType = 'hotel' | 'transportation' | 'visa' | 'catering' | 'ticket' | 'custom';
export type QuotationTypeFilter = QuotationType | 'all';

export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid';
export type OperationStatus = 'preparing' | 'account_manager_approved' | 'operation_approved' | 'rejected';
export type AgentStatus = 'preparing' | 'in_progress' | 'completed' | 'cancelled';

export interface QuotationRow {
  id: number;
  type: QuotationType;
  quotationNo: string;
  quotationDate: string;
  agent: string;
  totalPrice: number;
  paid: number;
  remaining: number;
  paymentStatus: PaymentStatus;
  operationStatus: OperationStatus;
  agentStatus: AgentStatus;
}

export interface QuotationsQuery {
  typeFilter: QuotationTypeFilter;
  search: string;
  pageIndex: number;
  pageSize: number;
  paymentStatus?: PaymentStatus | null;
  operationStatus?: OperationStatus | null;
  agentStatus?: AgentStatus | null;
}

export interface QuotationsPage {
  rows: QuotationRow[];
  total: number;
}

export interface StatusMeta {
  labelKey: string;
  cls: 'success' | 'warning' | 'danger' | 'info' | 'muted';
}

export const QUOTATION_TYPE_META: { type: QuotationTypeFilter; labelKey: string; icon: string }[] = [
  { type: 'all', labelKey: 'quotations.types.all', icon: 'receipt_long' },
  { type: 'hotel', labelKey: 'quotations.types.hotel', icon: 'hotel' },
  { type: 'transportation', labelKey: 'quotations.types.transportation', icon: 'directions_bus' },
  { type: 'visa', labelKey: 'quotations.types.visa', icon: 'badge' },
  { type: 'catering', labelKey: 'quotations.types.catering', icon: 'restaurant' },
  { type: 'ticket', labelKey: 'quotations.types.ticket', icon: 'confirmation_number' },
  { type: 'custom', labelKey: 'quotations.types.custom', icon: 'miscellaneous_services' },
];

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  paid: { labelKey: 'quotations.payment.paid', cls: 'success' },
  partially_paid: { labelKey: 'quotations.payment.partial', cls: 'warning' },
  unpaid: { labelKey: 'quotations.payment.unpaid', cls: 'danger' },
};

export const OPERATION_STATUS_META: Record<OperationStatus, StatusMeta> = {
  preparing: { labelKey: 'quotations.operation.preparing', cls: 'info' },
  account_manager_approved: { labelKey: 'quotations.operation.amApproved', cls: 'warning' },
  operation_approved: { labelKey: 'quotations.operation.opApproved', cls: 'success' },
  rejected: { labelKey: 'quotations.operation.rejected', cls: 'danger' },
};

export const AGENT_STATUS_META: Record<AgentStatus, StatusMeta> = {
  preparing: { labelKey: 'quotations.agentStatus.preparing', cls: 'muted' },
  in_progress: { labelKey: 'quotations.agentStatus.inProgress', cls: 'info' },
  completed: { labelKey: 'quotations.agentStatus.completed', cls: 'success' },
  cancelled: { labelKey: 'quotations.agentStatus.cancelled', cls: 'danger' },
};
