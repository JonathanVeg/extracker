import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { H1, H2 } from '../../components/Hs';
import Coin from '../../models/Coin';
import MyInput from '../../components/MyInput';
import FiatBlock from '../../components/FiatBlock';
import { Row } from '../../components/Generics';
import { colors } from '../../style/globals';
import { useFiats } from '../../hooks/FiatContext';
import { useSummaries } from '../../hooks/SummaryContext';
import { useExchange } from '../../hooks/ExchangeContext';

export default function CoinPageCalculator(props) {
  const { exchange } = useExchange();
  const { allCoinsInBtc } = useSummaries();
  const { fiats } = useFiats();

  const [coin, setCoin] = useState<Coin>(props.coin || new Coin('DCR', 'BTC'));

  const [valInCoin, setValInCoin] = useState('1');
  const [valInMarket, setValInMarket] = useState('1');
  const [valInFiats, setValInFiats] = useState<string[]>(['0']);

  async function loadData() {
    await loadFiats();
    exchange.loadSummary(coin).then(setCoin);
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
    <BlockContainer>
      <BlockText>{`${coin.market}`}</BlockText>
      <Text style={{ padding: 3 }}>{props.amount.idealDecimalPlaces()}</Text>
    </BlockContainer>
  );

  const CoinBlock = props => (
    <BlockContainer>
      <BlockText>{`${coin.name}`}</BlockText>
      <Text style={{ padding: 3 }}>{props.amount.idealDecimalPlaces()}</Text>
    </BlockContainer>
  );

  return (
    <View>
      <H1 center>CALCULATOR</H1>
      <View>
        <H2>{`Value in ${coin.name}`}</H2>
        <MyInput
          autoSave
          autoSaveKey={`@extracker@${exchange.name}:${coin.name}CalculatorValueIn${coin.name}`}
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
          autoSave={true}
          autoSaveKey={`@extracker@${exchange.name}:${coin.name}CalculatorValueIn${coin.market}`}
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
            autoSave={true}
            autoSaveKey={`@extracker@${exchange.name}:${coin.name}CalculatorValueIn${fiat.name}`}
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

const BlockContainer = styled.View`
  flex-direction: row;
  border-width: ${StyleSheet.hairlineWidth}px;
  margin: 5px;
  width: auto;
`;

const BlockText = styled.Text`
  background-color: ${colors.darker};
  color: ${colors.white};
  font-weight: bold;
  padding: 3px;
`;
