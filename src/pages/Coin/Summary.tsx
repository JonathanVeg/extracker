import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import Coin from '../../models/Coin';
import { loadSummary, loadBalance } from '../../controllers/Bittrex';
import LabelValueBlock from '../../components/LabelValueBlock';
import MyCoin from '../../models/MyCoin';
import { Spacer } from '../../components/Spacer';
import { H1 } from '../../components/Hs';
import { colors } from '../../style/globals';
import { Container } from '../../components/Generics';

interface CoinPageSummaryInterface {
  coin: Coin | null;
}

export default function CoinPageSummary(props: CoinPageSummaryInterface) {
  const [refreshing, setRefreshing] = useState(false);
  const [coin, setCoin] = useState<Coin>(props.coin || new Coin('DCR', 'BTC'));
  const [myCoin, setMyCoin] = useState<MyCoin | null>(null);

  async function loadMyData() {
    const data = await loadBalance(coin.name);

    if (data.available !== null) setMyCoin(data);
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

  const Summary = () => {
    let i = 0;

    function color() {
      i++;
      return i % 2 === 0 ? colors.white : colors.lighter;
    }

    return (
      <>
        <H1 center>Summary</H1>
        <Spacer margin={2} />

        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="Last"
          value={coin.last}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="Bid"
          value={coin.bid}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="Ask"
          value={coin.ask}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="% Spread"
          value={coin.spread.toFixed(2)}
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="24h highest"
          value={coin.high}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="24h lowest"
          value={coin.low}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="% change"
          value={coin.change.toFixed(1)}
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label={`24h ${coin.market} vol.`}
          value={coin.baseVolume}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label={`24h ${coin.name} vol.`}
          value={coin.volume}
        />
      </>
    );
  };

  const myCoinBlock = () => {
    let i = 0;

    function color() {
      i++;
      return i % 2 === 0 ? colors.white : colors.lighter;
    }

    return (
      <>
        <H1 center>My Data</H1>
        <Spacer margin={2} />

        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="I have"
          value={myCoin.balance}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="Available"
          value={myCoin.available}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="Pending"
          value={myCoin.pending}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label={`Eq. in ${coin.market}`}
          value={myCoin.balance * coin.last}
          adjustDecimals
        />
        <LabelValueBlock
          style={{ padding: 3, backgroundColor: color() }}
          label="Deposit address"
          value={myCoin.address}
          copiable
        />
      </>
    );
  };

  return (
    <Container>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <Summary />
        <Spacer />
        {myCoin && myCoinBlock()}

        {/* <SectionList/> */}
      </ScrollView>
    </Container>
  );
}
