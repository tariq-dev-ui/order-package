// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
import {
  AgentStatus,
  OperationStatus,
  OrderRow,
  OrderType,
  PaymentStatus,
} from './orders.model';

const PREFIX_BY_TYPE: Record<OrderType, string> = {
  hotel: 'ORD-HTL',
  transportation: 'ORD-TRAN',
  visa: 'ORD-VISA',
  catering: 'ORD-CAT',
  ticket: 'ORD-TCKT',
  custom: 'ORD-CSVC',
};

// Target totals for the top filter cards — All must equal the sum of every type below.
export const ORDER_TYPE_COUNTS: Record<OrderType, number> = {
  hotel: 96,
  transportation: 34,
  visa: 22,
  catering: 18,
  ticket: 11,
  custom: 5,
};

export const ORDER_TOTAL_COUNT = Object.values(ORDER_TYPE_COUNTS).reduce((sum, n) => sum + n, 0);

// Exact rows for page 1 / "All" filter, in this order.
const CANONICAL_ROWS: OrderRow[] = [
  {
    id: 1, type: 'hotel', orderNo: 'ORD-HTL-20260710-0231', orderDate: '2026-07-10T14:20:00',
    agent: 'Faisal Al-Otaibi', totalPrice: 1200, paid: 1200, remaining: 0,
    paymentStatus: 'paid', operationStatus: 'operation_approved', agentStatus: 'completed',
  },
  {
    id: 2, type: 'transportation', orderNo: 'ORD-TRAN-20260710-0088', orderDate: '2026-07-10T11:05:00',
    agent: 'Faisal Al-Otaibi', totalPrice: 350, paid: 350, remaining: 0,
    paymentStatus: 'paid', operationStatus: 'operation_approved', agentStatus: 'completed',
  },
  {
    id: 3, type: 'visa', orderNo: 'ORD-VISA-20260709-0064', orderDate: '2026-07-09T09:40:00',
    agent: 'Second Agent', totalPrice: 450, paid: 200, remaining: 250,
    paymentStatus: 'partially_paid', operationStatus: 'account_manager_approved', agentStatus: 'in_progress',
  },
  {
    id: 4, type: 'visa', orderNo: 'ORD-VISA-20260709-0063', orderDate: '2026-07-09T08:55:00',
    agent: 'Second Agent', totalPrice: 450, paid: 0, remaining: 450,
    paymentStatus: 'unpaid', operationStatus: 'preparing', agentStatus: 'preparing',
  },
  {
    id: 5, type: 'catering', orderNo: 'ORD-CAT-20260708-0052', orderDate: '2026-07-08T19:30:00',
    agent: 'Main Agent', totalPrice: 800, paid: 800, remaining: 0,
    paymentStatus: 'paid', operationStatus: 'operation_approved', agentStatus: 'completed',
  },
  {
    id: 6, type: 'catering', orderNo: 'ORD-CAT-20260708-0051', orderDate: '2026-07-08T18:10:00',
    agent: 'Main Agent', totalPrice: 650, paid: 0, remaining: 650,
    paymentStatus: 'unpaid', operationStatus: 'rejected', agentStatus: 'cancelled',
  },
  {
    id: 7, type: 'ticket', orderNo: 'ORD-TCKT-20260707-0040', orderDate: '2026-07-07T22:15:00',
    agent: 'Third Agent', totalPrice: 2500, paid: 2500, remaining: 0,
    paymentStatus: 'paid', operationStatus: 'operation_approved', agentStatus: 'completed',
  },
  {
    id: 8, type: 'ticket', orderNo: 'ORD-TCKT-20260707-0039', orderDate: '2026-07-07T21:05:00',
    agent: 'Third Agent', totalPrice: 2500, paid: 1000, remaining: 1500,
    paymentStatus: 'partially_paid', operationStatus: 'preparing', agentStatus: 'in_progress',
  },
  {
    id: 9, type: 'custom', orderNo: 'ORD-CSVC-20260706-0011', orderDate: '2026-07-06T15:45:00',
    agent: 'First Agent', totalPrice: 500, paid: 500, remaining: 0,
    paymentStatus: 'paid', operationStatus: 'operation_approved', agentStatus: 'completed',
  },
  {
    id: 10, type: 'custom', orderNo: 'ORD-CSVC-20260706-0010', orderDate: '2026-07-06T14:20:00',
    agent: 'First Agent', totalPrice: 300, paid: 0, remaining: 300,
    paymentStatus: 'unpaid', operationStatus: 'preparing', agentStatus: 'preparing',
  },
];

const AGENTS = ['Third Agent', 'First Agent', 'Second Agent', 'Main Agent', 'Faisal Al-Otaibi'];
const PAYMENT_CYCLE: PaymentStatus[] = ['paid', 'paid', 'partially_paid', 'unpaid'];
const OPERATION_CYCLE: OperationStatus[] = ['operation_approved', 'operation_approved', 'account_manager_approved', 'preparing', 'rejected'];
const AGENT_STATUS_CYCLE: AgentStatus[] = ['completed', 'completed', 'in_progress', 'preparing', 'cancelled'];

function buildAdditionalRows(): OrderRow[] {
  const canonicalCountByType = CANONICAL_ROWS.reduce((acc, row) => {
    acc[row.type] = (acc[row.type] ?? 0) + 1;
    return acc;
  }, {} as Record<OrderType, number>);

  const rows: OrderRow[] = [];
  let nextId = CANONICAL_ROWS.length + 1;

  (Object.keys(ORDER_TYPE_COUNTS) as OrderType[]).forEach((type) => {
    const remaining = ORDER_TYPE_COUNTS[type] - (canonicalCountByType[type] ?? 0);
    for (let i = 0; i < remaining; i++) {
      const seq = 900 - i;
      const minutesAgo = i * 63;
      const date = new Date(2026, 6, 5, 17, 0, 0);
      date.setMinutes(date.getMinutes() - minutesAgo);

      const totalPrice = 100 * (3 + ((i * 5 + 2) % 30));
      const paymentStatus = PAYMENT_CYCLE[i % PAYMENT_CYCLE.length];
      const paid = paymentStatus === 'paid' ? totalPrice : paymentStatus === 'partially_paid' ? Math.round(totalPrice * 0.5) : 0;

      rows.push({
        id: nextId++,
        type,
        orderNo: `${PREFIX_BY_TYPE[type]}-20260704-${String(seq).padStart(4, '0')}`,
        orderDate: date.toISOString().slice(0, 19),
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

export const MOCK_ORDERS: OrderRow[] = [...CANONICAL_ROWS, ...buildAdditionalRows()];
