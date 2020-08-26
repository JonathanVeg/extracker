import { BlurView } from '@react-native-community/blur';
import AsyncStorage from '@react-native-community/async-storage';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { default as Icon } from 'react-native-vector-icons/MaterialIcons';
import { default as MCI } from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as FA } from 'react-native-vector-icons/FontAwesome';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import BlackWhiteBlock from '../../components/BlackWhiteBlock';
import Coin from '../../models/Coin';
import FiatBlock from '../../components/FiatBlock';
import FiatsBlock from './FiatsBlock';
import HamburgerIcon from '../../components/HamburgerIcon';
import HomeCoinItem from './HomeCoinItem';
import MyCoin from '../../models/MyCoin';
import StorageUtils from '../../utils/StorageUtils';
import { Container } from '../../components/Generics';
import { H1 } from '../../components/Hs';
import { loadBalances, loadMarketSummaries } from '../../controllers/Exchange';
import { loadMarketSummaries as pLoad } from '../../controllers/Poloniex';
import { sortArrayByKey } from '../../utils/utils';
import { useFiats } from '../../hooks/FiatContext';
import { useKeys } from '../../hooks/KeysContext';
import { useSummaries } from '../../hooks/SummaryContext';
import { colors } from '../../style/globals';
import HomeCoinItemCompact from './HomeCoinItemCompact';
import CoinPageChart from '../Coin/Chart';
import { sort } from 'core-js/fn/array';

export default function Home({ navigation }) {
  const { usingKeys, hasKeys } = useKeys();
  const [sortCoinsBy, setSortCoinsBy] = useState('baseVolume');

  navigation.setOptions({
    title: 'Trextracker',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
    headerRight: () => headerRight,
  });

  const gotoWallets = () => navigation.navigate('Wallets');

  const headerRight = usingKeys && (
    <View style={{ marginStart: 5, flexDirection: 'row' }}>
      <TouchableOpacity onPress={gotoWallets}>
        <MCI name="wallet" size={25} style={{ marginEnd: 15 }} />
      </TouchableOpacity>
    </View>
  );

  const [chartCoin, setChartCoin] = useState<Coin | null>(null);
  const [compactMode, setCompactMode] = useState(false);
  const { allCoinsInBtc, markets } = useSummaries();
  const [coins, setCoins] = useState<Coin[]>([]);
  const { fiats, reloadFiats } = useFiats();
  const [showBalanceBlock, setShowBalanceBlock] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [market, setMarket] = useState<string>('BTC');
  const [hideSmall, setHideSmall] = useState<boolean>(false);
  const [myCoins, setMyCoins] = useState<MyCoin[]>([]);
  const [search, setSearch] = useState('');

  async function refresh() {
    await loadCompactModeFromLocalStorage();

    let hideSmall = false;

    if (hasKeys) {
      const hide = (await StorageUtils.getItem('hideSmall')) === 'true';

      hideSmall = hide;
    }

    setHideSmall(hideSmall);

    loadCoins();

    reloadFiats();
  }

  useEffect(() => {
    async function run() {
      let sortCoinsBy = await AsyncStorage.getItem('@extracker:sortCoinsBy');
      sortCoinsBy = sortCoinsBy || 'baseVolume';

      setSortCoinsBy(sortCoinsBy);

      refresh();

      if (hasKeys) loadMyCoins();

      pLoad();
    }

    run();
  }, []);

  useEffect(() => {
    if (hasKeys) loadMyCoins();
  }, [hasKeys]);

  useEffect(() => {
    async function saveIt() {
      await AsyncStorage.setItem('@extracker:sortCoinsBy', sortCoinsBy);
    }

    saveIt();
  }, [sortCoinsBy]);

  function toggleSearch() {
    if (showSearch) setSearch('');

    setShowSearch(!showSearch);
  }

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

      const favs = new Set(cc.filter(it => it.favorite).map(it => it.name));

      c.toggleFavorite();

      if (c.favorite) favs.add(c.name);
      else favs.delete(c.name);

      await AsyncStorage.setItem('@extracker:favs', JSON.stringify(Array.from(favs)));

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
  }

  async function loadCompactModeFromLocalStorage() {
    const compactModeFromStorage = await AsyncStorage.getItem('@extracker:compactMode');

    if (compactModeFromStorage) setCompactMode(!!compactModeFromStorage);
  }

  async function toggleCompactMode() {
    await AsyncStorage.setItem('@extracker:compactMode', !compactMode ? 'true' : '');

    setCompactMode(!compactMode);
  }

  async function changeSortMode() {
    const options = [
      {
        text: sortCoinsBy === 'baseVolume' ? 'Volume (current)' : 'Volume',
        onPress: () => setSortCoinsBy('baseVolume'),
      },
      {
        text: sortCoinsBy === 'name' ? 'Name (current)' : 'Name',
        onPress: () => setSortCoinsBy('name'),
      },
      {
        text: sortCoinsBy === 'last' ? 'Last price (current)' : 'Last price',
        onPress: () => setSortCoinsBy('last'),
      },
      {
        text: 'Do not change',
        style: 'cancel',
      },
    ];

    Alert.alert('Sort coins by', `Select an option`, options, { cancelable: true });
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
    } finally {
      setRefreshing(false);
    }
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

    coinsToShow = sortArrayByKey(coinsToShow, sortCoinsBy, sortCoinsBy !== 'name');

    if (hideSmall) {
      coinsToShow = coinsToShow.filter(it => myCoins.find(i => i.name === it.name));
    }

    coinsToShow = [
      ...coinsToShow.filter(it => myCoins.find(myIt => myIt.name === it.name)).filter(it => it.favorite),
      ...coinsToShow.filter(it => !myCoins.find(myIt => myIt.name === it.name)).filter(it => it.favorite),
      ...coinsToShow.filter(it => myCoins.find(myIt => myIt.name === it.name)).filter(it => !it.favorite),
      ...coinsToShow.filter(it => !myCoins.find(myIt => myIt.name === it.name)).filter(it => !it.favorite),
    ];

    return coinsToShow;
  };

  const coinsToShow = getCoinsToShow();

  const TopBlock = () => (
    <TopBlockContainer>
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
    </TopBlockContainer>
  );

  const HeaderBlock = () => (
    <Header>
      <H1>COINS</H1>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={toggleSearch}>
          <FA name={showSearch ? 'search-minus' : 'search-plus'} size={20} style={{ margin: 3 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCompactMode}>
          <FA name={compactMode ? 'list' : 'table'} size={20} style={{ margin: 3 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={changeSortMode}>
          <FA name="sort" size={20} style={{ margin: 3 }} />
        </TouchableOpacity>
      </View>
    </Header>
  );

  const MarketSelectorBlock = () => (
    <MarketSelectorBlockContainer>
      <FlatList
        keyExtractor={it => it}
        horizontal
        style={{ padding: 8 }}
        data={markets}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity key={`selectmarket${item}`} style={{ padding: 8 }} onPress={() => setMarket(item)}>
              <Text style={{ textAlign: 'center', fontWeight: market === item ? 'bold' : 'normal' }}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </MarketSelectorBlockContainer>
    // <MarketSelectorBlockContainer>
    //   {markets.map(it => (
    //     <TouchableOpacity key={`selectmarket${it}`} style={{ padding: 8 }} onPress={() => setMarket(it)}>
    //       <Text style={{ textAlign: 'center', fontWeight: market === it ? 'bold' : 'normal' }}>{it}</Text>
    //     </TouchableOpacity>
    //   ))}
    // </MarketSelectorBlockContainer>
  );

  const SearchBlock = () =>
    showSearch && (
      <TextInput
        autoFocus
        style={{
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'black',
          color: colors.darker,
          padding: 3,
        }}
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
      />
    );

  const HideSmallBlock = () =>
    hasKeys && (
      <TouchableOpacity
        onPress={() => {
          setHideSmall(!hideSmall);
          StorageUtils.setItem('hideSmall', `${!hideSmall}`);
        }}
      >
        <Text>{hideSmall ? 'Show small balances' : 'Hide small balances'}</Text>
      </TouchableOpacity>
    );

  const ChartBlock = () =>
    chartCoin && (
      <>
        <BlurView style={styles.absolute} blurType="light" blurAmount={8} reducedTransparencyFallbackColor="white" />

        <ChartContainer>
          <ChartSubContainer>
            <TouchableOpacity
              style={{
                width: 30,
                height: 30,
                position: 'absolute',
                top: -30,
                right: 0,
                marginTop: 3,
                marginRight: 3,
              }}
              onPress={() => setChartCoin(null)}
            >
              <View>
                <Icon name="close" size={30} />
              </View>
            </TouchableOpacity>
            <CoinPageChart showControllers={false} coin={chartCoin} />
          </ChartSubContainer>
        </ChartContainer>
      </>
    );

  return (
    <>
      <Container>
        <TopBlock />

        <HeaderBlock />

        <SearchBlock />

        <HideSmallBlock />

        <MarketSelectorBlock />

        {compactMode && (
          <FlatList
            onRefresh={refresh}
            refreshing={refreshing}
            numColumns={3}
            style={{ alignSelf: 'stretch', margin: 8 }}
            keyExtractor={item => `${item.name}`}
            showsVerticalScrollIndicator={false}
            data={coinsToShow}
            renderItem={({ item }) => (
              <HomeCoinItemCompact
                market={market}
                coin={item}
                myCoins={myCoins}
                onToggleFavorite={() => toggleFavorite(item)}
                onClick={() => navigation.navigate('Coins', { coin: item })}
                onLongClick={() => setChartCoin(item)}
              />
            )}
          />
        )}

        {!compactMode && (
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
                onLongClick={() => setChartCoin(item)}
              />
            )}
          />
        )}
      </Container>

      <ChartBlock />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

const ChartContainer = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  justify-content: center;
  z-index: 888;
  background-color: #cccccc10;
`;

const ChartSubContainer = styled.View`
  flex: 1;
  margin: 30% 8%;
  border-radius: 10px;
  background-color: #ccccccff;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TopBlockContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const MarketSelectorBlockContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
