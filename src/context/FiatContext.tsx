import React, { createContext, useEffect, useState } from 'react';

import Fiat from '../controllers/fiats/Fiat';
import listFiats from '../controllers/fiats/FiatsHelper';

interface FiatContextI {
  fiats: Fiat[];
  reloadFiats(): void;
}

const initialValue: Fiat[] = [];

export const FiatContext = createContext<FiatContextI>(initialValue);

export const FiatProvider = ({ children }) => {
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
