import React from 'react';

import { FiatProvider } from './FiatContext';
import { KeysProvider } from './KeysContext';
import { ToastProvider } from './ToastContext';

export default function AppProvider({ children }) {
  return (
    <ToastProvider>
      <KeysProvider>
        <FiatProvider>{children}</FiatProvider>
      </KeysProvider>
    </ToastProvider>
  );
}
