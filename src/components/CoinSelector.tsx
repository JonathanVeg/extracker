import RNPickerSelect from 'react-native-picker-select';
import IconFA from 'react-native-vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-community/async-storage';
import { H1 } from './Hs';
import { sortArrayByKey } from '../utils/utils';
import Coin from '../models/Coin';
import { useExchange } from '../hooks/ExchangeContext';

const CoinSelector: React.FC = ({ sMarket, setSMarket, sCoin, setSCoin }) => {
  const { exchange } = useExchange();
  const [markets, setMarkets] = useState<string[]>([]);
  const [coinsNames, setCoinsNames] = useState<object[]>([]);

  useEffect(() => {
    async function loadDataFromLocalStorage() {
      const coinsFromStorage = await AsyncStorage.getItem(`@extracker@${exchange.name}:coins`);
      const coins = JSON.parse(coinsFromStorage);

      const marketsFromStorage = await AsyncStorage.getItem(`@extracker@${exchange.name}:markets`);
      if (marketsFromStorage) setMarkets(JSON.parse(marketsFromStorage));

      const coinsNames = [];
      coins.map((coin: Coin) => {
        if (!coinsNames.includes(coin.name)) coinsNames.push(coin.name);
      });

      setCoinsNames(
        sortArrayByKey(
          coinsNames.map(it => ({ key: it, label: it, value: it })),
          'label',
        ),
      );
    }

    loadDataFromLocalStorage();
  }, []);
  return (
    <MarketPickersContainer>
      <View style={{ flex: 1 }}>
        <H1 center>Market</H1>
        <RNPickerSelect
          placeholder={{
            label: 'Select market',
          }}
          value={sMarket}
          itemKey={sMarket}
          style={pickerStyle}
          Icon={() => {
            return <IconFA name="chevron-down" size={17} color="#333" />;
          }}
          onValueChange={value => setSMarket(value)}
          items={sortArrayByKey(
            markets.map(it => ({ key: it, label: it, value: it })),
            'label',
          )}
        />
      </View>

      <View style={{ flex: 1 }}>
        <H1 center>Coin</H1>
        <RNPickerSelect
          placeholder={{
            label: 'Select coin',
          }}
          value={sCoin}
          itemKey={sCoin}
          style={pickerStyle}
          Icon={() => {
            return <IconFA name="chevron-down" size={17} color="#333" />;
          }}
          onValueChange={value => setSCoin(value)}
          items={coinsNames}
        />
      </View>
    </MarketPickersContainer>
  );
};

export default CoinSelector;
const MarketPickersContainer = styled.View`
  flex-direction: row;
  margin: 5px;
  padding: 5px;
  justify-content: space-around;
`;
const pickerStyle = {
  iconContainer: {
    borderColor: 'red',
    borderRadius: 1,
    top: 10,
    right: 0,
  },

  inputIOS: {
    color: '#333',
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 12,
    paddingBottom: 10,
  },
  inputAndroid: {
    color: '#333',
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 12,
    paddingBottom: 10,
  },
};
