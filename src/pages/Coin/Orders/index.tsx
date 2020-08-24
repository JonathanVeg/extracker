import styled from 'styled-components/native';
import React, { useState, useEffect } from 'react';
import { Text, FlatList } from 'react-native';
import Coin from '../../../models/Coin';
import { H1 } from '../../../components/Hs';
import { loadOrderBook, loadMyOrders } from '../../../controllers/Exchange';
import Order from '../../../models/Order';
import MyOrder from '../../../models/MyOrder';
import { Container } from '../../../components/Generics';
import Item from './Item';
import AlertsAPI from '../../../controllers/Alerts';
import { readOneSignalUserId } from '../../../controllers/OneSignal';

export default function CoinPageOrders(props) {
  const { type } = props;

  const coin = props.coin || new Coin('DCR', 'BTC');

  const [refreshing, setRefreshing] = useState(false);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);
  const [showSumPrice, setShowSumPrice] = useState(true);
  const [showSumQuantity, setShowSumQuantity] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  async function loadOrders(changeRefreshing = true) {
    try {
      if (changeRefreshing) setRefreshing(true);

      const uid = await readOneSignalUserId();
      const alerts = await AlertsAPI.getAlerts(uid);

      const orders = await loadOrderBook(coin, type);

      orders.map(order => {
        order.alerts = alerts.filter(it => {
          return (
            it.coin === order.coin &&
            it.market === order.marker &&
            parseFloat(it.price.toString()) === parseFloat(order.rate.toString())
          );
        });
      });

      setOrders(orders);
    } finally {
      setRefreshing(false);
    }
  }

  async function loadMOrders() {
    const myOrders = await loadMyOrders(coin);

    setMyOrders(myOrders);
  }

  async function refresh(changeRefreshing = true) {
    try {
      loadOrders(changeRefreshing).finally(() => {
        loadMOrders();
      });
    } finally {
    }
  }

  useEffect(() => {
    const newOrders = [...orders];
    newOrders.map(order => {
      const have = myOrders.find(it => {
        return it.price === order.rate;
      });

      if (have) {
        order.isMine = true;
        order.myOrder = have;
      }
    });

    setOrders(newOrders);
  }, [myOrders]);

  useEffect(() => {
    refresh();
  }, [type]);

  function Header() {
    return (
      <HeaderContainer>
        <Text style={{ fontWeight: 'bold' }} onPress={() => setShowSumQuantity(!showSumQuantity)}>
          {showSumQuantity ? 'Sum Qnt.' : 'Qnt.'}
        </Text>
        <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>Rate</Text>
        <Text style={{ fontWeight: 'bold', paddingRight: 2 }} onPress={() => setShowSumPrice(!showSumPrice)}>
          {showSumPrice ? 'Sum Price' : 'Total Price'}
        </Text>
      </HeaderContainer>
    );
  }

  function gotoNewOrder(coin, rate, type) {
    props.navigation.navigate('NewOrder', { coin, rate, type });
  }

  return (
    <Container>
      <H1>ORDERS</H1>

      <Header />

      <FlatList
        onRefresh={refresh}
        keyExtractor={() => `${Math.random()}`}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        data={orders}
        renderItem={({ index, item }) => (
          <Item
            index={index}
            showSumPrice={showSumPrice}
            showSumQuantity={showSumQuantity}
            item={item}
            coin={coin}
            gotoNewOrder={gotoNewOrder}
            refresh={refresh}
          />
        )}
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
