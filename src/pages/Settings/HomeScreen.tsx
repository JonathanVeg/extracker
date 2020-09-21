import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import { Row } from '../../components/Generics';
import { H1 } from '../../components/Hs';
import MyText from '../../components/MyText';
import { useExchange } from '../../hooks/ExchangeContext';
import StorageUtils from '../../utils/StorageUtils';
import { useKeys } from '../../hooks/KeysContext';

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
      {optionsToHomeScreen.map(it => (
        <View>
          <TouchableWithoutFeedback
            onPress={() => {
              const items = [...optionsToHomeScreen];

              items.find(it2 => it2 === it).showing = !items.find(it2 => it2 === it).showing;

              setOptionsToHomeScreen(items);

              updatePreferences();
            }}
          >
            <Row>
              <MyCheckbox checked={it.showing} />
              <MyText>{it.label}</MyText>
            </Row>
          </TouchableWithoutFeedback>
        </View>
      ))}
    </>
  );
};

export default HomeScreen;

const MyCheckbox = styled.View`
  height: 20px;
  width: 20px;
  border-radius: 10px;
  padding: 5px;
  margin: 5px;
  border-color: black;
  background-color: ${({ checked }) => (checked ? 'black' : 'transparent')};
  border-width: 1px;
`;
