import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { H1, H2 } from '../../components/Hs';
import Coin from '../../models/Coin';
import MyInput from '../../components/MyInput';
import FiatBlock from '../../components/FiatBlock';
import { Row } from '../../components/Generics';
import { colors } from '../../style/globals';
import { loadSummary, calcAllCoinsInBtc } from '../../controllers/Bittrex';
import { useFiats } from '../../context/FiatContext';

export default function CoinPageCalculator(props) {
  const { fiats } = useFiats();
  const [allCoinsInBtc, setAllCoinsInBtc] = useState({});

  const [coin, setCoin] = useState<Coin>(props.coin || new Coin('DCR', 'BTC'));

  const [valInCoin, setValInCoin] = useState('1');
  const [valInMarket, setValInMarket] = useState('1');
  const [valInFiats, setValInFiats] = useState<string[]>(['0']);

  async function loadData() {
    await loadFiats();

    const acib = await calcAllCoinsInBtc();
    setAllCoinsInBtc(acib);

    loadSummary(coin).then(setCoin);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadFiats() {
    const valInFiats = [];

    fiats.map(_ => valInFiats.push('1'));

    setValInFiats(valInFiats);
  }

  const MarketBlock = props => (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: StyleSheet.hairlineWidth,
        margin: 5,
        width: 'auto',
      }}
    >
      <Text
        style={{
          backgroundColor: colors.darker,
          color: colors.white,
          fontWeight: 'bold',
          padding: 3,
        }}
      >
        {`${coin.market}`}
      </Text>
      <Text style={{ padding: 3 }}>{props.amount.idealDecimalPlaces()}</Text>
    </View>
  );

  const CoinBlock = props => (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: StyleSheet.hairlineWidth,
        margin: 5,
        width: 'auto',
      }}
    >
      <Text
        style={{
          backgroundColor: colors.darker,
          color: colors.white,
          fontWeight: 'bold',
          padding: 3,
        }}
      >
        {`${coin.name}`}
      </Text>
      <Text style={{ padding: 3 }}>{props.amount.idealDecimalPlaces()}</Text>
    </View>
  );

  return (
    <View>
      <H1 center>CALCULATOR</H1>
      <View>
        <H2>{`Value in ${coin.name}`}</H2>
        <MyInput
          value={valInCoin}
          onChangeText={text => {
            setValInCoin(text);
          }}
        />

        <Row>
          <MarketBlock amount={allCoinsInBtc[coin.name] * parseFloat(valInCoin) || 0} />
          {fiats.map(fiat => (
            <FiatBlock
              key={`calcfiat2${fiat.name}`}
              fiat={fiat}
              amount={allCoinsInBtc[coin.name] * parseFloat(valInCoin) || 0}
            />
          ))}
        </Row>
      </View>

      <View>
        <H2>{`Value in ${coin.market}`}</H2>
        <MyInput
          value={valInMarket}
          onChangeText={text => {
            setValInMarket(text);
          }}
        />
        <Row>
          <CoinBlock amount={parseFloat(valInMarket) / allCoinsInBtc[coin.name] || 0} />
        </Row>
      </View>

      {fiats.map((fiat, index) => (
        <View key={`calcfiat${fiat.name}`}>
          <H2>{`Value in ${fiat.name}`}</H2>
          <MyInput
            value={valInFiats[index]}
            onChangeText={text => {
              const vif = [...valInFiats];
              vif[index] = text;
              setValInFiats(vif);
            }}
          />
          <Row>
            <CoinBlock
              amount={
                (valInFiats.length >= index - 1 ? parseFloat(valInFiats[index]) : 0) /
                  (fiat.data.last * allCoinsInBtc[coin.name]) || 0
              }
            />
          </Row>
        </View>
      ))}
    </View>
  );
}
