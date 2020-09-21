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
  showInHomeScreen: string[];
}

function HomeCoinItem(props: HomeCoinItemProps) {
  const { onClick, onLongClick, coin, market, myCoins, onToggleFavorite, showInHomeScreen } = props;

  const myCoin = myCoins.find(it => it.name === coin.name);
  const { usingKeys } = useKeys();
  const { fiats } = useFiats();
  const { allCoinsInBtc } = useSummaries();

  if (!coin.last) return <></>;

  const itemsToShow = [];

  if (showInHomeScreen.indexOf('last') !== -1)
    itemsToShow.push(<MyText>{`Last: ${coin.last.idealDecimalPlaces()}`}</MyText>);
  if (showInHomeScreen.indexOf('high') !== -1)
    itemsToShow.push(<MyText>{`High: ${coin.high.idealDecimalPlaces()}`}</MyText>);
  if (showInHomeScreen.indexOf('low') !== -1)
    itemsToShow.push(<MyText>{`Low: ${coin.low.idealDecimalPlaces()}`}</MyText>);
  if (showInHomeScreen.indexOf('vol') !== -1)
    itemsToShow.push(<MyText>{`Vol: ${coin.volume.idealDecimalPlaces()}`}</MyText>);
  if (showInHomeScreen.indexOf('basevol') !== -1)
    itemsToShow.push(<MyText>{`Vol (${market}): ${coin.baseVolume.idealDecimalPlaces()}`}</MyText>);

  let index = 0;
  fiats.map(fiat => {
    index++;
    if (showInHomeScreen.indexOf(`fiat${index}`) !== -1)
      itemsToShow.push(
        <MyText key={`fiat${coin.name}${fiat.label}`}>
          {`${fiat.label}: ${(coin.last * fiat.data.last * allCoinsInBtc[coin.market]).idealDecimalPlaces()}`}
        </MyText>,
      );
  });

  if (usingKeys && myCoin && myCoin.balance !== 0.0) {
    if (showInHomeScreen.indexOf(`ihave`) !== -1) itemsToShow.push(<MyText>{`I Have: ${myCoin.balance}`}</MyText>);
    if (showInHomeScreen.indexOf(`ihaveinmarket`) !== -1)
      itemsToShow.push(<MyText>{`I Have (${market}): ${(myCoin.balance * coin.last).idealDecimalPlaces()}`}</MyText>);
  }

  return (
    <CoinContainer>
      <CoinName>
        <MyText>{coin.name}</MyText>
        <TouchableOpacity onPress={onToggleFavorite}>
          <Icon name={coin.favorite ? 'heart' : 'hearto'} size={32} color={colors.black} />
        </TouchableOpacity>
      </CoinName>
      <CoinData onPress={onClick} onLongPress={onLongClick}>
        {itemsToShow}
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
