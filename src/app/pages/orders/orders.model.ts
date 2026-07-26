export type OrderType = 'hotel' | 'transportation' | 'visa' | 'catering' | 'ticket' | 'custom';
export type OrderTypeFilter = OrderType | 'all';

export type PaymentStatus = 'paid' | 'partially_paid' | 'unpaid';
export type OperationStatus = 'preparing' | 'account_manager_approved' | 'operation_approved' | 'rejected';
export type AgentStatus = 'preparing' | 'in_progress' | 'completed' | 'cancelled';

export interface OrderRow {
  id: number;
  type: OrderType;
  orderNo: string;
  orderDate: string;
  agent: string;
  totalPrice: number;
  paid: number;
  remaining: number;
  paymentStatus: PaymentStatus;
  operationStatus: OperationStatus;
  agentStatus: AgentStatus;
}

export interface OrdersQuery {
  typeFilter: OrderTypeFilter;
  search: string;
  pageIndex: number;
  pageSize: number;
  paymentStatus?: PaymentStatus | null;
  operationStatus?: OperationStatus | null;
  agentStatus?: AgentStatus | null;
}

export interface OrdersPage {
  rows: OrderRow[];
  total: number;
}

export interface StatusMeta {
  labelKey: string;
  cls: 'success' | 'warning' | 'danger' | 'info' | 'muted';
}

export const ORDER_TYPE_META: { type: OrderTypeFilter; labelKey: string; icon: string }[] = [
  { type: 'all', labelKey: 'orders.types.all', icon: 'shopping_cart' },
  { type: 'hotel', labelKey: 'orders.types.hotel', icon: 'hotel' },
  { type: 'transportation', labelKey: 'orders.types.transportation', icon: 'directions_bus' },
  { type: 'visa', labelKey: 'orders.types.visa', icon: 'badge' },
  { type: 'catering', labelKey: 'orders.types.catering', icon: 'restaurant' },
  { type: 'ticket', labelKey: 'orders.types.ticket', icon: 'confirmation_number' },
  { type: 'custom', labelKey: 'orders.types.custom', icon: 'miscellaneous_services' },
];

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  paid: { labelKey: 'orders.payment.paid', cls: 'success' },
  partially_paid: { labelKey: 'orders.payment.partial', cls: 'warning' },
  unpaid: { labelKey: 'orders.payment.unpaid', cls: 'danger' },
};

export const OPERATION_STATUS_META: Record<OperationStatus, StatusMeta> = {
  preparing: { labelKey: 'orders.operation.preparing', cls: 'info' },
  account_manager_approved: { labelKey: 'orders.operation.amApproved', cls: 'warning' },
  operation_approved: { labelKey: 'orders.operation.opApproved', cls: 'success' },
  rejected: { labelKey: 'orders.operation.rejected', cls: 'danger' },
};

export const AGENT_STATUS_META: Record<AgentStatus, StatusMeta> = {
  preparing: { labelKey: 'orders.agentStatus.preparing', cls: 'muted' },
  in_progress: { labelKey: 'orders.agentStatus.inProgress', cls: 'info' },
  completed: { labelKey: 'orders.agentStatus.completed', cls: 'success' },
  cancelled: { labelKey: 'orders.agentStatus.cancelled', cls: 'danger' },
};
