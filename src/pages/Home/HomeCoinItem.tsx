import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/AntDesign';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Coin from '../../models/Coin';
import { colors } from '../../style/globals';
import MyCoin from '../../models/MyCoin';
import { useFiats } from '../../hooks/FiatContext';
import { useSummaries } from '../../hooks/SummaryContext';
import { useKeys } from '../../hooks/KeysContext';
import MyText from '../../components/MyText';

interface HomeCoinItemProps {
  onToggleFavorite: void;
  onClick: void;
  onLongClick: void;
  coin: Coin;
  market: string;
  myCoins: MyCoin[];
}

function HomeCoinItem(props: HomeCoinItemProps) {
  const { onClick, onLongClick, coin, market, myCoins, onToggleFavorite } = props;

  const myCoin = myCoins.find(it => it.name === coin.name);
  const { usingKeys } = useKeys();
  const { fiats } = useFiats();
  const { allCoinsInBtc } = useSummaries();

  if (!coin.last) return <></>;

  return (
    <CoinContainer>
      <CoinName>
        <MyText>{coin.name}</MyText>
        <TouchableOpacity onPress={onToggleFavorite}>
          <Icon name={coin.favorite ? 'heart' : 'hearto'} size={32} color={colors.black} />
        </TouchableOpacity>
      </CoinName>
      <CoinData onPress={onClick} onLongPress={onLongClick}>
        <MyText>{`Last: ${coin.last.idealDecimalPlaces()}`}</MyText>
        <MyText>{`High: ${coin.high.idealDecimalPlaces()}`}</MyText>
        <MyText>{`Low: ${coin.low.idealDecimalPlaces()}`}</MyText>
        <MyText>{`Vol: ${coin.volume.idealDecimalPlaces()}`}</MyText>
        <MyText>{`Vol (${market}): ${coin.baseVolume.idealDecimalPlaces()}`}</MyText>
        {fiats.map(fiat => (
          <MyText key={`fiat${coin.name}${fiat.label}`}>
            {`${fiat.label}: ${(coin.last * fiat.data.last * allCoinsInBtc[coin.market]).idealDecimalPlaces()}`}
          </MyText>
        ))}
        {usingKeys && myCoin && (
          <>
            <MyText>{`I Have: ${myCoin.balance}`}</MyText>
            <MyText>{`I Have (${market}): ${(myCoin.balance * coin.last).idealDecimalPlaces()}`}</MyText>
          </>
        )}
      </CoinData>
      <CoinPercent onPress={onClick}>
        <MyText style={{ color: coin.change > 0 ? colors.positive : colors.negative }}>
          {`${coin.change.toFixed(1)}%`}
        </MyText>
      </CoinPercent>
    </CoinContainer>
  );
}

export default HomeCoinItem;

const CoinContainer = styled.View`
  flex-direction: row;
  min-height: 50px;
  padding: 8px;
`;

const CoinName = styled.View`
  flex: 20;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const CoinData = styled.TouchableOpacity`
  flex: 60;
  justify-content: center;
`;

const CoinPercent = styled.TouchableOpacity`
  flex: 20;
  align-items: flex-end;
  justify-content: center;
`;
