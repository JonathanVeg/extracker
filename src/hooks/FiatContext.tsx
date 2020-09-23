import React, { createContext, useEffect, useState, useContext } from 'react';
import { NativeModules } from 'react-native';

import Fiat from '../controllers/fiats/Fiat';
import listFiats from '../controllers/fiats/FiatsHelper';

interface FiatContextProps {
  fiats: Fiat[];
  reloadFiats(): void | null;
}

const initialValue = { fiats: [], reloadFiats: null };
const FiatContext = createContext<FiatContextProps>(initialValue);

const FiatProvider = ({ children }) => {
  const [fiats, setFiats] = useState<Fiat[]>([]);

  useEffect(() => {
    reloadFiats();
  }, []);

  async function reloadFiats() {
    const fiats = await listFiats();

    for (let i = 0; i < fiats.length; i++) {
      await fiats[i].load();

      try {
        if (fiats[i].name === 'BRL') {
          console.log('Updating widget');
          NativeModules.WidgetHelper.UpdatePrice('BTC', `${fiats[i].data.last.idealDecimalPlaces()} ${fiats[i].name}`);
        }
      } catch (err) {
        console.log(err);
      }
    }

    setFiats(fiats);
  }

  return <FiatContext.Provider value={{ fiats, reloadFiats }}>{children}</FiatContext.Provider>;
};

function useFiats(): FiatContextProps {
  const context = useContext(FiatContext);

  if (!context) throw new Error('useFiats must be used within a FiatProvider');

  return context;
}

export { useFiats, FiatProvider };
