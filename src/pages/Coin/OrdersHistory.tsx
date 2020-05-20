import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import Coin from '../../models/Coin';
import OrderHistory from '../../models/OrderHistory';
import { loadMarketHistory } from '../../controllers/Bittrex';

import { H1 } from '../../components/Hs';
import { colors } from '../../style/globals';
import { Container } from '../../components/Generics';

export default function CoinPageOrdersHistory(props) {
  const coin: Coin = props.coin || new Coin('DCR', 'BTC');
  const [refreshing, setRefreshing] = useState(false);

  const [orders, setOrders] = useState<OrderHistory[]>([]);

  async function loadOrders() {
    try {
      setRefreshing(true);

      const orders = await loadMarketHistory(coin);

      setOrders(orders);
    } finally {
      setRefreshing(false);
    }
  }

  function refresh() {
    loadOrders();
  }

  useEffect(() => {
    refresh();
  }, []);

  function renderItem({ item }) {
    const order: OrderHistory = item;
    return (
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: 4,
          backgroundColor:
            order.type === 'BUY' ? colors.buyBackground : colors.sellBackground,
          paddingHorizontal: 5,
        }}
      >
        <Text style={{ flex: 1, textAlign: 'left' }}>
          {order.type === 'BUY' ? '+ ' : '- '}
          {order.quantity.idealDecimalPlaces()}
        </Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>
          {order.rate.idealDecimalPlaces()}
        </Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>
          {order.total.idealDecimalPlaces()}
        </Text>
      </View>
    );
  }

  function Header() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ flex: 1, textAlign: 'left', fontWeight: 'bold' }}>
          Amount
        </Text>
        <Text style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
          Unit Price
        </Text>
        <Text style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
          Total
        </Text>
      </View>
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
