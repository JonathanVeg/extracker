import { default as Icon } from 'react-native-vector-icons/MaterialIcons';
import { default as FA } from 'react-native-vector-icons/FontAwesome';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import styled from 'styled-components/native';
import { TextInput } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import Coin from '../../models/Coin';
import MyCoin from '../../models/MyCoin';
import { loadBalances, loadMarketSummaries } from '../../controllers/Bittrex';
import FiatsBlock from './FiatsBlock';
import { sortArrayByKey } from '../../utils/utils';
import HamburgerIcon from '../../components/HamburgerIcon';
import HomeCoinItem from '../HomeCoinItem';
import FiatBlock from '../../components/FiatBlock';
import { H1 } from '../../components/Hs';
import BlackWhiteBlock from '../../components/BlackWhiteBlock';
import StorageUtils from '../../utils/StorageUtils';
import { Container } from '../../components/Generics';
import { useFiats } from '../../context/FiatContext';
import { useKeys } from '../../context/KeysContext';

export default function Home({ navigation }) {
  navigation.setOptions({
    title: 'Trextracker',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
  });

  const { fiats } = useFiats();
  const { hasKeys } = useKeys();
  const [showBalanceBlock, setShowBalanceBlock] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [allCoinsInBtc, setAllCoinsInBtc] = useState({});
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [markets, setMarkets] = useState<string[]>(['BTC']);
  const [market, setMarket] = useState<string>('BTC');
  const [hideSmall, setHideSmall] = useState<boolean>(false);
  const [myCoins, setMyCoins] = useState<MyCoin[]>([]);
  const [search, setSearch] = useState('');

  async function refresh() {
    let hideSmall = false;

    if (hasKeys) {
      const hide = (await StorageUtils.getItem('hideSmall')) === 'true';

      hideSmall = hide;
    }

    setHideSmall(hideSmall);

    loadCoins();

    if (hasKeys) {
      loadMyCoins();
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function loadFavorites(): Promise<string[]> {
    try {
      const value = await AsyncStorage.getItem('@extracker:favs');

      return value !== null ? JSON.parse(value) : [];
    } catch (e) {
      return [];
    }
  }

  async function toggleFavorite(c: Coin) {
    try {
      const cc = [...coins];
      c.toggleFavorite();

      const favs = Array.from(new Set(cc.filter(it => it.favorite).map(it => it.name)));

      await AsyncStorage.setItem('@extracker:favs', JSON.stringify(favs));

      setCoins(cc);

      return true;
    } catch (e) {
      console.log(`ERROR ${e}`);
      return false;
    }
  }

  async function loadMyCoins() {
    const myCoins = await loadBalances();

    setMyCoins(myCoins);
  }

  async function loadDataFromLocalStorage() {
    const coinsFromStorage = await AsyncStorage.getItem('@extracker:coins');

    if (coinsFromStorage) setCoins(JSON.parse(coinsFromStorage));

    const marketsFromStorage = await AsyncStorage.getItem('@extracker:markets');

    if (marketsFromStorage) setMarkets(JSON.parse(marketsFromStorage));
  }

  async function loadCoins() {
    try {
      setRefreshing(true);

      await loadDataFromLocalStorage();

      const data = await loadMarketSummaries();

      const favs = await loadFavorites();

      const coins = data[0];

      coins
        .filter(it => favs.includes(it.name))
        .map(it => {
          it.favorite = true;

          return it;
        });

      setCoins(coins);

      setMarkets(data[1]);

      calcAllCoinsInBtc(coins, data[1]);
    } finally {
      setRefreshing(false);
    }
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

    setAllCoinsInBtc(allCoinsInBtc);

    return allCoinsInBtc;
  }

  function totalInMarket(): number {
    let totalInMarket = 0;

    myCoins.map(it => {
      if (it.name === market) totalInMarket += it.balance;
      else if (allCoinsInBtc[it.name] && allCoinsInBtc[market]) {
        const part = (allCoinsInBtc[it.name] * it.balance) / allCoinsInBtc[market];

        totalInMarket += part;
      }
    });

    return totalInMarket;
  }

  const itemSeparator = () => <View style={{ width: '100%', height: 2, backgroundColor: 'lightgray' }} />;

  const TotalBalanceBlock = () => {
    return (
      <View>
        <H1>Total Balance</H1>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <BlackWhiteBlock label={market} amount={totalInMarket()} />
          {fiats
            .filter(it => it.data)
            .map(it => {
              const marketInBtc = allCoinsInBtc[market];

              return <FiatBlock fiat={it} amount={totalInMarket() * marketInBtc} key={`mytotal_${it.name}`} />;
            })}
        </View>
      </View>
    );
  };

  const getCoinsToShow = () => {
    let coinsToShow = coins.filter(it => it.name.indexOf(search.trim().toUpperCase()) !== -1 && it.market === market);

    coinsToShow = sortArrayByKey(coinsToShow, 'baseVolume', true);

    if (hideSmall) {
      coinsToShow = coinsToShow.filter(it => myCoins.find(i => i.name === it.name));
    }

    coinsToShow = [
      ...coinsToShow.filter(it => myCoins.find(myIt => myIt.name === it.name)).filter(it => it.favorite),
      ...coinsToShow.filter(it => myCoins.find(myIt => myIt.name === it.name)).filter(it => !it.favorite),
      ...coinsToShow.filter(it => !myCoins.find(myIt => myIt.name === it.name)).filter(it => it.favorite),
      ...coinsToShow.filter(it => !myCoins.find(myIt => myIt.name === it.name)).filter(it => !it.favorite),
    ];

    return coinsToShow;
  };

  const coinsToShow = getCoinsToShow();

  const TopBlock = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        {showBalanceBlock ? (
          <TotalBalanceBlock />
        ) : (
          <FiatsBlock fiats={fiats} market={market} allCoinsInBtc={allCoinsInBtc} />
        )}
      </View>
      {hasKeys && (
        <TouchableOpacity onPress={() => setShowBalanceBlock(!showBalanceBlock)}>
          <Icon name="chevron-right" size={30} />
        </TouchableOpacity>
      )}
    </View>
  );

  const HeaderBlock = () => (
    <Header>
      <H1>COINS</H1>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
          <FA name={showSearch ? 'search-minus' : 'search-plus'} size={20} style={{ margin: 3 }} />
        </TouchableOpacity>
      </View>
    </Header>
  );

  const MarketSelectorBlock = () => (
    <MarketSelectorBlockContainer>
      {markets.map(it => (
        <TouchableOpacity key={`selectmarket${it}`} style={{ flex: 1, padding: 8 }} onPress={() => setMarket(it)}>
          <Text
            style={{
              textAlign: 'center',
              fontWeight: market === it ? 'bold' : 'normal',
            }}
          >
            {it}
          </Text>
        </TouchableOpacity>
      ))}
    </MarketSelectorBlockContainer>
  );

  return (
    <Container>
      <TopBlock />

      <HeaderBlock />

      {showSearch && (
        <TextInput
          autoFocus
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'black',
            padding: 3,
          }}
          placeholder="Search..."
          onChangeText={setSearch}
        />
      )}

      {hasKeys && (
        <TouchableOpacity
          onPress={() => {
            setHideSmall(!hideSmall);
            StorageUtils.setItem('hideSmall', `${!hideSmall}`);
          }}
        >
          <Text>{hideSmall ? 'Show small balances' : 'Hide small balances'}</Text>
        </TouchableOpacity>
      )}

      <MarketSelectorBlock />

      <FlatList
        onRefresh={loadCoins}
        refreshing={refreshing}
        style={{ alignSelf: 'stretch', margin: 8 }}
        keyExtractor={item => `${item.name}`}
        showsVerticalScrollIndicator={false}
        data={coinsToShow}
        ItemSeparatorComponent={itemSeparator}
        renderItem={({ item }) => (
          <HomeCoinItem
            market={market}
            coin={item}
            myCoins={myCoins}
            onToggleFavorite={() => toggleFavorite(item)}
            onClick={() => navigation.navigate('Coins', { coin: item })}
          />
        )}
      />
    </Container>
  );
}

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const MarketSelectorBlockContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
