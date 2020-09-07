import React from 'react';

import { FiatProvider } from './FiatContext';
import { KeysProvider } from './KeysContext';
import { ToastProvider } from './ToastContext';
import { SummaryProvider } from './SummaryContext';
import { ExchangeProvider } from './ExchangeContext';

export default function AppProvider({ children }) {
  return (
    <ExchangeProvider>
      <ToastProvider>
        <SummaryProvider>
          <KeysProvider>
            <FiatProvider>{children}</FiatProvider>
          </KeysProvider>
        </SummaryProvider>
      </ToastProvider>
    </ExchangeProvider>
  );
}
