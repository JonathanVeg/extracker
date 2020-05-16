import styled from 'styled-components/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import Coin from '../../models/Coin';
import { loadSummary, loadBalances } from '../../controllers/Bittrex';
import LabelValueBlock from '../../components/LabelValueBlock';
import MyCoin from '../../models/MyCoin';
import { Spacer } from '../../components/Spacer';
import { H1 } from '../../components/Hs';
import { colors } from '../../style/globals';

export default function CoinPageSummary(props) {
  const [refreshing, setRefreshing] = useState(false);
  const [coin, setCoin] = useState<Coin>(props.coin || new Coin('DCR', 'BTC'));
  const [myCoin, setMyCoin] = useState<MyCoin>(null);

  async function loadMyData() {
    const data = await loadBalances();

    setMyCoin(data.find(it => it.name === coin.name));
  }

  async function load() {
    try {
      setRefreshing(true);

      await loadSummary(coin);

      const clone = Object.assign(
        Object.create(Object.getPrototypeOf(coin)),
        coin,
      );

      setCoin(clone);
    } finally {
      setRefreshing(false);
    }
  }

  function refresh() {
    load();
    loadMyData();
  }

  useEffect(() => {
    refresh();
  }, [props]);

  const summary = (
    <>
      <H1 style={{ textAlign: 'center', width: '100%' }}>Summary</H1>
      <Spacer margin={2} />

      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.white }}
        label="Last"
        value={coin.last}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.lighter }}
        label="Bid"
        value={coin.bid}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.white }}
        label="Ask"
        value={coin.ask}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.lighter }}
        label="% Spread"
        value={coin.spread.toFixed(2)}
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.white }}
        label="24h highest"
        value={coin.high}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.lighter }}
        label="24h lowest"
        value={coin.low}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.white }}
        label="% change"
        value={coin.change.toFixed(1)}
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.lighter }}
        label={`24h ${coin.market} vol.`}
        value={coin.baseVolume}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.white }}
        label={`24h ${coin.name} vol.`}
        value={coin.volume}
      />
    </>
  );

  const myCoinBlock = () => (
    <>
      <H1 style={{ textAlign: 'center', width: '100%' }}>My Data</H1>
      <Spacer margin={2} />

      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.white }}
        label="I have"
        value={myCoin.balance}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.lighter }}
        label="Available"
        value={myCoin.available}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.white }}
        label="Pending"
        value={myCoin.pending}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.lighter }}
        label={`Eq. in ${coin.market}`}
        value={myCoin.balance * coin.last}
        adjustDecimals
      />
      <LabelValueBlock
        style={{ padding: 3, backgroundColor: colors.white }}
        label="Deposit address"
        value={myCoin.address}
        copiable
      />
    </>
  );

  return (
    <Container>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {summary}
        <Spacer />
        {myCoin && myCoinBlock()}
      </ScrollView>
    </Container>
  );
}

const Container = styled.SafeAreaView`
  flex: 1;
  margin: 8px;
`;
