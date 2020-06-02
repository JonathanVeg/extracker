import React from 'react';

import { FiatProvider } from './FiatContext';
import { KeysProvider } from './KeysContext';
import { ToastProvider } from './ToastContext';
import { SummaryProvider } from './SummaryContext';

export default function AppProvider({ children }) {
  return (
    <ToastProvider>
      <SummaryProvider>
        <KeysProvider>
          <FiatProvider>{children}</FiatProvider>
        </KeysProvider>
      </SummaryProvider>
    </ToastProvider>
  );
}
