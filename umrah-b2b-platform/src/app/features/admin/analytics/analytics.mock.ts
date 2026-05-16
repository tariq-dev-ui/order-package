import { mockCateringRequests } from '../operations/mocks/catering-requests.mock';
import { mockFlightRequests } from '../operations/mocks/flight-requests.mock';
import { mockHotelBookings } from '../operations/mocks/hotel-bookings.mock';
import { mockTransportRequests } from '../operations/mocks/transport-requests.mock';
import { mockVisaRequests } from '../operations/mocks/visa-requests.mock';
import { AnalyticsRequest, AnalyticsSummary, AnalyticsVoucher } from './analytics.model';

// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
export const mockAnalyticsSummary: AnalyticsSummary = {
  currentRequestsCount: 18,
  totalRequestsCount: 126,
  currentAgentsCount: 42,
  totalAgentCountryCount: 11,
  currentVouchersCount: 27,
  closedVouchersCount: 94,
  activePackagesCount: 16,
  totalPackagesCount: 35,
};

// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
export const mockAnalyticsRequests: AnalyticsRequest[] = [
  {
    Id: 9107,
    Title: 'ramadan premium umrah - 12 nights',
    Price: 68400,
    AddedDate: '2026-05-16T08:35:00',
    PassengerCount: 16,
    StatusName: 'In Progress',
    SeroPackageId: 401,
  },
  {
    Id: 9106,
    Title: 'summer umrah economy',
    Price: 24750,
    AddedDate: '2026-05-15T18:20:00',
    PassengerCount: 8,
    StatusName: 'Pending',
    SeroPackageId: 402,
  },
  {
    Id: 9105,
    Title: 'family umrah visa batch',
    Price: 0,
    AddedDate: '2026-05-14T10:15:00',
    PassengerCount: 12,
    StatusName: 'New',
    SeroPackageId: 403,
  },
  {
    Id: 9104,
    Title: 'istanbul group flight package',
    Price: 53200,
    AddedDate: '2026-05-12T15:50:00',
    PassengerCount: 20,
    StatusName: 'Confirmed',
    SeroPackageId: 404,
  },
  {
    Id: 9103,
    Title: 'makkah catering add-on',
    Price: 18600,
    AddedDate: '2026-05-10T09:10:00',
    PassengerCount: 30,
    StatusName: 'Completed',
    SeroPackageId: 405,
  },
];

// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
export const mockAnalyticsVouchers: AnalyticsVoucher[] = [
  mockHotelBookings[0].Voucher,
  mockTransportRequests[0].Voucher,
  mockVisaRequests[0].Voucher,
  mockCateringRequests[0].Voucher,
  mockFlightRequests[0].Voucher,
];
