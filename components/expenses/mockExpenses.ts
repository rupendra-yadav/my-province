import { Ionicons } from '@expo/vector-icons';

export interface ExpenseCategoryDef {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryDef[] = [
  { key: 'electricity', label: 'Electricity', icon: 'flash-outline' },
  { key: 'water', label: 'Water', icon: 'water-outline' },
  { key: 'security', label: 'Security', icon: 'shield-checkmark-outline' },
  { key: 'housekeeping', label: 'Housekeeping', icon: 'sparkles-outline' },
  { key: 'maintenance', label: 'Maintenance', icon: 'construct-outline' },
  { key: 'salaries', label: 'Salaries', icon: 'people-outline' },
  { key: 'insurance', label: 'Insurance', icon: 'umbrella-outline' },
  { key: 'misc', label: 'Miscellaneous', icon: 'ellipsis-horizontal-circle-outline' },
];

export interface ExpenseRecord {
  id: string;
  categoryKey: string;
  title: string;
  vendor: string;
  date: string; // ISO 'YYYY-MM-DD'
  amount: number;
  recordedBy: string; // admin who logged it — shown nowhere yet, kept for when Add Expense ships
}

// ---------------------------------------------------------------------------
// Deterministic pseudo-random generator (fixed seed) so the dummy dataset is
// stable across reloads instead of reshuffling every render.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260301);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => Math.round(min + rand() * (max - min));

interface CategoryTemplate {
  key: string;
  titles: string[];
  vendors: string[];
  amountRange: [number, number];
  perMonthRange: [number, number];
}

const TEMPLATES: CategoryTemplate[] = [
  {
    key: 'electricity',
    titles: ['Bijli bill', 'Electricity bill', 'Common area lighting', 'Lift power charges'],
    vendors: ['CSPDCL'],
    amountRange: [2200, 38000],
    perMonthRange: [10, 16],
  },
  {
    key: 'water',
    titles: ['Water tanker', 'Borewell maintenance', 'Water pump repair', 'Municipal water bill'],
    vendors: ['Sharma Electricals', 'Nagar Nigam Raigarh', 'Local tanker service'],
    amountRange: [800, 9000],
    perMonthRange: [2, 5],
  },
  {
    key: 'security',
    titles: ['Security guard salary', 'CCTV maintenance', 'Gate barrier repair'],
    vendors: ['SecureGuard Services', 'Vision CCTV Solutions'],
    amountRange: [4000, 32000],
    perMonthRange: [2, 4],
  },
  {
    key: 'housekeeping',
    titles: ['Housekeeping staff wages', 'Cleaning supplies', 'Garbage disposal'],
    vendors: ['Clean Society Staffing', 'Local supplier'],
    amountRange: [1200, 18000],
    perMonthRange: [3, 6],
  },
  {
    key: 'maintenance',
    titles: ['Lift AMC', 'Plumbing repair', 'Painting — common area', 'Generator servicing', 'Road patch repair'],
    vendors: ['Otis AMC', 'Local plumber', 'Society contractor'],
    amountRange: [1500, 25000],
    perMonthRange: [4, 9],
  },
  {
    key: 'salaries',
    titles: ['Society manager salary', 'Accountant salary', 'Office staff salary'],
    vendors: ['Payroll'],
    amountRange: [12000, 28000],
    perMonthRange: [2, 3],
  },
  {
    key: 'insurance',
    titles: ['Building insurance premium', 'Fire safety insurance'],
    vendors: ['National Insurance Co.'],
    amountRange: [6000, 22000],
    perMonthRange: [0, 1],
  },
  {
    key: 'misc',
    titles: ['Stationery', 'Festival decoration', 'Courier charges', 'Meeting refreshments', 'Miscellaneous repair'],
    vendors: ['Local vendor'],
    amountRange: [400, 6000],
    perMonthRange: [3, 7],
  },
];

// Months covered — Oct 2025 through Mar 2026, so the Reporting Period
// filter (default Jan–current month, same as Reports) has real history to
// extend backward into.
const MONTHS: { month: number; year: number }[] = [
  { month: 10, year: 2025 },
  { month: 11, year: 2025 },
  { month: 12, year: 2025 },
  { month: 1, year: 2026 },
  { month: 2, year: 2026 },
  { month: 3, year: 2026 },
];

function randomDateInMonth(month: number, year: number): string {
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = between(1, daysInMonth);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildMockExpenses(): ExpenseRecord[] {
  const records: ExpenseRecord[] = [];
  let counter = 1;

  for (const { month, year } of MONTHS) {
    for (const tpl of TEMPLATES) {
      const count = between(tpl.perMonthRange[0], tpl.perMonthRange[1]);
      for (let i = 0; i < count; i++) {
        records.push({
          id: `exp-${counter++}`,
          categoryKey: tpl.key,
          title: pick(tpl.titles),
          vendor: pick(tpl.vendors),
          date: randomDateInMonth(month, year),
          amount: between(tpl.amountRange[0], tpl.amountRange[1]),
          recordedBy: 'Society Manager',
        });
      }
    }
  }

  return records.sort((a, b) => b.date.localeCompare(a.date));
}

// ---------------------------------------------------------------------------
// DUMMY DATA — replace with a real API response later.
// ---------------------------------------------------------------------------
export const MOCK_EXPENSES: ExpenseRecord[] = buildMockExpenses();
// ---------------------------------------------------------------------------