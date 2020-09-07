import React, { createContext, useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import Coin from '../models/Coin';
import { useExchange } from './ExchangeContext';

interface SummaryContextProps {
  coins: Coin[];
  markets: string[];
  allCoinsInBtc: object;
  reloadSummary(): void | null;
}

const initialValue = { coins: [], reloadSummary: null, allCoinsInBtc: {}, markets: [] };
const SummaryContext = createContext<SummaryContextProps>(initialValue);

const SummaryProvider = ({ children }) => {
  const { exchange } = useExchange();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [allCoinsInBtc, setAllCoinsInBtc] = useState<object>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await loadDataFromLocalStorage();
    reloadSummary();
  }

  async function loadDataFromLocalStorage() {
    const coinsFromStorage = await AsyncStorage.getItem(`@extracker@${exchange.name}:coins`);
    if (coinsFromStorage) setCoins(JSON.parse(coinsFromStorage));

    const marketsFromStorage = await AsyncStorage.getItem(`@extracker@${exchange.name}:markets`);
    if (marketsFromStorage) setMarkets(JSON.parse(marketsFromStorage));
  }

  async function reloadSummary() {
    const [coins, markets] = await exchange.loadMarketSummaries();

    setCoins(coins);
    setMarkets(markets);

    setAllCoinsInBtc(calcAllCoinsInBtc(coins, markets));
  }

  return (
    <SummaryContext.Provider value={{ allCoinsInBtc, coins, markets, reloadSummary }}>
      {children}
    </SummaryContext.Provider>
  );
};

function useSummaries(): SummaryContextProps {
  const context = useContext(SummaryContext);

  if (!context) throw new Error('useSummaries must be used within a SummaryProvider');

  return context;
}

function calcAllCoinsInBtc(coins: Coin[], markets: string[]) {
  const allCoinsInBtc = { BTC: 1 };

  const fakeCoins = markets.filter(it => it !== 'BTC').map(it => new Coin(it, 'BTC'));

  [...coins, ...fakeCoins]
    .filter(it => it.name !== 'BTC')
    .map(it => {
      let pair = coins.find(it2 => it2.name === it.name && it2.market === 'BTC');

      if (pair) {
        allCoinsInBtc[it.name] = pair.last;
      } else {
        pair = coins.find(it2 => it2.name === 'BTC' && it2.market === it.name);
        if (pair) {
          allCoinsInBtc[it.name] = 1 / pair.last;
        }
      }
    });

  return allCoinsInBtc;
}

export { useSummaries, SummaryProvider };
