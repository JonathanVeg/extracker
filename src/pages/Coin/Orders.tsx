import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import React, { useState, useEffect } from 'react';
import { Text, FlatList } from 'react-native';
import Coin from '../../models/Coin';
import { H1 } from '../../components/Hs';
import { loadOrderBook, loadMyOrders } from '../../controllers/Bittrex';
import Order from '../../models/Order';
import MyOrder from '../../models/MyOrder';
import { colors } from '../../style/globals';
import { Container } from '../../components/Generics';

export default function CoinPageOrders(props) {
  const { type } = props;
  const coin = props.coin || new Coin('DCR', 'BTC');

  const [refreshing, setRefreshing] = useState(false);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [showSumPrice, setShowSumPrice] = useState(true);
  const [showSumQuantity, setShowSumQuantity] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  async function loadOrders() {
    try {
      setRefreshing(true);

      const orders = await loadOrderBook(coin, type);

      setOrders(orders);
    } finally {
      setRefreshing(false);
    }
  }

  async function loadMOrders() {
    const myOrders = await loadMyOrders(coin);

    setMyOrders(myOrders);
  }

  function refresh() {
    loadOrders();
    loadMOrders();
  }

  useEffect(() => {
    refresh();
  }, [type]);

  const renderItem = ({ index, item }) => {
    const order: Order = item;
    const iHave = myOrders.find(it => {
      return it.price === order.rate;
    });

    const backgroundColor =
      type === 'buy'
        ? index % 2 === 0
          ? colors.buyBackground
          : colors.buyBackground2
        : index % 2 === 0
        ? colors.sellBackground
        : colors.sellBackground2;
    return (
      <RowContainer backgroundColor={backgroundColor}>
        <Icon name="star" size={13} style={{ margin: 2 }} color={iHave ? 'black' : 'transparent'} />
        <Text style={{ flex: 1, textAlign: 'left' }}>
          {(showSumQuantity ? order.quantityTotal : order.quantity).idealDecimalPlaces()}
        </Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>{order.rate.idealDecimalPlaces()}</Text>
        <Text style={{ flex: 1, textAlign: 'right', paddingRight: 2 }}>
          {(showSumPrice ? order.totalTotal : order.total).idealDecimalPlaces()}
        </Text>
      </RowContainer>
    );
  };

  function Header() {
    return (
      <HeaderContainer>
        <Text
          style={{ fontWeight: 'bold' }}
          onPress={() => {
            setShowSumQuantity(!showSumQuantity);
          }}
        >
          {showSumQuantity ? 'Sum Qnt.' : 'Qnt.'}
        </Text>
        <Text style={{ fontWeight: 'bold' }}>Rate</Text>
        <Text
          style={{ fontWeight: 'bold', paddingRight: 2 }}
          onPress={() => {
            setShowSumPrice(!showSumPrice);
          }}
        >
          {showSumPrice ? 'Sum Price' : 'Total Price'}
        </Text>
      </HeaderContainer>
    );
  }

  return (
    <Container>
      <H1>ORDERS</H1>

      <Header />

      <FlatList
        onRefresh={refresh}
        refreshing={refreshing}
        keyExtractor={() => `${Math.random()}`}
        showsVerticalScrollIndicator={false}
        data={orders}
        renderItem={renderItem}
      />
    </Container>
  );
}

const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0 3px 2px;
`;

const RowContainer = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  padding: 3px 0 3px 2px;
`;
