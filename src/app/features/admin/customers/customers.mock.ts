import { CustomerModel } from './customer.model';

export const CUSTOMER_ITEMS_PER_PAGE = 5;

export const CUSTOMERS_ROWS: CustomerModel[] = [
  {
    id: 'customer-001',
    name: 'Mahmood Yar',
    phoneNumber: '556456456456',
    country: 'Saudi Arabia',
    city: 'Makkah',
    district: 'Al-Aziziyah',
    status: 'active',
  },
  {
    id: 'customer-002',
    name: 'Mohammed alqmase',
    phoneNumber: '0777791139',
    country: 'Saudi Arabia',
    city: 'Makkah',
    district: 'Al-Aziziyah',
    status: 'active',
  },
  {
    id: 'customer-003',
    name: 'Abdullah Mansoor',
    phoneNumber: '0596393205',
    country: 'غير متوفر',
    city: 'Madianh',
    district: 'Quba',
    status: 'active',
  },
];
