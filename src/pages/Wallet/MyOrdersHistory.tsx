import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { TouchableWithoutFeedback, View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { loadMyOrders, loadClosedOrders } from '../../controllers/Exchange';
import { H1 } from '../../components/Hs';
import { colors } from '../../style/globals';
import MyOrder from '../../models/MyOrder';
import { Container } from '../../components/Generics';
import { useToast } from '../../hooks/ToastContext';

export default function CoinPageMyOrdersHistory(props) {
  const { coin } = props;

  const [showOpened, setShowOpened] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [showUnit, setShowUnit] = useState(true);
  const [showQuantity, setShowQuantity] = useState(true);

  const { showToast } = useToast();

  async function loadOrders(toggleRefreshing = true) {
    try {
      if (toggleRefreshing) setRefreshing(true);

      const orders = await (showOpened ? loadMyOrders(coin) : loadClosedOrders(coin));

      setOrders(orders);
    } finally {
      setRefreshing(false);
    }
  }

  function refresh(toggleRefreshing = true) {
    loadOrders(toggleRefreshing);
  }

  async function cancelAllOrders() {
    try {
      for (let i = 0; i < orders.length; i++) {
        await orders[i].cancel();
      }
      showToast({ text: 'All orders cancelled', type: 'success' });
      refresh(false);
    } catch (e) {
      Alert.alert(`Error while cancelling order:\n\n${e.toString()}`);
    }
  }

  async function cancelOrder(order: MyOrder) {
    try {
      await order.cancel();

      showToast({ text: 'Order cancelled', type: 'success' });

      refresh(false);
    } catch (e) {
      Alert.alert(`Error while cancelling order:\n\n${e.toString()}`);
    }
  }

  useEffect(() => {
    refresh(true);
  }, [showOpened]);

  const showDetails = (item: MyOrder) => {
    Alert.alert('Resume', item.toResumeString());
  };

  function askCancelOrder(order) {
    let line = 'Are you sure you want to cancel this order?\n';

    line += `${order.type} ${order.quantity} ${order.coin} for ${order.price.idealDecimalPlaces()} ${
      order.market
    } each.`;

    Alert.alert(
      'Cancel order',
      line,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => cancelOrder(order),
        },
      ],
      { cancelable: false },
    );
  }

  function handleCancelAllOrders() {
    const line = 'Are you sure you want to cancel ALL OPENED order(s)?\n';

    Alert.alert(
      'Cancel order',
      line,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => cancelAllOrders(),
        },
      ],
      { cancelable: false },
    );
  }

  function renderItem({ item }) {
    const order: MyOrder = item;

    return (
      <TouchableWithoutFeedback onLongPress={() => showDetails(item)}>
        <OrderItemContainer type={order.type}>
          <Text style={{ flex: 0.8, textAlign: 'left', fontVariant: ['tabular-nums'] }}>
            {order.type === 'buy' ? '+ ' : '- '}
            {`${order.coin}/${order.market}`}
          </Text>

          <Text style={{ flex: 1, textAlign: 'left', fontVariant: ['tabular-nums'] }}>
            {order.type === 'buy' ? '+ ' : '- '}
            {showQuantity
              ? `${order.quantity.idealDecimalPlaces()}`
              : showOpened
              ? `${order.quantityRemaining.idealDecimalPlaces()}`
              : `${(order.quantity - order.quantityRemaining).idealDecimalPlaces()}`}
          </Text>
          <Text style={{ flex: 1, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
            {showUnit ? order.price.idealDecimalPlaces() : order.total.idealDecimalPlaces()}
          </Text>

          {showOpened && (
            <TouchableOpacity style={{ flex: 0.6, alignItems: 'flex-end' }} onPress={() => askCancelOrder(order)}>
              <Icon name="trash-alt" size={20} />
            </TouchableOpacity>
          )}
        </OrderItemContainer>
      </TouchableWithoutFeedback>
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
        <Text style={{ fontWeight: 'bold', flex: 0.8, textAlign: 'left' }}>Pair</Text>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowQuantity(!showQuantity)}>
          <Text style={{ fontWeight: 'bold', flex: 1, textAlign: 'left' }}>
            {showQuantity ? 'Quantity' : showOpened ? 'Remaining' : 'Done'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowUnit(!showUnit)}>
          <Text style={{ fontWeight: 'bold', flex: 1, textAlign: 'right' }}>{showUnit ? 'Unity Price' : 'Total'}</Text>
        </TouchableOpacity>

        {showOpened && (
          <TouchableOpacity style={{ flex: 0.6, alignItems: 'flex-end' }} onPress={handleCancelAllOrders}>
            <Icon name="trash-alt" size={20} />
          </TouchableOpacity>
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
        <H1 style={{ textAlign: 'center', marginBottom: 7 }}>{showOpened ? `Opened Orders` : `Closed Orders`}</H1>

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
          style={{
            paddingVertical: 3,
            marginEnd: 2,
            borderWidth: 1,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setShowOpened(true)}
        >
          <Text style={{ fontWeight: showOpened ? 'bold' : 'normal' }}>OPENED</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingVertical: 3,
            marginStart: 2,
            borderWidth: 1,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setShowOpened(false)}
        >
          <Text style={{ fontWeight: !showOpened ? 'bold' : 'normal' }}>CLOSED</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}

export const OrderItemContainer = styled.View`
  flex-direction: row;
  padding: 5px;
  background-color: ${({ type }) => (type === 'buy' ? colors.buyBackground : colors.sellBackground)};
`;
