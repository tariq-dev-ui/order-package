import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mockCateringRequests } from './mocks/catering-requests.mock';
import { mockFlightRequests } from './mocks/flight-requests.mock';
import { mockHotelBookings } from './mocks/hotel-bookings.mock';
import { mockTransportRequests } from './mocks/transport-requests.mock';
import { mockVisaRequests } from './mocks/visa-requests.mock';
import {
  OperationAgent,
  OperationAgentRepresentative,
  OperationRequest,
  OperationVoucher,
  OperationVoucherDetails,
  OperationVoucherTypeId,
  PdfReportResult,
  VoucherStatusLog,
} from './models/operation-voucher.model';

type ApprovalProps = { voucherID?: number; agentId?: number; notes?: string };
type VoucherQueryProps = { pageIndex?: number; pageSize?: number; typeid?: number; agentId?: number };

@Injectable({ providedIn: 'root' })
export class OperationsMockService {
  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  private readonly voucherDetails = signal<OperationVoucherDetails[]>([
    ...mockHotelBookings,
    ...mockTransportRequests,
    ...mockVisaRequests,
    ...mockCateringRequests,
    ...mockFlightRequests,
  ]);

  private readonly agents: OperationAgent[] = [
    {
      AgentID: 501,
      AgentCode: 'AG-501',
      AgentName: 'Al Noor Travel',
      AgentEmail: 'ops@alnoor.example',
      CR_NO: '1010456789',
      CountryName: 'Saudi Arabia',
      CityName: 'Makkah',
      IsActive: true,
      AddedDate: '2025-11-18',
      MasterAgentName: 'Sero Master Network',
      Address: 'Makkah, Ibrahim Al Khalil Road',
      Description: 'Premium Umrah operator handling hotel and visa requests.',
    },
    {
      AgentID: 502,
      AgentCode: 'AG-502',
      AgentName: 'Safwa Tours',
      AgentEmail: 'bookings@safwa.example',
      CR_NO: '1010987344',
      CountryName: 'Saudi Arabia',
      CityName: 'Jeddah',
      IsActive: true,
      AddedDate: '2025-10-04',
      MasterAgentName: 'Sero Master Network',
      Address: 'Jeddah, Al Hamra District',
    },
    {
      AgentID: 503,
      AgentCode: 'AG-503',
      AgentName: 'Rahma Group',
      AgentEmail: 'travel@rahma.example',
      CR_NO: '1010774121',
      CountryName: 'Egypt',
      CityName: 'Cairo',
      IsActive: true,
      AddedDate: '2026-01-09',
      MasterAgentName: 'Global Umrah Partners',
    },
    {
      AgentID: 504,
      AgentCode: 'AG-504',
      AgentName: 'Mawasim Agency',
      AgentEmail: 'tickets@mawasim.example',
      CR_NO: '1010559012',
      CountryName: 'Turkey',
      CityName: 'Istanbul',
      IsActive: true,
      AddedDate: '2026-02-21',
      MasterAgentName: 'Global Umrah Partners',
    },
  ];

  private readonly representatives: Record<number, OperationAgentRepresentative[]> = {
    501: [
      { Name: 'Yousef Al Harbi', Email: 'yousef@alnoor.example', Mobile: '+966500001101', IsActive: true, AddedDate: '2025-12-01' },
      { Name: 'Noura Saleh', Email: 'noura@alnoor.example', Mobile: '+966500001102', IsActive: true, AddedDate: '2026-01-17' },
    ],
    502: [
      { Name: 'Faisal Omar', Email: 'faisal@safwa.example', Mobile: '+966500002201', IsActive: true, AddedDate: '2025-10-08' },
    ],
    503: [
      { Name: 'Mona Hassan', Email: 'mona@rahma.example', Mobile: '+201000003301', IsActive: true, AddedDate: '2026-02-02' },
    ],
    504: [
      { Name: 'Emre Kaya', Email: 'emre@mawasim.example', Mobile: '+905000004401', IsActive: true, AddedDate: '2026-03-05' },
    ],
  };

  private readonly requests: OperationRequest[] = [
    {
      RequestID: 9001,
      RequestCode: 'REQ-2026-9001',
      AgentID: 501,
      AgentName: 'Al Noor Travel',
      PackageTitle: 'Ramadan Premium Umrah - 12 Nights',
      PaxCount: 16,
      TravelDate: '2026-06-03',
      ReturnDate: '2026-06-12',
      StatusTitle: 'Quotation Review',
      Notes: 'Guest group requires adjacent rooms where possible.',
      Services: ['Hotels', 'Visa', 'Transport', 'Catering'],
    },
    {
      RequestID: 9002,
      RequestCode: 'REQ-2026-9002',
      AgentID: 502,
      AgentName: 'Safwa Tours',
      PackageTitle: 'Summer Umrah Economy',
      PaxCount: 8,
      TravelDate: '2026-07-15',
      ReturnDate: '2026-07-20',
      StatusTitle: 'Draft Quotation',
      Services: ['Hotels', 'Transport'],
    },
    {
      RequestID: 9003,
      RequestCode: 'REQ-2026-9003',
      AgentID: 503,
      AgentName: 'Rahma Group',
      PackageTitle: 'Family Umrah Visa Batch',
      PaxCount: 12,
      TravelDate: '2026-06-22',
      ReturnDate: '2026-06-30',
      StatusTitle: 'Quotation Review',
      Services: ['Visa'],
    },
  ];

  private readonly logs: Record<number, { admin: VoucherStatusLog[]; agent: VoucherStatusLog[] }> = {};

  getVouchersForOperationApproval(props: VoucherQueryProps): Observable<OperationVoucher[]> {
    const pageIndex = Math.max(0, props.pageIndex ?? 0);
    const pageSize = Math.max(1, props.pageSize ?? 10);
    const filtered = this.filteredVouchers(props);
    return of(filtered.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize));
  }

  getVouchersForOperationApprovalCount(props: Pick<VoucherQueryProps, 'typeid' | 'agentId'>): Observable<number> {
    return of(this.filteredVouchers(props).length);
  }

  getVoucherById(props: { voucherId?: number; agentId?: number }): Observable<OperationVoucherDetails | null> {
    const details = this.findVoucherDetails(props.voucherId, props.agentId);
    return of(details ? this.cloneDetails(details) : null);
  }

  approveVoucherFromOperation(props: ApprovalProps): Observable<void> {
    this.applyAdminStatus(props, 5, 'Operation Approved');
    return of(void 0);
  }

  getVoucherStatusLogForAdmin(props: { voucherID?: number; agentId?: number }): Observable<VoucherStatusLog[]> {
    return of(this.ensureLogs(props.voucherID).admin);
  }

  getVoucherStatusLogForAgent(props: { voucherID?: number; agentId?: number }): Observable<VoucherStatusLog[]> {
    return of(this.ensureLogs(props.voucherID).agent);
  }

  getAgent(props: { agentID?: number }): Observable<OperationAgent | null> {
    return of(this.agents.find((agent) => agent.AgentID === props.agentID) ?? null);
  }

  getRepresentersByAgentId(props: { agentId?: number }): Observable<OperationAgentRepresentative[]> {
    return of([...(this.representatives[props.agentId ?? 0] ?? [])]);
  }

  getSeroRequest(props: { requestId?: number; agentId?: number }): Observable<OperationRequest | null> {
    const request = this.requests.find((item) =>
      item.RequestID === props.requestId && (!props.agentId || item.AgentID === props.agentId)
    );
    return of(request ?? this.buildFallbackRequest(props.requestId, props.agentId));
  }

  getVoucherPdf(props: { voucherId?: number; agentId?: number }): Observable<PdfReportResult> {
    const voucher = this.findVoucherDetails(props.voucherId, props.agentId)?.Voucher;
    const code = voucher?.RequestVoucherCode ?? `voucher-${props.voucherId ?? 'mock'}`;
    return of({
      Content: 'TW9jayBxdW90YXRpb24gUERGIGZvciBmcm9udGVuZCBwcm90b3R5cGUu',
      ContentType: 'application/pdf',
      FileName: `${code}.pdf`,
    });
  }

  getAllVouchers(): OperationVoucher[] {
    return this.filteredVouchers({});
  }

  private filteredVouchers(props: Pick<VoucherQueryProps, 'typeid' | 'agentId'>): OperationVoucher[] {
    return this.voucherDetails()
      .map((detail) => detail.Voucher)
      .filter((voucher) => !props.typeid || voucher.RequestVoucherTypeID === (props.typeid as OperationVoucherTypeId))
      .filter((voucher) => !props.agentId || voucher.AgentID === props.agentId)
      .filter((voucher) => !voucher.IsDeleted);
  }

  private findVoucherDetails(voucherId?: number, agentId?: number): OperationVoucherDetails | undefined {
    return this.voucherDetails().find((detail) =>
      detail.Voucher.RequestVoucherID === voucherId && (!agentId || detail.Voucher.AgentID === agentId)
    );
  }

  private cloneDetails(details: OperationVoucherDetails): OperationVoucherDetails {
    return {
      Voucher: { ...details.Voucher },
      HotelVouchers: details.HotelVouchers?.map((item) => ({ ...item })),
      TripVouchers: details.TripVouchers?.map((item) => ({ ...item })),
      VisaVouchers: details.VisaVouchers?.map((item) => ({ ...item })),
      CateringVouchers: details.CateringVouchers?.map((item) => ({ ...item })),
      TicketVouchers: details.TicketVouchers?.map((item) => ({ ...item })),
    };
  }

  private applyAdminStatus(props: ApprovalProps, statusId: number, statusTitle: string): void {
    if (!props.voucherID || !props.agentId) {
      return;
    }

    this.voucherDetails.update((details) =>
      details.map((detail) => {
        if (detail.Voucher.RequestVoucherID !== props.voucherID || detail.Voucher.AgentID !== props.agentId) {
          return detail;
        }

        return {
          ...detail,
          Voucher: {
            ...detail.Voucher,
            VoucherStatusForAdminID: statusId,
            VoucherStatusForAdminTitle: statusTitle,
          },
        };
      })
    );

    this.ensureLogs(props.voucherID).admin.unshift({
      StatusTitle: statusTitle,
      Notes: props.notes || 'Operation approval completed from frontend prototype.',
      CreatedBy: 'Operations Admin',
      CreatedAt: new Date().toISOString(),
    });
  }

  private ensureLogs(voucherId?: number): { admin: VoucherStatusLog[]; agent: VoucherStatusLog[] } {
    const key = voucherId ?? 0;
    if (!this.logs[key]) {
      const voucher = this.findVoucherDetails(voucherId)?.Voucher;
      this.logs[key] = {
        admin: [
          {
            StatusTitle: voucher?.VoucherStatusForAdminTitle ?? 'Created',
            Notes: 'Initial mock status generated for the prototype.',
            CreatedBy: voucher?.AddedBy ?? 'System',
            CreatedAt: voucher?.AddedDate ?? new Date().toISOString(),
          },
        ],
        agent: [
          {
            StatusTitle: voucher?.VoucherStatusForAgentTitle ?? 'Draft',
            Notes: 'Agent-facing mock log.',
            CreatedBy: voucher?.AgentName ?? 'Agent',
            CreatedAt: voucher?.AddedDate ?? new Date().toISOString(),
          },
        ],
      };
    }

    return this.logs[key];
  }

  private buildFallbackRequest(requestId?: number, agentId?: number): OperationRequest | null {
    const voucher = this.voucherDetails().find((detail) =>
      detail.Voucher.SeroPackageRequestID === requestId && (!agentId || detail.Voucher.AgentID === agentId)
    )?.Voucher;

    if (!voucher) {
      return null;
    }

    return {
      RequestID: voucher.SeroPackageRequestID,
      RequestCode: `REQ-${voucher.SeroPackageRequestID}`,
      AgentID: voucher.AgentID,
      AgentName: voucher.AgentName,
      PackageTitle: 'Custom Umrah Services Request',
      PaxCount: 10,
      TravelDate: '2026-06-15',
      ReturnDate: '2026-06-25',
      StatusTitle: 'Quotation Review',
      Services: [this.serviceNameForVoucherType(voucher.RequestVoucherTypeID)],
    };
  }

  private serviceNameForVoucherType(typeId: OperationVoucherTypeId): string {
    const labels: Record<OperationVoucherTypeId, string> = {
      1: 'Hotels',
      2: 'Transport',
      3: 'Visa',
      4: 'Catering',
      5: 'Flights',
    };

    return labels[typeId];
  }
}
