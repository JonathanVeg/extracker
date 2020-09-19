import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/AntDesign';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Coin from '../../models/Coin';
import { colors } from '../../style/globals';
import { Row } from '../../components/Generics';
import MyText from '../../components/MyText';

interface HomeCoinItemCompactProps {
  onToggleFavorite: void;
  onClick: void;
  onLongClick: void;
  coin: Coin;
  market: string;
}

const HomeCoinItemCompact: React.FC = (props: HomeCoinItemCompactProps) => {
  const { onClick, onLongClick, coin, onToggleFavorite } = props;

  return (
    <CoinContainer>
      <CoinName>
        <MyText>{coin.name}</MyText>
        <TouchableOpacity onPress={onToggleFavorite}>
          <Icon name={coin.favorite ? 'heart' : 'hearto'} size={32} color="#000" />
        </TouchableOpacity>
      </CoinName>
      <CoinData onPress={onClick} onLongPress={onLongClick}>
        <Row>
          <Icon name="pause" size={20} color="#000" style={{ transform: [{ rotate: '90deg' }] }} />
          <MyText>{`${coin.last.idealDecimalPlaces()}`}</MyText>
        </Row>
        <Row>
          <Icon name="arrowup" size={20} color="#000" />
          <MyText>{`${coin.high.idealDecimalPlaces()}`}</MyText>
        </Row>
        <Row>
          <Icon name="arrowdown" size={20} color="#000" />
          <MyText>{`${coin.low.idealDecimalPlaces()}`}</MyText>
        </Row>
      </CoinData>
      <CoinPercent onPress={onClick}>
        <MyText style={{ color: coin.change > 0 ? colors.positive : colors.negative }}>
          {`${coin.change.toFixed(1)}%`}
        </MyText>
      </CoinPercent>
    </CoinContainer>
  );
};

export default HomeCoinItemCompact;

const CoinContainer = styled.View`
  flex: 1;
  flex-direction: column;
  padding: 8px 0;
  margin: 3px;
  border-width: ${StyleSheet.hairlineWidth}px;
`;

const CoinName = styled.View`
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;

const CoinData = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
`;

const CoinPercent = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
`;
