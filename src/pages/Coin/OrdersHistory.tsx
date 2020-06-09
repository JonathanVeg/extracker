import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import Coin from '../../models/Coin';
import OrderHistory from '../../models/OrderHistory';
import { loadMarketHistory } from '../../controllers/Bittrex';

import { H1 } from '../../components/Hs';
import { colors } from '../../style/globals';
import { Container } from '../../components/Generics';

export default function CoinPageOrdersHistory(props) {
  const coin: Coin = props.coin || new Coin('DCR', 'BTC');
  const [refreshing, setRefreshing] = useState(false);
  const [showWhen, setShowWhen] = useState(false);

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
          backgroundColor: order.type === 'BUY' ? colors.buyBackground : colors.sellBackground,
          paddingHorizontal: 5,
        }}
      >
        <Text style={{ flex: 1, textAlign: 'left', fontVariant: ['tabular-nums'] }}>
          {order.type === 'BUY' ? '+ ' : '- '}
          {`${order.quantity.idealDecimalPlaces()}`}
        </Text>
        <Text style={{ flex: 1, textAlign: 'center', fontVariant: ['tabular-nums'] }}>
          {order.rate.idealDecimalPlaces()}
        </Text>
        <Text style={{ flex: 1, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
          {showWhen ? formatDate(order.timestamp) : order.total.idealDecimalPlaces()}
        </Text>
      </View>
    );
  }

  const formatDate = (timestamp: string) => {
    let fromNow = moment(parseISOString(`${timestamp}Z`)).fromNow();

    fromNow = fromNow.replace('minutes', 'min(s)').replace(' ago', '').replace('an', '1');

    return fromNow;
  };

  function parseISOString(s) {
    const b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  }

  function Header() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ flex: 1, textAlign: 'left', fontWeight: 'bold' }}>Amount</Text>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>Unit Price</Text>
        <TouchableOpacity
          onPress={() => {
            setShowWhen(!showWhen);
          }}
        >
          <Text style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>{showWhen ? 'When' : 'Total'}</Text>
        </TouchableOpacity>
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
