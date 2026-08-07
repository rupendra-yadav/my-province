// components/reports/mockResidents.ts
// Shared DUMMY DATA for the Reports drill-down screens that show
// individual-level data (admin-only in practice):
//   - Resident Payment List   (app/(main)/reports/resident-payment-list.tsx)
//   - Payment Details         (app/(main)/reports/resident/[id].tsx)
//   - Unpaid Residents        (app/(main)/reports/unpaid-residents.tsx)
// These routes redirect non-admins away; this data never reaches the
// resident-facing aggregate screens (1-3, 7).
//
// No API calls yet — this stands in for a future GET /reports/residents
// (or similar) endpoint. Kept in one place so swapping in real data later
// is a single-file edit; screens only import the type + helpers below.

import type { FeeType, PaymentStatus as PeriodStatus } from '../../context/PaymentsContext';

export type ResidentPaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface ResidentHistoryEntry {
  id: string;
  type: FeeType;
  period: string; // '2026-03'
  label: string; // 'Mar 2026'
  due: number;
  paid: number;
  fine: number;
  balance: number;
  status: PeriodStatus;
  paidDate?: string;
}

export interface ResidentPaymentRecord {
  id: string;
  houseCode: string; // 'CC02'
  block: string; // 'CC'
  unit: string; // '02'
  houseType: string; // 'CC'
  name: string;
  status: ResidentPaymentStatus;
  monthlyDue: number;
  paidThisPeriod: number;
  balance: number;
  paidDate?: string; // set when status === 'paid'
  monthsPending?: number; // set when status !== 'paid'
  history: ResidentHistoryEntry[];
}

function paidHistory(monthlyDue: number, months: { label: string; period: string; date: string }[]): ResidentHistoryEntry[] {
  return months.map((m, i) => ({
    id: `${m.period}`,
    type: 'maintenance',
    period: m.period,
    label: m.label,
    due: monthlyDue,
    paid: monthlyDue,
    fine: 0,
    balance: 0,
    status: 'paid',
    paidDate: m.date,
  }));
}

// ---------------------------------------------------------------------------
// DUMMY DATA — replace with real API response later.
// ---------------------------------------------------------------------------
export const MOCK_RESIDENTS: ResidentPaymentRecord[] = [
  {
    id: 'cc-02',
    houseCode: 'CC 02',
    block: 'CC',
    unit: '02',
    houseType: 'CC',
    name: 'Md Bhoi',
    status: 'paid',
    monthlyDue: 1600,
    paidThisPeriod: 1600,
    balance: 0,
    paidDate: '2026-03-04',
    history: paidHistory(1600, [
      { label: 'Mar 2026', period: '2026-03', date: '2026-03-04' },
      { label: 'Feb 2026', period: '2026-02', date: '2026-02-02' },
      { label: 'Jan 2026', period: '2026-01', date: '2026-01-05' },
      { label: 'Dec 2025', period: '2025-12', date: '2025-12-02' },
      { label: 'Nov 2025', period: '2025-11', date: '2025-11-03' },
    ]),
  },
  {
    id: 'cc-03',
    houseCode: 'CC 03',
    block: 'CC',
    unit: '03',
    houseType: 'CC',
    name: 'Shravan Chornele',
    status: 'paid',
    monthlyDue: 1600,
    paidThisPeriod: 1600,
    balance: 0,
    paidDate: '2026-03-03',
    history: paidHistory(1600, [
      { label: 'Mar 2026', period: '2026-03', date: '2026-03-03' },
      { label: 'Feb 2026', period: '2026-02', date: '2026-02-03' },
      { label: 'Jan 2026', period: '2026-01', date: '2026-01-04' },
    ]),
  },
  {
    id: 'cc-04',
    houseCode: 'CC 04',
    block: 'CC',
    unit: '04',
    houseType: 'CC',
    name: 'GD Vaishnav',
    status: 'paid',
    monthlyDue: 1600,
    paidThisPeriod: 1600,
    balance: 0,
    paidDate: '2026-03-02',
    history: paidHistory(1600, [
      { label: 'Mar 2026', period: '2026-03', date: '2026-03-02' },
      { label: 'Feb 2026', period: '2026-02', date: '2026-02-01' },
    ]),
  },
  {
    id: 'cc-05',
    houseCode: 'CC 05',
    block: 'CC',
    unit: '05',
    houseType: 'CC',
    name: 'S K Ravi',
    status: 'paid',
    monthlyDue: 1600,
    paidThisPeriod: 1600,
    balance: 0,
    paidDate: '2026-03-01',
    history: paidHistory(1600, [
      { label: 'Mar 2026', period: '2026-03', date: '2026-03-01' },
      { label: 'Feb 2026', period: '2026-02', date: '2026-02-01' },
    ]),
  },
  {
    id: 'cc-06',
    houseCode: 'CC 06',
    block: 'CC',
    unit: '06',
    houseType: 'CC',
    name: 'Shekhar Agnihotri',
    status: 'paid',
    monthlyDue: 1600,
    paidThisPeriod: 1600,
    balance: 0,
    paidDate: '2026-03-01',
    history: paidHistory(1600, [
      { label: 'Mar 2026', period: '2026-03', date: '2026-03-01' },
    ]),
  },
  {
    id: 'cc-15',
    houseCode: 'CC 15',
    block: 'CC',
    unit: '15',
    houseType: 'CC',
    name: 'Vikram Singh',
    status: 'unpaid',
    monthlyDue: 1600,
    paidThisPeriod: 0,
    balance: 1600,
    monthsPending: 1,
    history: [
      { id: '2026-03', type: 'maintenance', period: '2026-03', label: 'Mar 2026', due: 1600, paid: 0, fine: 0, balance: 1600, status: 'not_paid' },
      { id: '2026-02', type: 'maintenance', period: '2026-02', label: 'Feb 2026', due: 1600, paid: 1600, fine: 0, balance: 0, status: 'paid', paidDate: '2026-02-04' },
    ],
  },
  {
    id: 'dd-07',
    houseCode: 'DD 07',
    block: 'DD',
    unit: '07',
    houseType: 'DD',
    name: 'Neha Patel',
    status: 'unpaid',
    monthlyDue: 1600,
    paidThisPeriod: 0,
    balance: 1600,
    monthsPending: 1,
    history: [
      { id: '2026-03', type: 'maintenance', period: '2026-03', label: 'Mar 2026', due: 1600, paid: 0, fine: 0, balance: 1600, status: 'not_paid' },
      { id: '2026-02', type: 'maintenance', period: '2026-02', label: 'Feb 2026', due: 1600, paid: 1600, fine: 0, balance: 0, status: 'paid', paidDate: '2026-02-05' },
    ],
  },
  {
    id: 'dd-03',
    houseCode: 'DD 03',
    block: 'DD',
    unit: '03',
    houseType: 'DD',
    name: 'Rohan Mehta',
    status: 'partial',
    monthlyDue: 1600,
    paidThisPeriod: 800,
    balance: 800,
    monthsPending: 1,
    history: [
      { id: '2026-03', type: 'maintenance', period: '2026-03', label: 'Mar 2026', due: 1600, paid: 800, fine: 0, balance: 800, status: 'pending' },
      { id: '2026-02', type: 'maintenance', period: '2026-02', label: 'Feb 2026', due: 1600, paid: 1600, fine: 0, balance: 0, status: 'paid', paidDate: '2026-02-06' },
    ],
  },
  {
    id: 'pp-12',
    houseCode: 'PP 12',
    block: 'PP',
    unit: '12',
    houseType: 'PP',
    name: 'Ramesh Verma',
    status: 'unpaid',
    monthlyDue: 1200,
    paidThisPeriod: 0,
    balance: 2400,
    monthsPending: 2,
    history: [
      { id: '2026-03', type: 'maintenance', period: '2026-03', label: 'Mar 2026', due: 1200, paid: 0, fine: 0, balance: 1200, status: 'not_paid' },
      { id: '2026-02', type: 'maintenance', period: '2026-02', label: 'Feb 2026', due: 1200, paid: 0, fine: 0, balance: 1200, status: 'not_paid' },
      { id: '2026-01', type: 'maintenance', period: '2026-01', label: 'Jan 2026', due: 1200, paid: 1200, fine: 0, balance: 0, status: 'paid', paidDate: '2026-01-05' },
    ],
  },
  {
    id: 'pp-08',
    houseCode: 'PP 08',
    block: 'PP',
    unit: '08',
    houseType: 'PP',
    name: 'Anita Deshmukh',
    status: 'partial',
    monthlyDue: 1200,
    paidThisPeriod: 400,
    balance: 800,
    monthsPending: 1,
    history: [
      { id: '2026-03', type: 'maintenance', period: '2026-03', label: 'Mar 2026', due: 1200, paid: 400, fine: 0, balance: 800, status: 'pending' },
      { id: '2026-02', type: 'maintenance', period: '2026-02', label: 'Feb 2026', due: 1200, paid: 1200, fine: 0, balance: 0, status: 'paid', paidDate: '2026-02-03' },
    ],
  },
  {
    id: 'rr-21',
    houseCode: 'RR 21',
    block: 'RR',
    unit: '21',
    houseType: 'RR',
    name: 'Amit Sharma',
    status: 'unpaid',
    monthlyDue: 1600,
    paidThisPeriod: 0,
    balance: 3200,
    monthsPending: 2,
    history: [
      { id: '2026-03', type: 'maintenance', period: '2026-03', label: 'Mar 2026', due: 1600, paid: 0, fine: 0, balance: 1600, status: 'not_paid' },
      { id: '2026-02', type: 'maintenance', period: '2026-02', label: 'Feb 2026', due: 1600, paid: 0, fine: 0, balance: 1600, status: 'not_paid' },
      { id: '2026-01', type: 'maintenance', period: '2026-01', label: 'Jan 2026', due: 1600, paid: 1600, fine: 0, balance: 0, status: 'paid', paidDate: '2026-01-04' },
    ],
  },
  {
    id: 'tt-04',
    houseCode: 'TT 04',
    block: 'TT',
    unit: '04',
    houseType: 'TT',
    name: 'Pooja Sharma',
    status: 'unpaid',
    monthlyDue: 1200,
    paidThisPeriod: 0,
    balance: 1200,
    monthsPending: 1,
    history: [
      { id: '2026-03', type: 'maintenance', period: '2026-03', label: 'Mar 2026', due: 1200, paid: 0, fine: 0, balance: 1200, status: 'not_paid' },
      { id: '2026-02', type: 'maintenance', period: '2026-02', label: 'Feb 2026', due: 1200, paid: 1200, fine: 0, balance: 0, status: 'paid', paidDate: '2026-02-02' },
    ],
  },
];
// ---------------------------------------------------------------------------

export function getResidentById(id: string): ResidentPaymentRecord | undefined {
  return MOCK_RESIDENTS.find((r) => r.id === id);
}

export const UNPAID_SUMMARY = {
  // Society-wide totals shown on the Unpaid Residents summary header — kept
  // independent of MOCK_RESIDENTS.length since the sample list above is a
  // representative slice, not the full 33-house dataset. Replace both with
  // one real source once the backend exists.
  unpaidHouses: 33,
  totalPending: 432941,
};
