import IconFA, { default as FA } from 'react-native-vector-icons/FontAwesome';

import RNPickerSelect from 'react-native-picker-select';
import { View, Text, StyleSheet, Alert } from 'react-native';
import styled from 'styled-components/native';
import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
import { sortArrayByKey } from '../../utils/utils';
import Coin from '../../models/Coin';
import { loadBalances, loadSummary, execOrder } from '../../controllers/Bittrex';
import MyCoin from '../../models/MyCoin';
import { H1 } from '../../components/Hs';
import { Spacer } from '../../components/Spacer';
import LabelValueBlock from '../../components/LabelValueBlock';

import MyInput from '../../components/MyInput';
import { colors } from '../../style/globals';
import { Container } from '../../components/Generics';
import { useToast } from '../../hooks/ToastContext';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function NewOrder({ route, navigation }) {
  const headerRight = () => (
    <View style={{ marginStart: 5, flexDirection: 'row' }}>
      <TouchableOpacity onPress={gotoOrders}>
        <FA name="exchange" size={25} style={{ marginEnd: 15 }} />
      </TouchableOpacity>
    </View>
  );

  const gotoOrders = () => navigation.navigate('Orders');

  navigation.setOptions({ title: 'Wallets', headerRight });

  const defaultCoin: Coin = (route.params || {}).coin || new Coin('DCR', 'BTC');
  const defaultRate = (route.params || {}).rate || 0;
  const defaultType = ((route.params || {}).type || '').toUpperCase();

  const { showToast } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [coin, setCoin] = useState<Coin>(defaultCoin);
  const lastCoin = usePrevious(coin);

  const [myCoin, setMyCoin] = useState<MyCoin>(null);
  const [myMarket, setMyMarket] = useState<MyCoin>(null);

  const [sCoin, setSCoin] = useState(defaultCoin.name);
  const [sMarket, setSMarket] = useState(defaultCoin.market);

  const [, setCoins] = useState<Coin[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [coinsNames, setCoinsNames] = useState<object[]>([]);

  // order data
  const [type, setType] = useState(defaultType || '');
  const [quantity, setQuantity] = useState('0');
  const [price, setPrice] = useState((defaultRate || 0).toString());
  const [resume, setResume] = useState('');

  useEffect(() => {
    async function loadDataFromLocalStorage() {
      const coinsFromStorage = await AsyncStorage.getItem('@extracker:coins');
      const coins = JSON.parse(coinsFromStorage);
      if (coinsFromStorage) setCoins(coins);

      const marketsFromStorage = await AsyncStorage.getItem('@extracker:markets');
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

  useEffect(() => {
    if (lastCoin?.name !== coin.name || lastCoin?.market !== coin.market) refresh();
  }, [coin]);

  useEffect(() => {
    if (!!sCoin && !!sMarket && (coin.name !== sCoin || coin.market !== sMarket)) {
      setCoin(new Coin(sCoin, sMarket));
    }
  }, [sCoin, sMarket]);

  useEffect(() => {
    const r =
      type === 'SELL'
        ? `You will ${type} ${parseFloat(quantity || '0').toFixed(8)} ${coin.name} for ${parseFloat(
            price || '0',
          ).toFixed(8)} ${coin.market} each. The total will be ${(
            parseFloat(quantity) *
            parseFloat(price) *
            1.0025
          ).toFixed(8)} ${coin.market}`
        : `You will ${type} ${parseFloat(quantity || '0').toFixed(8)} ${coin.name} for ${parseFloat(
            price || '0',
          ).toFixed(8)} ${coin.market} each. The total will be ${(parseFloat(quantity) * parseFloat(price)).toFixed(
            8,
          )} ${coin.market}`;

    setResume(r);
  }, [quantity, price, type, coin.market, coin.name]);

  async function handleCreateOrder() {
    let error = '';
    if (!type) error = `Please select if you want to buy or to sell ${coin.name}`;
    else if (parseFloat(quantity) === 0.0) error = `Please fill the quantity to ${type.toUpperCase()} ${coin.name}`;
    else if (parseFloat(price) === 0.0) error = `Please fill the price to ${type.toUpperCase()} ${coin.name}`;

    if (error) {
      showToast({ text: error, type: 'error' });

      return;
    }

    Alert.alert(
      'Create order',
      resume,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Do it!',
          onPress: () => callExecOrder(),
        },
      ],
      { cancelable: false },
    );
  }

  async function callExecOrder() {
    try {
      const ret = await execOrder(type, coin.market, coin.name, quantity, price);
      Alert.alert(ret.success ? 'Success' : 'Error', ret.message);
    } catch {
      Alert.alert('ERROR', 'Error while creating order');
    } finally {
      refresh();
    }
  }

  async function loadMyData() {
    const data = await loadBalances();

    setMyCoin(data.find(it => it.name === coin.name));
    setMyMarket(data.find(it => it.name === coin.market));
  }

  async function load() {
    try {
      setRefreshing(true);

      await loadSummary(coin);

      const clone = Object.assign(Object.create(Object.getPrototypeOf(coin)), coin);

      setCoin(clone);
    } finally {
      setRefreshing(false);
    }
  }

  function refresh() {
    load();
    loadMyData();
  }

  const summary = (
    <>
      <H1>
        {`SUMMARY - ${coin.name}/${coin.market}`}
        {refreshing ? '(loading...)' : ''}
      </H1>
      <Spacer margin={2} />
      <TouchableOpacity onPress={() => setPrice(coin.last.toString())}>
        <LabelValueBlock style={{ paddingBottom: 4, paddingTop: 4 }} label="Last" value={coin.last} adjustDecimals />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPrice(coin.bid.toString())}>
        <LabelValueBlock style={{ paddingBottom: 4, paddingTop: 4 }} label="Bid" value={coin.bid} adjustDecimals />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPrice(coin.ask.toString())}>
        <LabelValueBlock style={{ paddingBottom: 4, paddingTop: 4 }} label="Ask" value={coin.ask} adjustDecimals />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPrice(coin.high.toString())}>
        <LabelValueBlock
          style={{ paddingBottom: 4, paddingTop: 4 }}
          label="24h highest"
          value={coin.high}
          adjustDecimals
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPrice(coin.low.toString())}>
        <LabelValueBlock
          style={{ paddingBottom: 4, paddingTop: 4 }}
          label="24h lowest"
          value={coin.low}
          adjustDecimals
        />
      </TouchableOpacity>
    </>
  );

  const myCoinBlock = () => (
    <TouchableOpacity onPress={() => setQuantity(myCoin?.available?.toString() || '0')}>
      <LabelValueBlock
        style={{ paddingBottom: 4, paddingTop: 4 }}
        label={`${coin.name} Available`}
        value={myCoin ? myCoin.available : 0}
        adjustDecimals
      />
    </TouchableOpacity>
  );

  const myMarketBlock = () => (
    <TouchableOpacity
      onPress={() => {
        try {
          setQuantity(((myMarket.available / parseFloat(price)) * 0.9975).toFixed(8));
        } catch {
          setQuantity('0');
        }
      }}
    >
      <LabelValueBlock
        style={{ paddingBottom: 4, paddingTop: 4 }}
        label={`${coin.market} Available`}
        value={myMarket ? myMarket.available : 0}
        adjustDecimals
      />
    </TouchableOpacity>
  );

  const toggleType = (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <Text
        style={{ fontWeight: type === 'BUY' ? 'bold' : 'normal' }}
        onPress={() => {
          setType('BUY');
        }}
      >
        BUY
      </Text>
      <Text
        style={{ fontWeight: type === 'SELL' ? 'bold' : 'normal' }}
        onPress={() => {
          setType('SELL');
        }}
      >
        SELL
      </Text>
    </View>
  );

  const inputs = (
    <>
      <Text>Quantity</Text>

      <MyInput
        // keyboardType="number-pad"
        spellCheck={false}
        value={`${quantity}`}
        onChangeText={text => {
          setQuantity(text);
        }}
      />

      <Text>Price</Text>
      <MyInput
        spellCheck={false}
        value={`${price}`}
        onChangeText={text => {
          setPrice(text);
        }}
      />
    </>
  );

  const percentChangers = (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {[1, 5, 10, 20].map(p => (
          <PercentButton
            more
            key={`+${p}`}
            onPress={() => {
              setPrice(parseFloat((price * (1 + p / 100)).toFixed(8)));
            }}
          >
            <Text>{`+${p}%`}</Text>
          </PercentButton>
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {[1, 5, 10, 20].map(p => (
          <PercentButton
            less
            key={`-${p}`}
            onPress={() => {
              setPrice(parseFloat((price * (1 - p / 100)).toFixed(8)));
            }}
          >
            <Text>{`-${p}%`}</Text>
          </PercentButton>
        ))}
      </View>
    </>
  );

  // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
  return (
    <Container>
      {/* <ScrollView> */}
      <View
        style={{
          flexDirection: 'column',
          margin: 5,
          padding: 5,
          justifyContent: 'space-evenly',
        }}
      >
        <View>
          <H1>Select the market</H1>
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

        <View>
          <H1>Select the coin</H1>
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
      </View>

      {summary}
      {myCoinBlock()}
      {myMarketBlock()}

      {inputs}
      {percentChangers}
      {toggleType}

      <ExecOrderButton onPress={handleCreateOrder} type={type}>
        <Text style={{ textAlign: 'center' }}>Create Order</Text>
      </ExecOrderButton>
      <Text>{resume}</Text>
      {/* </ScrollView> */}
    </Container>
  );
}

const PercentButton = styled.TouchableOpacity`
  border-width: ${StyleSheet.hairlineWidth}px;
  padding: 8px;
  margin: 3px;
  border-color: ${({ more }) => (more ? colors.buyBackground : colors.sellBackground)};
`;

const ExecOrderButton = styled.TouchableOpacity`
  border-width: ${StyleSheet.hairlineWidth}px;
  margin: 8px;
  padding: 8px;
  border-color: ${({ type }) => (type === 'SELL' ? colors.sellBackground : colors.buyBackground)};
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
