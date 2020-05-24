import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/AntDesign';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Coin from '../models/Coin';
import { colors } from '../style/globals';
import MyCoin from '../models/MyCoin';

interface HomeCoinItemProps {
  onToggleFavorite: void;
  onClick: void;
  coin: Coin;
  market: string;
  myCoins: MyCoin[];
}

const HomeCoinItem: React.FC = (props: HomeCoinItemProps) => {
  const { onClick, coin, market, myCoins, onToggleFavorite } = props;

  const myCoin = myCoins.find(it => it.name === coin.name);
  return (
    <CoinContainer>
      <CoinName>
        <Text>{coin.name}</Text>
        <TouchableOpacity onPress={onToggleFavorite}>
          <Icon name={coin.favorite ? 'heart' : 'hearto'} size={32} color="#000" />
        </TouchableOpacity>
      </CoinName>
      <CoinData onPress={onClick}>
        <Text>{`Last: ${coin.last.idealDecimalPlaces()}`}</Text>
        <Text>{`High: ${coin.high.idealDecimalPlaces()}`}</Text>
        <Text>{`Low: ${coin.low.idealDecimalPlaces()}`}</Text>
        <Text>{`Vol: ${coin.volume.idealDecimalPlaces()}`}</Text>
        <Text>{`Vol (${market}): ${coin.baseVolume.idealDecimalPlaces()}`}</Text>
        {myCoin && (
          <>
            <Text>{`I Have: ${myCoin.balance}`}</Text>
            <Text>{`I Have (${market}): ${(myCoin.balance * coin.last).idealDecimalPlaces()}`}</Text>
          </>
        )}
      </CoinData>
      <CoinPercent onPress={onClick}>
        <Text style={{ color: coin.change > 0 ? colors.positive : colors.negative }}>
          {`${coin.change.toFixed(1)}%`}
        </Text>
      </CoinPercent>
    </CoinContainer>
  );
};

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
