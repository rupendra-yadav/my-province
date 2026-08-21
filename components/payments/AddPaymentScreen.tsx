// components/payments/AddPaymentScreen.tsx
// Body content for the admin "Add Payment" screen — records a payment
// received outside the app. Wrapped by app/(admin)/payment/add.tsx.

import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PaymentMode, recordOfflinePayment, searchResidents } from '../../services/endpoints';
import { DateField, ResidentField, ResidentOption, SelectField, TextField } from '../forms/fields';
import { PrimaryButton } from '../ui';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const PAYMENT_MODES: { label: string; value: PaymentMode }[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'UPI', value: 'upi' },
  { label: 'Card', value: 'card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Other', value: 'other' },
];

export function AddPaymentContent({ onDone }: { onDone?: () => void }) {
  const { spacing } = useTheme();
  const { session } = useAuth();

  const [resident, setResident] = useState<ResidentOption | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [paymentMode, setPaymentMode] = useState<PaymentMode | ''>('');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const amountValue = Number(amount);
  const isValid = !!resident && amountValue > 0 && !!paymentDate && !!paymentMode;

  const handleSubmit = async () => {

    if (!isValid || !resident || !paymentMode) {
      Alert.alert('Incomplete form', 'Please fill in the resident, amount, date, and payment mode.');
      return;
    }

    setSubmitting(true);
    try {
      await recordOfflinePayment({
        unitId: resident.unitId,
        userId: resident.userId,
        amount: amountValue,
        paymentDate,
        paymentMode,
        referenceNo: referenceNo.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      Alert.alert('Payment recorded', `₹${amountValue.toLocaleString('en-IN')} recorded for ${resident.name}.`, [
        { text: 'OK', onPress: onDone },
      ]);
    } catch (err: any) {
      Alert.alert('Could not record payment', err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <ResidentField
        selected={resident}
        onSelect={setResident}
        search={(query) => searchResidents(query).then((r) => r.residents)}
        required
      />

      <TextField
        label="Amount"
        required
        value={amount}
        onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <DateField label="Payment Date" required value={paymentDate} onChange={setPaymentDate} />

      <SelectField
        label="Payment Mode"
        required
        value={paymentMode}
        placeholder="Select Mode"
        options={PAYMENT_MODES}
        onSelect={(opt) => setPaymentMode(opt.value as PaymentMode)}
      />

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
          <PrimaryButton label="Add Payment" onPress={handleSubmit} disabled={!isValid} />
        )}
      </View>
    </View>
  );
}
