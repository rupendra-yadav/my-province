// components/payments/EasebuzzCheckout.tsx
//
// Install first: npx expo install react-native-webview
//
// Purely presentational — starting the payment (POST /payments/:id/pay)
// happens in PaymentsContext.pay(), not here. This component just shows
// whatever payUrl it's given and reports back what happened.

import React, { useState } from 'react';
import { Modal, View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useTheme } from '../../context/ThemeContext';

export type CheckoutOutcome = 'success' | 'failure' | 'cancelled';

interface Props {
  visible: boolean;
  payUrl: string | null;
  onClose: (outcome: CheckoutOutcome) => void;
}

// Matches GET /payments/easebuzz/redirect on the backend.
const REDIRECT_PATH = '/payments/easebuzz/redirect';

export function EasebuzzCheckout({ visible, payUrl, onClose }: Props) {
  const { colors } = useTheme();
  const [finished, setFinished] = useState(false);

  // Reset the "already finished" guard each time a fresh payUrl comes in.
  React.useEffect(() => {
    setFinished(false);
  }, [payUrl]);

  const handleNavChange = (nav: WebViewNavigation) => {
    if (finished || !nav.url.includes(REDIRECT_PATH)) return;
    setFinished(true);
    const success = nav.url.includes('result=success');
    setTimeout(() => onClose(success ? 'success' : 'failure'), 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => onClose('cancelled')}
    >
      {!payUrl ? (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <WebView
          source={{ uri: payUrl }}
          onNavigationStateChange={handleNavChange}
          startInLoadingState
          renderLoading={() => (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          )}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
