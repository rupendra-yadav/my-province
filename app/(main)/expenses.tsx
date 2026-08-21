import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EXPENSE_CATEGORIES } from '../../components/expenses/mockExpenses';
import {
  Card,
  FadeSlideIn,
  formatINR,
  IconBadge,
  MonthRangeSelector,
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { ExpenseRecord, useExpenses } from '../../context/ExpensesContext';
import { useTheme } from '../../context/ThemeContext';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { useReportsCycleRange } from '../../hooks/useReportsCycleRange';

const CATEGORY_PREVIEW_COUNT = 4;
const RECENT_PREVIEW_COUNT = 10;

// ---------- period / bucketing helpers ----------

function isInRange(dateISO: string, range: { fromMonth: number; fromYear: number; toMonth: number; toYear: number }) {
  const d = new Date(dateISO);;
  const idx = d.getFullYear() * 12 + d.getMonth(); // 0-indexed month
  const fromIdx = range.fromYear * 12 + (range.fromMonth - 1);
  const toIdx = range.toYear * 12 + (range.toMonth - 1);
  return idx >= fromIdx && idx <= toIdx;
}

function monthKey(dateISO: string) {
  return dateISO.slice(0, 7); // 'YYYY-MM'
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-IN', { month: 'short' });
}

function toLakh(amount: number) {
  return Number((amount / 100000).toFixed(1));
}

function formatDate(dateISO: string) {
  return new Date(dateISO).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// TODO(category-icons): real expense categories are freeform text typed by
// the admin (see CreateExpenseInput.category), not a fixed enum — unlike
// this EXPENSE_CATEGORIES list, which was built for mock data. We match by
// label (case-insensitive) where possible and fall back to a generic icon
// for anything that doesn't match. Revisit if/when categories get a proper
// admin-managed list with real icon mapping.
function iconForCategory(categoryLabel: string): keyof typeof Ionicons.glyphMap {
  const match = EXPENSE_CATEGORIES.find(
    (c) => c.label.toLowerCase() === categoryLabel.toLowerCase()
  );
  return match?.icon ?? 'ellipsis-horizontal-circle-outline';
}

// ---------- Hero summary card ----------

function ExpensesHeroCard({
  total,
  count,
  vsPrevMonthPct,
}: {
  total: number;
  count: number;
  vsPrevMonthPct: number | null;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Card>
      <Text style={[typography.caption, { color: colors.textMuted }]}>Total Expenses</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, flexWrap: 'wrap' }}>
        <Text style={[typography.display, { color: colors.text }]}>{formatINR(total)}</Text>
        {vsPrevMonthPct !== null && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: vsPrevMonthPct >= 0 ? colors.dangerBg : colors.successBg,
              borderRadius: radius.sm,
              paddingHorizontal: spacing.sm,
              paddingVertical: 3,
              marginLeft: spacing.sm,
            }}
          >
            <Ionicons
              name={vsPrevMonthPct >= 0 ? 'arrow-up' : 'arrow-down'}
              size={11}
              color={vsPrevMonthPct >= 0 ? colors.danger : colors.success}
            />
            <Text
              style={[
                typography.tiny,
                { color: vsPrevMonthPct >= 0 ? colors.danger : colors.success, marginLeft: 2 },
              ]}
            >
              {Math.abs(vsPrevMonthPct)}% vs last month
            </Text>
          </View>
        )}
      </View>
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
        {count} transaction{count === 1 ? '' : 's'} this period
      </Text>
    </Card>
  );
}

// ---------- Stat pair (Transactions / Categories) ----------

function StatCard({ label, value }: { label: string; value: string }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Card style={{ flex: 1, padding: spacing.md }}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[typography.h1, { color: colors.text, marginTop: 2 }]}>{value}</Text>
    </Card>
  );
}

// ---------- Category card ----------

interface CategoryStat {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  amount: number;
  count: number;
  pct: number;
}

function CategoryCard({ item }: { item: CategoryStat }) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Card style={{ width: '48%', padding: spacing.md, marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <IconBadge name={item.icon} size={38} />
        <View
          style={{
            backgroundColor: colors.primaryMuted,
            borderRadius: radius.sm,
            paddingHorizontal: spacing.sm,
            paddingVertical: 2,
          }}
        >
          <Text style={[typography.tiny, { color: colors.text }]}>{item.pct}%</Text>
        </View>
      </View>
      <Text style={[typography.bodyMedium, { color: colors.text, marginTop: spacing.sm }]}>{item.label}</Text>
      <Text style={[typography.h2, { color: colors.text, marginTop: 2 }]}>{formatINR(item.amount)}</Text>
      <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>
        {item.count} transaction{item.count === 1 ? '' : 's'}
      </Text>
    </Card>
  );
}

// ---------- Trend line chart — plain Views, no charting library ----------

function ExpenseTrendChart({ data }: { data: { key: string; label: string; valueLakh: number }[] }) {
  const { colors, spacing, typography } = useTheme();
  const [width, setWidth] = useState(0);
  const chartHeight = 84;
  const topPad = 22;
  const bottomPad = 20;
  const max = Math.max(...data.map((d) => d.valueLakh), 0.1);

  const points = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
    const y = topPad + chartHeight - (chartHeight * d.valueLakh) / max;
    return { x, y, d };
  });

  if (data.length < 2) {
    return (
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.md }]}>
        Select a period spanning at least two months to see a trend.
      </Text>
    );
  }

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height: topPad + chartHeight + bottomPad, marginTop: spacing.md }}
    >
      {width > 0 &&
        points.slice(0, -1).map((p, i) => {
          const next = points[i + 1];
          const dx = next.x - p.x;
          const dy = next.y - p.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          return (
            <View
              key={`seg-${p.d.key}`}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y - 1,
                width: length,
                height: 2,
                borderRadius: 1,
                backgroundColor: colors.accent,
                transform: [{ rotate: `${angle}rad` }],
                transformOrigin: 'left center' as any,
              }}
            />
          );
        })}

      {width > 0 &&
        points.map((p, i) => {
          const isLast = i === points.length - 1;
          return (
            <React.Fragment key={p.d.key}>
              <Text
                style={[
                  typography.tiny,
                  {
                    position: 'absolute',
                    left: Math.max(0, Math.min(width - 34, p.x - 17)),
                    top: p.y - 18,
                    width: 34,
                    textAlign: 'center',
                    color: colors.textMuted,
                  },
                ]}
              >
                {p.d.valueLakh}L
              </Text>
              <View
                style={{
                  position: 'absolute',
                  left: p.x - 4,
                  top: p.y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isLast ? colors.accent : colors.surface,
                  borderWidth: 2,
                  borderColor: colors.accent,
                }}
              />
              <Text
                style={[
                  typography.tiny,
                  {
                    position: 'absolute',
                    left: Math.max(0, Math.min(width - 34, p.x - 17)),
                    top: topPad + chartHeight + 4,
                    width: 34,
                    textAlign: 'center',
                    color: colors.textMuted,
                  },
                ]}
              >
                {p.d.label}
              </Text>
            </React.Fragment>
          );
        })}
    </View>
  );
}

// ---------- Recent expense row ----------

function ExpenseRow({ item, isLast }: { item: ExpenseRecord; isLast: boolean }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <IconBadge name={iconForCategory(item.category)} size={38} />
      <View style={{ flex: 1, marginLeft: spacing.md, marginRight: spacing.sm }}>
        <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
          {item.description}
        </Text>
        {/* TODO(vendor-field): ExpenseRecordDto doesn't return vendorName
            yet, so vendor can't be shown here — add it to the backend
            response if this list should include it. */}
        <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
          {item.category} · {formatDate(item.expenseDate)}
        </Text>
      </View>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{formatINR(item.amount)}</Text>
    </View>
  );
}

// ---------- Screen ----------

export default function ExpensesScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin = !!session?.isAdmin;

  const { range, setRange } = useReportsCycleRange();
  const { expenses, isLoading, error, refresh } = useExpenses();
  const { isRefreshing, onRefresh } = usePullToRefresh(refresh);

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);

  // Every expense record within the selected Reporting Period — the
  // single source of truth the rest of this screen derives from.
  const periodRecords = useMemo(
    () =>
      expenses
        .filter((r) => isInRange(r.expenseDate, range))
        .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate)),
    [expenses, range]
  );

  const totalAmount = useMemo(() => periodRecords.reduce((sum, r) => sum + r.amount, 0), [periodRecords]);

  const categoryStats: CategoryStat[] = useMemo(() => {
    const byLabel = new Map<string, { amount: number; count: number }>();
    for (const r of periodRecords) {
      const cur = byLabel.get(r.category) ?? { amount: 0, count: 0 };
      cur.amount += r.amount;
      cur.count += 1;
      byLabel.set(r.category, cur);
    }
    const stats: CategoryStat[] = [];
    for (const [label, agg] of byLabel.entries()) {
      stats.push({
        key: label,
        label,
        icon: iconForCategory(label),
        amount: agg.amount,
        count: agg.count,
        pct: totalAmount > 0 ? Math.round((agg.amount / totalAmount) * 100) : 0,
      });
    }
    return stats.sort((a, b) => b.amount - a.amount);
  }, [periodRecords, totalAmount]);

  const trend = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const r of periodRecords) {
      const key = monthKey(r.expenseDate);
      byMonth.set(key, (byMonth.get(key) ?? 0) + r.amount);
    }
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, amount]) => ({ key, label: monthLabel(key), valueLakh: toLakh(amount) }));
  }, [periodRecords]);

  const vsPrevMonthPct = useMemo(() => {
    if (trend.length < 2) return null;
    const last = trend[trend.length - 1];
    const prev = trend[trend.length - 2];
    if (prev.valueLakh <= 0) return null;
    return Number((((last.valueLakh - prev.valueLakh) / prev.valueLakh) * 100).toFixed(1));
  }, [trend]);

  const visibleCategories = showAllCategories ? categoryStats : categoryStats.slice(0, CATEGORY_PREVIEW_COUNT);
  const visibleRecent = showAllRecent ? periodRecords : periodRecords.slice(0, RECENT_PREVIEW_COUNT);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.md }}>
        <Text style={[typography.h1, { color: colors.text }]}>Expenses</Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
          {session?.user?.society ?? ''}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl + 90 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />}
      >
        {/* Reporting period */}
        <FadeSlideIn style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
            Reporting Period
          </Text>
          <MonthRangeSelector value={range!} onChange={setRange} />
        </FadeSlideIn>

        {error && (
          <FadeSlideIn style={{ marginBottom: spacing.md }}>
            <Card style={{ padding: spacing.md, backgroundColor: colors.dangerBg }}>
              <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text>
              <Pressable onPress={refresh} style={{ marginTop: spacing.xs }}>
                <Text style={[typography.caption, { color: colors.accent }]}>Tap to retry</Text>
              </Pressable>
            </Card>
          </FadeSlideIn>
        )}

        {/* Hero */}
        <FadeSlideIn delay={40} style={{ marginBottom: spacing.md }}>
          <ExpensesHeroCard total={totalAmount} count={periodRecords.length} vsPrevMonthPct={vsPrevMonthPct} />
        </FadeSlideIn>

        {/* Stat pair */}
        <FadeSlideIn delay={70} style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <StatCard label="Transactions" value={String(periodRecords.length)} />
            <StatCard label="Categories" value={String(categoryStats.length)} />
          </View>
        </FadeSlideIn>

        {/* Category-wise summary */}
        <FadeSlideIn delay={100} style={{ marginBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={[typography.h2, { color: colors.text }]}>Category-wise Summary</Text>
            {categoryStats.length > CATEGORY_PREVIEW_COUNT && (
              <Pressable onPress={() => setShowAllCategories((v) => !v)}>
                <Text style={[typography.caption, { color: colors.accent }]}>
                  {showAllCategories ? 'Show less' : 'View all'}
                </Text>
              </Pressable>
            )}
          </View>

          {isLoading && categoryStats.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>Loading…</Text>
          ) : categoryStats.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No expenses recorded for this period.</Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {visibleCategories.map((c) => (
                <CategoryCard key={c.key} item={c} />
              ))}
            </View>
          )}
        </FadeSlideIn>

        {/* Expense trend */}
        <FadeSlideIn delay={130} style={{ marginBottom: spacing.xl }}>
          <Card>
            <Text style={[typography.h2, { color: colors.text }]}>Expense Trend</Text>
            <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>Amount in Lakhs (₹)</Text>
            <ExpenseTrendChart data={trend} />
          </Card>
        </FadeSlideIn>

        {/* Recent expenses */}
        <FadeSlideIn delay={160}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={[typography.h2, { color: colors.text }]}>Recent Expenses</Text>
            {periodRecords.length > RECENT_PREVIEW_COUNT && (
              <Pressable onPress={() => setShowAllRecent((v) => !v)}>
                <Text style={[typography.caption, { color: colors.accent }]}>
                  {showAllRecent ? 'Show less' : 'View all'}
                </Text>
              </Pressable>
            )}
          </View>

          {isLoading && periodRecords.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>Loading…</Text>
          ) : periodRecords.length === 0 ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>No expenses recorded for this period.</Text>
          ) : (
            <Card style={{ padding: spacing.lg }}>
              {visibleRecent.map((item, i) => (
                <ExpenseRow key={item.id} item={item} isLast={i === visibleRecent.length - 1} />
              ))}
            </Card>
          )}
        </FadeSlideIn>
      </ScrollView>

      {/* Admin-only add expense FAB */}
      {isAdmin && (
        <Pressable
          onPress={() => router.push('/expense/add-expense' as any)}
          style={{
            position: 'absolute',
            right: spacing.xl,
            bottom: insets.bottom + 64 + spacing.xl,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
          }}
        >
          <Ionicons name="add" size={26} color={colors.onPrimary} />
        </Pressable>
      )}
    </View>
  );
}