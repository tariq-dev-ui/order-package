// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
import {
  AgentStatus,
  OperationStatus,
  PaymentStatus,
  QuotationRow,
  QuotationType,
} from './quotations.model';

const PREFIX_BY_TYPE: Record<QuotationType, string> = {
  hotel: 'HTL',
  transportation: 'TRAN',
  visa: 'VISA',
  catering: 'CAT',
  ticket: 'TCKT',
  custom: 'CSVC',
};

// Target totals for the top filter cards — All must equal the sum of every type below.
export const QUOTATION_TYPE_COUNTS: Record<QuotationType, number> = {
  hotel: 123,
  transportation: 21,
  visa: 18,
  catering: 21,
  ticket: 14,
  custom: 4,
};

export const QUOTATION_TOTAL_COUNT = Object.values(QUOTATION_TYPE_COUNTS).reduce((sum, n) => sum + n, 0);

// Exact rows for page 1 / "All" filter, in this order, as given by the reference data.
const CANONICAL_ROWS: QuotationRow[] = [
  {
    id: 1, type: 'hotel', quotationNo: 'HTL-20260722-0145', quotationDate: '2026-07-23T01:30:00',
    agent: 'Third Agent', totalPrice: 900, paid: 100, remaining: 800,
    paymentStatus: 'partially_paid', operationStatus: 'operation_approved', agentStatus: 'in_progress',
  },
  {
    id: 2, type: 'transportation', quotationNo: 'TRAN-20260722-0020', quotationDate: '2026-07-22T17:07:00',
    agent: 'Third Agent', totalPrice: 220, paid: 0, remaining: 220,
    paymentStatus: 'unpaid', operationStatus: 'preparing', agentStatus: 'preparing',
  },
  {
    id: 3, type: 'visa', quotationNo: 'VISA-20260722-0014', quotationDate: '2026-07-23T00:48:00',
    agent: 'Third Agent', totalPrice: 300, paid: 0, remaining: 300,
    paymentStatus: 'unpaid', operationStatus: 'account_manager_approved', agentStatus: 'in_progress',
  },
  {
    id: 4, type: 'visa', quotationNo: 'VISA-20260722-0013', quotationDate: '2026-07-22T17:07:00',
    agent: 'Third Agent', totalPrice: 1000, paid: 0, remaining: 1000,
    paymentStatus: 'unpaid', operationStatus: 'preparing', agentStatus: 'preparing',
  },
  {
    id: 5, type: 'catering', quotationNo: 'CAT-20260722-0017', quotationDate: '2026-07-23T00:41:00',
    agent: 'Third Agent', totalPrice: 700, paid: 0, remaining: 700,
    paymentStatus: 'unpaid', operationStatus: 'preparing', agentStatus: 'preparing',
  },
  {
    id: 6, type: 'catering', quotationNo: 'CAT-20260722-0016', quotationDate: '2026-07-22T23:45:00',
    agent: 'Third Agent', totalPrice: 600, paid: 0, remaining: 600,
    paymentStatus: 'unpaid', operationStatus: 'preparing', agentStatus: 'preparing',
  },
  {
    id: 7, type: 'ticket', quotationNo: 'TCKT-20260722-0014', quotationDate: '2026-07-23T00:39:00',
    agent: 'Third Agent', totalPrice: 3000, paid: 0, remaining: 3000,
    paymentStatus: 'unpaid', operationStatus: 'preparing', agentStatus: 'preparing',
  },
  {
    id: 8, type: 'ticket', quotationNo: 'TCKT-20260722-0013', quotationDate: '2026-07-22T23:45:00',
    agent: 'Third Agent', totalPrice: 3000, paid: 0, remaining: 3000,
    paymentStatus: 'unpaid', operationStatus: 'preparing', agentStatus: 'preparing',
  },
  {
    id: 9, type: 'custom', quotationNo: 'CSVC-20260722-0003', quotationDate: '2026-07-23T00:48:00',
    agent: 'Third Agent', totalPrice: 600, paid: 0, remaining: 600,
    paymentStatus: 'unpaid', operationStatus: 'account_manager_approved', agentStatus: 'in_progress',
  },
  {
    id: 10, type: 'custom', quotationNo: 'CSVC-20260722-0002', quotationDate: '2026-07-22T23:45:00',
    agent: 'Third Agent', totalPrice: 300, paid: 0, remaining: 300,
    paymentStatus: 'unpaid', operationStatus: 'preparing', agentStatus: 'preparing',
  },
];

const AGENTS = ['Third Agent', 'First Agent', 'Second Agent', 'Main Agent'];
const PAYMENT_CYCLE: PaymentStatus[] = ['unpaid', 'unpaid', 'partially_paid', 'paid'];
const OPERATION_CYCLE: OperationStatus[] = ['preparing', 'account_manager_approved', 'operation_approved', 'rejected'];
const AGENT_STATUS_CYCLE: AgentStatus[] = ['preparing', 'in_progress', 'completed', 'cancelled'];

function buildAdditionalRows(): QuotationRow[] {
  const canonicalCountByType = CANONICAL_ROWS.reduce((acc, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1;
    return acc;
  }, {} as Record<QuotationType, number>);

  const rows: QuotationRow[] = [];
  let nextId = CANONICAL_ROWS.length + 1;

  (Object.keys(QUOTATION_TYPE_COUNTS) as QuotationType[]).forEach((type) => {
    const remaining = QUOTATION_TYPE_COUNTS[type] - (canonicalCountByType[type] ?? 0);
    for (let i = 0; i < remaining; i++) {
      const seq = 1000 - i;
      const minutesAgo = i * 47;
      const date = new Date(2026, 6, 21, 12, 0, 0);
      date.setMinutes(date.getMinutes() - minutesAgo);

      const totalPrice = 100 * (2 + ((i * 3 + 1) % 28));
      const paymentStatus = PAYMENT_CYCLE[i % PAYMENT_CYCLE.length];
      const paid = paymentStatus === 'paid' ? totalPrice : paymentStatus === 'partially_paid' ? Math.round(totalPrice * 0.4) : 0;

      rows.push({
        id: nextId++,
        type,
        quotationNo: `${PREFIX_BY_TYPE[type]}-20260721-${String(seq).padStart(4, '0')}`,
        quotationDate: date.toISOString().slice(0, 19),
        agent: AGENTS[i % AGENTS.length],
        totalPrice,
        paid,
        remaining: totalPrice - paid,
        paymentStatus,
        operationStatus: OPERATION_CYCLE[i % OPERATION_CYCLE.length],
        agentStatus: AGENT_STATUS_CYCLE[i % AGENT_STATUS_CYCLE.length],
      });
    }
  });

  return rows;
}

export const MOCK_QUOTATIONS: QuotationRow[] = [...CANONICAL_ROWS, ...buildAdditionalRows()];
