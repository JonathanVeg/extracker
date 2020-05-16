import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Coin from '../../models/Coin';
import { loadMyOrders, loadClosedOrders } from '../../controllers/Bittrex';
import { H1 } from '../../components/Hs';
import { colors } from '../../style/globals';
import MyOrder from '../../models/MyOrder';

export default function CoinPageMyOrdersHistory(props) {
  const [showOpened, setShowOpened] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [coin, setCoin] = useState<Coin>(props.coin || new Coin('DCR', 'BTC'));

  const [orders, setOrders] = useState<MyOrder[]>([]);

  async function loadOrders() {
    try {
      setRefreshing(true);

      const orders = await (showOpened
        ? loadMyOrders(coin)
        : loadClosedOrders(coin));

      setOrders(orders);
    } finally {
      setRefreshing(false);
    }
  }

  function refresh() {
    loadOrders();
  }

  async function cancelOrder(order: MyOrder) {
    try {
      await order.cancel();

      Alert.alert('Order cancelled');

      refresh();
    } catch (e) {
      Alert.alert(`Error while cancelling order:\n\n${e.toString()}`);
    }
  }

  useEffect(() => {
    refresh();
  }, [showOpened]);

  function renderItem({ item }) {
    const order: MyOrder = item;
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 5,
          backgroundColor:
            order.type === 'BUY' ? colors.buyBackground : colors.sellBackground,
          paddingHorizontal: 5,
        }}
      >
        <Text style={{ flex: 0.8, textAlign: 'left' }}>
          {order.type === 'BUY' ? '+ ' : '- '}
          {order.coin}
/{order.market}
        </Text>

        <Text style={{ flex: 1, textAlign: 'left' }}>
          {order.type === 'BUY' ? '+ ' : '- '}
          {order.quantity.idealDecimalPlaces()}
        </Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>
          {order.price.idealDecimalPlaces()}
        </Text>

        {showOpened && (
          <TouchableOpacity
            style={{ flex: 0.5, alignItems: 'flex-end' }}
            onPress={() => {
              Alert.alert(
                'Cancel order',
                'Are you sure you want to cancel this order?',
                [
                  {
                    text: 'Yes',
                    onPress: () => cancelOrder(order),
                    style: 'cancel',
                  },
                  { text: 'No' },
                ],
                { cancelable: false },
              );
            }}
          >
            <Icon name="trash-alt" size={20} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function Header() {
    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 5,
          paddingHorizontal: 5,
        }}
      >
        <Text style={{ flex: 0.8, textAlign: 'left' }}>Pair</Text>

        <Text style={{ flex: 1, textAlign: 'left' }}>Quantity</Text>
        <Text style={{ flex: 1, textAlign: 'right' }}>Unity Price</Text>

        {showOpened && (
          <Text style={{ flex: 0.5, textAlign: 'right' }}>Cancel</Text>
        )}
      </View>
    );
  }

  function NoOrders() {
    return (
      <View
        style={{
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}
      >
        <H1>No orders found</H1>
      </View>
    );
  }

  return (
    <Container>
      <View style={{ flex: 1 }}>
        <H1 style={{ textAlign: 'center', marginBottom: 7 }}>
          {showOpened ? `Opened Orders` : `Closed Orders`}
        </H1>

        {orders.length > 0 ? <Header /> : <NoOrders />}

        <FlatList
          onRefresh={refresh}
          refreshing={refreshing}
          keyExtractor={() => `${Math.random()}`}
          showsVerticalScrollIndicator={false}
          data={orders}
          renderItem={renderItem}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <TouchableOpacity
          onPress={() => {
            setShowOpened(true);
          }}
        >
          <Text style={{ fontWeight: showOpened ? 'bold' : 'normal' }}>
            OPENED
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setShowOpened(false);
          }}
        >
          <Text style={{ fontWeight: !showOpened ? 'bold' : 'normal' }}>
            CLOSED
          </Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const Container = styled.SafeAreaView`
  flex: 1;
  margin: 8px;
`;
