import React, { createContext, useEffect, useState, useContext } from 'react';
import { Platform } from 'react-native';
import StorageUtils from '../utils/StorageUtils';
import { useExchange } from './ExchangeContext';

interface KeysContextProps {
  usingKeys: boolean;
  key: string;
  secret: string;
  hasKeys: boolean;
  reloadKeys(): void | null;
}

const initialValue = { usingKeys: false, key: '', secret: '', hasKeys: false, reloadKeys: null };

const KeysContext = createContext<KeysContextProps>(initialValue);

const KeysProvider = ({ children }) => {
  const usingIosKeys = true;
  const { exchange } = useExchange();
  const usingKeys = Platform.OS !== 'ios' || usingIosKeys;
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');

  function reloadKeys() {
    StorageUtils.getKeys(exchange).then(s => {
      setKey(s.key);
      setSecret(s.secret);
    });
  }

  useEffect(() => {
    reloadKeys();
  }, []);

  return (
    <KeysContext.Provider value={{ usingKeys, key, secret, hasKeys: !!key && !!secret, reloadKeys }}>
      {children}
    </KeysContext.Provider>
  );
};

function useKeys(): KeysContextProps {
  const context = useContext(KeysContext);

  if (!context) throw new Error('useKeys must be used within a KeysProvider');

  return context;
}

export { useKeys, KeysProvider };
