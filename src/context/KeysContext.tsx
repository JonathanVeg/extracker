import React, { createContext, useEffect, useState, useContext } from 'react';
import StorageUtils from '../utils/StorageUtils';

interface KeysContextI {
  key: string;
  secret: string;
  hasKeys: boolean;
  reloadKeys(): void | null;
}

const initialValue = { key: '', secret: '', hasKeys: false, reloadKeys: null };

const KeysContext = createContext<KeysContextI>(initialValue);

const KeysProvider = ({ children }) => {
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');

  function reloadKeys() {
    StorageUtils.getKeys().then(s => {
      setKey(s.key);
      setSecret(s.secret);
    });
  }

  useEffect(() => {
    reloadKeys();
  }, []);

  return (
    <KeysContext.Provider
      value={{ key, secret, hasKeys: !!key && !!secret, reloadKeys }}
    >
      {children}
    </KeysContext.Provider>
  );
};

function useKeys(): KeysContextI {
  const context = useContext(KeysContext);

  if (!context) throw new Error('useKeys must be used within a KeysProvider');

  return context;
}

export { useKeys, KeysProvider };
