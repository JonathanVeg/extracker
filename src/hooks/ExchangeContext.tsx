import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import ExchangeInterface from '../controllers/exchanges/ExchangeInterface';
import Bittrex from '../controllers/exchanges/Bittrex';
import Poloniex from '../controllers/exchanges/Poloniex';

interface ExchangeContextProps {
  exchange: ExchangeInterface;
  changeExchange(to: ExchangeInterface | null): void | null;
}

const defaultExchange: ExchangeInterface = Poloniex;
const initialValue = { exchange: defaultExchange, changeExchange: null };
const ExchangeContext = createContext<ExchangeContextProps>(initialValue);

const ExchangeProvider = ({ children }) => {
  const [exchange, setExchange] = useState<ExchangeInterface | null>(null);

  useEffect(() => {
    async function load() {
      const next = await AsyncStorage.getItem(`@extracker:defaultExchange`);

      if (next)
        [Bittrex, Poloniex].map(it => {
          if (it.name === next) setExchange(it);
        });
      else setExchange(defaultExchange);
    }

    load();
  }, []);

  async function changeExchange(to: ExchangeInterface) {
    let next: ExchangeInterface;
    if (next) {
      next = to;
    } else {
      next = exchange === Bittrex ? Poloniex : Bittrex;
    }

    setExchange(next);

    await AsyncStorage.setItem(`@extracker:defaultExchange`, next.name);
  }

  if (!exchange) return null;

  return <ExchangeContext.Provider value={{ exchange, changeExchange }}>{children}</ExchangeContext.Provider>;
};

function useExchange(): ExchangeContextProps {
  const context = useContext(ExchangeContext);

  if (!context) throw new Error('useExchange must be used within a ExchangeProvider');

  return context;
}

export { useExchange, ExchangeProvider };
