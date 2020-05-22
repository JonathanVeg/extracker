import React, { createContext, useEffect, useState, useContext } from 'react';

import Fiat from '../controllers/fiats/Fiat';
import listFiats from '../controllers/fiats/FiatsHelper';

interface FiatContextI {
  fiats: Fiat[];
  reloadFiats(): void | null;
}

const initialValue = { fiats: [], reloadFiats: null };
const FiatContext = createContext<FiatContextI>(initialValue);

const FiatProvider = ({ children }) => {
  const [fiats, setFiats] = useState<Fiat[]>([]);

  useEffect(() => {
    reloadFiats();
  }, []);

  async function reloadFiats() {
    const fiats = await listFiats();

    for (let i = 0; i < fiats.length; i++) {
      await fiats[i].load();
    }

    setFiats(fiats);
  }

  return (
    <FiatContext.Provider value={{ fiats, reloadFiats }}>
      {children}
    </FiatContext.Provider>
  );
};

function useFiats(): FiatContextI {
  const context = useContext(FiatContext);

  if (!context) throw new Error('useFiats must be used within a FiatProvider');

  return context;
}

export { useFiats, FiatProvider };
