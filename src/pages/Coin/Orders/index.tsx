import styled from 'styled-components/native';
import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import Coin from '../../../models/Coin';
import { H1 } from '../../../components/Hs';
import Order from '../../../models/Order';
import MyOrder from '../../../models/MyOrder';
import { Container } from '../../../components/Generics';
import Item from './Item';
import AlertsAPI from '../../../controllers/Alerts';
import { readOneSignalUserId } from '../../../controllers/OneSignal';
import { useExchange } from '../../../hooks/ExchangeContext';
import MyText from '../../../components/MyText';
import StorageUtils from '../../../utils/StorageUtils';

const PRICE = 0;
const SUM_PRICE = 1;
const PERCENTAGE_FROM_FIRST = 2;
export const LastColumn = { PRICE, SUM_PRICE, PERCENTAGE_FROM_FIRST };

export default function CoinPageOrders(props) {
  const { exchange } = useExchange();
  const { type } = props;

  const coin = props.coin || new Coin('DCR', 'BTC');

  const [lastColumn, setLastColumn] = useState(LastColumn.PERCENTAGE_FROM_FIRST);

  const [refreshing, setRefreshing] = useState(false);
  const [myOrders, setMyOrders] = useState<MyOrder[]>([]);

  const [showSumQuantity, setShowSumQuantity] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  function changeLastColumn() {
    const newLastColumn = lastColumn === PRICE ? SUM_PRICE : lastColumn === SUM_PRICE ? PERCENTAGE_FROM_FIRST : PRICE;
    setLastColumn(newLastColumn);
  }

  useEffect(() => {
    async function loadLastColumn() {
      const lastColumn = await StorageUtils.getItem('ordersLastColumn');
      setLastColumn(parseInt(lastColumn || '0'));
    }

    loadLastColumn();
  }, []);

  useEffect(() => {
    StorageUtils.setItem('ordersLastColumn', lastColumn.toString());
  }, [lastColumn]);

  async function loadOrders(changeRefreshing = true) {
    try {
      if (changeRefreshing) setRefreshing(true);

      const uid = await readOneSignalUserId();
      const alerts = await AlertsAPI.getAlerts(exchange, uid);

      const orders = await exchange.loadOrderBook(coin, type);

      const percentBase = orders[0].rate;

      orders.map(order => {
        order.alerts = alerts.filter(it => {
          return (
            it.coin === order.coin &&
            it.market === order.market &&
            parseFloat(it.price.toString()) === parseFloat(order.rate.toString())
          );
        });

        order.percentFromBase = (order.rate / percentBase) * 100 - 100;
      });

      setOrders(orders);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }

  async function loadMOrders() {
    const myOrders = await exchange.loadMyOrders(coin);

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
        <MyText style={{ fontWeight: 'bold' }} onPress={() => setShowSumQuantity(!showSumQuantity)}>
          {showSumQuantity ? 'Sum Qnt.' : 'Qnt.'}
        </MyText>
        <MyText style={{ fontWeight: 'bold', textAlign: 'center' }}>Rate</MyText>
        <MyText style={{ fontWeight: 'bold', paddingRight: 2 }} onPress={changeLastColumn}>
          {lastColumn === PRICE && 'Total Price'}
          {lastColumn === SUM_PRICE && 'Sum Price'}
          {lastColumn === PERCENTAGE_FROM_FIRST && '% from first '}
        </MyText>
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
            lastColumn={lastColumn}
            index={index}
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
