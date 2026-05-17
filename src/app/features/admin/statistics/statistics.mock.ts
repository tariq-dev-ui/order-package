export interface StatisticsSummaryItem {
  title: string;
  value: number;
  metaLabel: string;
  metaValue: number;
  icon: string;
}

export interface QuickActionItem {
  title: string;
  subtitle: string;
  icon: string;
}

export interface LatestOrderItem {
  id: number;
  title: string;
  subValue: string;
  timeAgo: string;
  travelers: string;
  tag: 'New' | 'InProgress';
}

export type OfferType = 'hotel' | 'food' | 'ticket' | 'trip';
export type OfferStatus = 'Finance Approved' | 'Need Approval' | 'In Progress';

export interface PriceOfferItem {
  type: OfferType;
  orderNumber: string;
  offerCode: string;
  date: string;
  price: number;
  adminStatus: OfferStatus;
  agentStatus: OfferStatus;
}

export const SUMMARY_ITEMS: StatisticsSummaryItem[] = [
  { title: 'الطلبات الحالية', value: 143, metaLabel: 'إجمالي الطلبات', metaValue: 143, icon: 'assignment' },
  { title: 'إجمالي الوكلاء', value: 13, metaLabel: 'الدول', metaValue: 3, icon: 'supervisor_account' },
  { title: 'عروض الأسعار الحالية', value: 110, metaLabel: 'عروض الأسعار المعلقة', metaValue: 0, icon: 'request_quote' },
  { title: 'الباقات النشطة', value: 67, metaLabel: 'إجمالي الباقات', metaValue: 85, icon: 'inventory_2' }
];

export const QUICK_ACTIONS: QuickActionItem[] = [
  { title: 'إنشاء الباقة', subtitle: 'إضافة باقة جديدة للنظام', icon: 'add_box' },
  { title: 'إضافة وكيل', subtitle: 'تسجيل وكيل جديد', icon: 'person_add' },
  { title: 'إضافة فندق', subtitle: 'إدراج فندق ضمن الخدمة', icon: 'apartment' },
  { title: 'إضافة نقل', subtitle: 'إضافة وسيلة نقل', icon: 'airport_shuttle' }
];

export const LATEST_ORDERS: LatestOrderItem[] = [
  {
    id: 173,
    title: 'إقامة عمرة في مكة - أغسطس 2025',
    subValue: 'قيد التقدير',
    timeAgo: 'قبل يوم واحد',
    travelers: '10 مسافرين',
    tag: 'New'
  },
  {
    id: 172,
    title: 'Umrah Package July 2026',
    subValue: 'قيد التقدير',
    timeAgo: 'قبل يوم واحد',
    travelers: '20 مسافرين',
    tag: 'New'
  },
  {
    id: 170,
    title: '4x Packages',
    subValue: '1425 R',
    timeAgo: '3 أيام مضت',
    travelers: '1 مسافرين',
    tag: 'New'
  },
  {
    id: 169,
    title: 'Package For 6 Guests',
    subValue: '3000 R',
    timeAgo: '5 أيام مضت',
    travelers: '10 مسافرين',
    tag: 'InProgress'
  },
  {
    id: 168,
    title: 'Package For 6 Guests',
    subValue: '3000 R',
    timeAgo: '10 أيام مضت',
    travelers: '2 مسافرين',
    tag: 'InProgress'
  }
];

export const LATEST_PRICE_OFFERS: PriceOfferItem[] = [
  {
    type: 'hotel',
    orderNumber: 'ORD-2026-00143',
    offerCode: 'OFF-H-9201',
    date: '2026-05-11',
    price: 4800,
    adminStatus: 'Finance Approved',
    agentStatus: 'In Progress'
  },
  {
    type: 'food',
    orderNumber: 'ORD-2026-00142',
    offerCode: 'OFF-F-4022',
    date: '2026-05-10',
    price: 1350,
    adminStatus: 'Need Approval',
    agentStatus: 'Need Approval'
  },
  {
    type: 'ticket',
    orderNumber: 'ORD-2026-00141',
    offerCode: 'OFF-T-8830',
    date: '2026-05-09',
    price: 2600,
    adminStatus: 'Finance Approved',
    agentStatus: 'Finance Approved'
  },
  {
    type: 'trip',
    orderNumber: 'ORD-2026-00140',
    offerCode: 'OFF-R-2034',
    date: '2026-05-08',
    price: 1900,
    adminStatus: 'In Progress',
    agentStatus: 'In Progress'
  },
  {
    type: 'hotel',
    orderNumber: 'ORD-2026-00139',
    offerCode: 'OFF-H-9012',
    date: '2026-05-08',
    price: 3550,
    adminStatus: 'Need Approval',
    agentStatus: 'In Progress'
  }
];
