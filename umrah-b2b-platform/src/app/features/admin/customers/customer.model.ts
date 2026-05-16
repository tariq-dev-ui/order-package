export type CustomerStatus = 'active' | 'inactive';

export interface CustomerModel {
  id: string;
  name: string;
  phoneNumber: string;
  country: string;
  city: string;
  district: string;
  status: CustomerStatus;
}

export type CustomerFormValue = Omit<CustomerModel, 'id'>;

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active: 'فعال',
  inactive: 'غير فعال',
};
