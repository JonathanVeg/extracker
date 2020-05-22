import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { default as FA } from 'react-native-vector-icons/FontAwesome';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Coin from '../../models/Coin';
import HamburgerIcon from '../../components/HamburgerIcon';
import LabelValueBlock from '../../components/LabelValueBlock';
import MyCoin from '../../models/MyCoin';
import { H1 } from '../../components/Hs';
import { loadBalances, loadMarketSummaries } from '../../controllers/Bittrex';
import { Spacer } from '../../components/Spacer';
import { sortArrayByKey } from '../../utils/utils';
import Keys from '../Settings/Keys';
import { useFiats } from '../../context/FiatContext';
import { useKeys } from '../../context/KeysContext';

interface WalletListItem {
  myCoin: MyCoin;
  inBtc: number | null;
}

export default function WalletPage({ navigation }) {
  const { hasKeys } = useKeys();

  const headerLeft = () => <HamburgerIcon navigationProps={navigation} />;
  const headerRight = () => (
    <View style={{ marginStart: 5, flexDirection: 'row' }}>
      <TouchableOpacity onPress={gotoOrders}>
        <FA name="exchange" size={25} style={{ marginEnd: 15 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={gotoNewOrder}>
        <FA name="cart-plus" size={25} style={{ marginEnd: 15 }} />
      </TouchableOpacity>
    </View>
  );

  const gotoNewOrder = () => navigation.navigate('NewOrder');
  const gotoOrders = () => navigation.navigate('Orders');

  navigation.setOptions({ title: 'Wallets', headerLeft, headerRight });

  const { fiats } = useFiats();
  const [listItems, setListItems] = useState<WalletListItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [myCoins, setMyCoins] = useState<MyCoin[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [allCoinsInBtc, setAllCoinsInBtc] = useState<object>({});
  const [totalInBtc, setTotalInBtc] = useState(0.0);

  function calcAllCoinsInBtc() {
    const acib = { BTC: 1 };

    const fakeCoins = markets
      .filter(it => it !== 'BTC')
      .map(it => new Coin(it, 'BTC'));

    [...coins, ...fakeCoins]
      .filter(it => it.name !== 'BTC')
      .map(it => {
        let pair = coins.find(
          it2 => it2.name === it.name && it2.market === 'BTC',
        );

        if (pair) {
          acib[it.name] = pair.last;
        } else {
          pair = coins.find(
            it2 => it2.name === 'BTC' && it2.market === it.name,
          );
          if (pair) {
            acib[it.name] = 1 / pair.last;
          }
        }
      });

    setAllCoinsInBtc(acib);
  }

  useEffect(() => {
    refresh();
  }, [hasKeys]);

  useEffect(() => {
    calcAllCoinsInBtc();
  }, [coins, markets]);

  const refresh = async () => {
    if (hasKeys) {
      load();
      loadCoins();
    }
  };

  async function loadCoins() {
    const data = await loadMarketSummaries();

    setCoins(data[0]);
    setMarkets(data[1]);
  }

  async function load() {
    try {
      setRefreshing(true);

      const data = await loadBalances();

      setMyCoins(data);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    setTotalInBtc(
      myCoins.reduce(
        (last, it) => last + it.balance * (allCoinsInBtc[it.name] || 0),
        0.0,
      ),
    );

    const arr = myCoins.map(it => ({
      myCoin: it,
      inBtc: it.balance * (allCoinsInBtc[it.name] || 0.0),
    }));

    setListItems(sortArrayByKey(arr, 'inBtc', true));
  }, [myCoins, allCoinsInBtc]);

  const handleClickInCoin = (item: MyCoin) => {
    if (allCoinsInBtc[item.name])
      if (item.name === 'BTC')
        navigation.navigate('Coins', {
          coin: new Coin('BTC', 'USD'),
        });
      else
        navigation.navigate('Coins', {
          coin: new Coin(item.name, 'BTC'),
        });
  };

  if (!hasKeys)
    return (
      <Container>
        <H1 style={{ textAlign: 'center' }}>
          You need to have saved keys to use this page properly
        </H1>
        <Keys />
      </Container>
    );

  return (
    <Container>
      <BlockContainer>
        <H1 style={{ textAlign: 'center' }}>Summary</H1>
        <Spacer />
        <LabelValueBlock
          label="Qnt. coins with balance"
          value={myCoins.length}
        />
        <Spacer />
        <LabelValueBlock
          key="ihaveeqinbtc"
          label="Eq. in BTC"
          value={totalInBtc.idealDecimalPlaces()}
        />
        <Spacer />
        {fiats.map(fiat => (
          <View key={`ihaveeqin${fiat.label}`}>
            <LabelValueBlock
              label={`Eq. in ${fiat.label}`}
              value={(
                totalInBtc * (fiat?.data?.last || 0)
              ).idealDecimalPlaces()}
            />
            <Spacer />
          </View>
        ))}
      </BlockContainer>

      <Spacer margin={10} />

      <BlockContainer>
        <H1 style={{ textAlign: 'center' }}>My Coins</H1>
        <FlatList
          onRefresh={refresh}
          refreshing={refreshing}
          style={{ alignSelf: 'stretch', margin: 8 }}
          keyExtractor={item => `${item.myCoin.key}`}
          showsVerticalScrollIndicator={false}
          data={listItems}
          ItemSeparatorComponent={DivisionLine}
          renderItem={({ item }) => {
            const { myCoin } = item;

            return (
              <TouchableOpacity onPress={() => handleClickInCoin(myCoin)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <H1 style={{ flex: 1, textAlign: 'center' }}>
                    {myCoin.name}
                  </H1>
                  <View style={{ flex: 3 }}>
                    <LabelValueBlock
                      label="I have"
                      value={myCoin.balance.idealDecimalPlaces()}
                    />
                    <LabelValueBlock
                      label="I have (in BTC)"
                      value={item.inBtc.idealDecimalPlaces()}
                    />
                    <LabelValueBlock
                      label="Available"
                      value={myCoin.available.idealDecimalPlaces()}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </BlockContainer>
    </Container>
  );
}
const Container = styled.SafeAreaView`
  margin: 8px;
  width: 100%;
`;

const BlockContainer = styled.View`
  background-color: white;
  padding: 5px;
`;

const DivisionLine = styled.View`
  margin-bottom: 10px;
  margin-top: 10px;
  width: 100%;
  align-self: center;
  border-bottom-color: black;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
`;
