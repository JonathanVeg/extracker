import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { H1, H3 } from '../../components/Hs';
import { useExchange } from '../../hooks/ExchangeContext';
import StorageUtils from '../../utils/StorageUtils';
import { useKeys } from '../../hooks/KeysContext';
import MyCheckbox from '../../components/MyCheckbox';

const HomeScreen: React.FC = () => {
  const { exchange } = useExchange();
  const { usingKeys } = useKeys();

  const [optionsToHomeScreen, setOptionsToHomeScreen] = useState([]);

  useEffect(() => {
    async function load() {
      const options = [
        { label: 'Last', key: 'last', showing: false },
        { label: 'High', key: 'high', showing: false },
        { label: 'Low', key: 'low', showing: false },
        { label: 'Vol.', key: 'vol', showing: false },
        { label: 'Base Vol.', key: 'basevol', showing: false },
        { label: 'Fiat 1', key: 'fiat1', showing: false },
        { label: 'Fiat 2', key: 'fiat2', showing: false },
      ];

      if (usingKeys) {
        options.push({ label: 'I Have', key: 'ihave', showing: false });
        options.push({ label: 'I Have (in market)', key: 'ihaveinmarket', showing: false });
      }

      const loaded = await StorageUtils.getItem(`@extracker@${exchange.name}:showOnHomeScreen`);

      if (loaded) {
        const items = loaded.split(',').map(it => it.trim());

        items.map(item => {
          options.find(it => it.key === item).showing = true;
        });
      } else {
        options.map(it => (it.showing = true));
      }

      setOptionsToHomeScreen(options);
    }

    load();
  }, []);

  const updatePreferences = async () => {
    const options = optionsToHomeScreen
      .filter(it => it.showing)
      .map(it => it.key)
      .join(',');

    await StorageUtils.setItem(`@extracker@${exchange.name}:showOnHomeScreen`, options);
  };

  return (
    <>
      <H1>Show on home screen (list mode)</H1>
      <H3>(restart the app to see the changes)</H3>
      {optionsToHomeScreen.map(it => (
        <View>
          <MyCheckbox
            checked={it.showing}
            label={it.label}
            onPress={() => {
              const items = [...optionsToHomeScreen];

              items.find(it2 => it2 === it).showing = !items.find(it2 => it2 === it).showing;

              setOptionsToHomeScreen(items);

              updatePreferences();
            }}
          />
        </View>
      ))}
    </>
  );
};

export const ALL_HOME_SCREEN_OPTIONS = [
  'last',
  'high',
  'low',
  'vol',
  'basevol',
  'fiat1',
  'fiat2',
  'ihave',
  'ihaveinmarket',
];
export default HomeScreen;
