import { OperationVoucher } from '../operations/models/operation-voucher.model';

export interface AnalyticsSummary {
  currentRequestsCount: number;
  totalRequestsCount: number;
  currentAgentsCount: number;
  totalAgentCountryCount: number;
  currentVouchersCount: number;
  closedVouchersCount: number;
  activePackagesCount: number;
  totalPackagesCount: number;
}

export interface AnalyticsRequest {
  Id: number;
  Title: string;
  Price: number;
  AddedDate: string;
  PassengerCount: number;
  StatusName: 'New' | 'Confirmed' | 'Pending' | 'Completed' | 'In Progress' | 'Cancelled';
  SeroPackageId?: number;
}

export type AnalyticsVoucher = OperationVoucher;
