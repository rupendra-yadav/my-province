// app/(admin)/expense/add-expense.tsx

import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { EXPENSE_CATEGORIES } from '../../../components/expenses/mockExpenses';
import { DateField, SelectField, TextField } from '../../../components/forms/fields';
import { PrimaryButton } from '../../../components/ui';
import { useTheme } from '../../../context/ThemeContext';
import { createExpense } from '../../../services/endpoints';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({ label: c.label, value: c.label }));

const PAYMENT_MODES = [
  { label: 'Cash', value: 'CASH' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Card', value: 'CARD' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'Cheque', value: 'CHEQUE' },
];

export default function AddExpenseScreen() {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.xxxl,
          paddingBottom: spacing.md,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>Add Expense</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}
        keyboardShouldPersistTaps="handled"
      >
        <AddExpenseContent onDone={() => router.back()} />
      </ScrollView>
    </View>
  );
}

function AddExpenseContent({ onDone }: { onDone?: () => void }) {
  const { spacing } = useTheme();

  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayISO());
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [description, setDescription] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const amountValue = Number(amount);
  const isValid = !!category && amountValue > 0 && !!expenseDate && !!description.trim();

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Incomplete form', 'Please fill in category, amount, date, and description.');
      return;
    }

    setSubmitting(true);
    try {
      await createExpense({
        category,
        description: description.trim(),
        amount: amountValue,
        expenseDate,
        paymentMode,
        vendorName: vendorName.trim() || undefined,
        referenceNo: referenceNo.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Expense recorded', `₹${amountValue.toLocaleString('en-IN')} logged under ${category}.`, [
        { text: 'OK', onPress: onDone },
      ]);
    } catch (err: any) {
      Alert.alert('Could not record expense', err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <SelectField
        label="Category"
        required
        value={category}
        placeholder="Select Category"
        options={CATEGORY_OPTIONS}
        onSelect={(opt) => setCategory(opt.value)}
      />

      <TextField
        label="Amount"
        required
        value={amount}
        onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <DateField label="Expense Date" required value={expenseDate} onChange={setExpenseDate} />

      <SelectField
        label="Payment Mode"
        value={paymentMode}
        options={PAYMENT_MODES}
        onSelect={(opt) => setPaymentMode(opt.value)}
      />

      <TextField
        label="Description"
        required
        value={description}
        onChangeText={setDescription}
        placeholder="Brief description"
        multiline
      />

      <TextField label="Vendor/Payee" value={vendorName} onChangeText={setVendorName} placeholder="Optional" />

      <TextField label="Reference No." value={referenceNo} onChangeText={setReferenceNo} placeholder="Optional" />

      <TextField
        label="Remarks"
        value={remarks}
        onChangeText={setRemarks}
        placeholder="Additional notes (optional)"
        multiline
      />

      <View style={{ marginTop: spacing.sm }}>
        {submitting ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
            <ActivityIndicator />
          </View>
        ) : (
          <PrimaryButton label="Add Expense" onPress={handleSubmit} disabled={!isValid} />
        )}
      </View>
    </View>
  );
}