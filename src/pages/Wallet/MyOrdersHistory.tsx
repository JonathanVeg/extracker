import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { loadMyOrders, loadClosedOrders } from '../../controllers/Bittrex';
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
  const [showUnity, setShowUnit] = useState(true);

  const { showToast } = useToast();

  async function loadOrders() {
    try {
      setRefreshing(true);

      const orders = await (showOpened ? loadMyOrders(coin) : loadClosedOrders(coin));

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

      showToast({ text: 'Order cancelled', type: 'success' });

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
          backgroundColor: order.type === 'BUY' ? colors.buyBackground : colors.sellBackground,
          paddingHorizontal: 5,
        }}
      >
        <Text style={{ flex: 0.8, textAlign: 'left', fontVariant: ['tabular-nums'] }}>
          {order.type === 'BUY' ? '+ ' : '- '}
          {`${order.coin}/${order.market}`}
        </Text>

        <Text style={{ flex: 1, textAlign: 'left', fontVariant: ['tabular-nums'] }}>
          {order.type === 'BUY' ? '+ ' : '- '}
          {order.quantity.idealDecimalPlaces()}
        </Text>
        <Text style={{ flex: 1, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
          {showUnity ? order.price.idealDecimalPlaces() : order.total.idealDecimalPlaces()}
        </Text>

        {showOpened && (
          <TouchableOpacity
            style={{ flex: 0.5, alignItems: 'flex-end' }}
            onPress={() => {
              let line = 'Are you sure you want to cancel this order?\n';

              line += `${order.type} ${order.quantity} for ${order.price} ${order.market} each.`;

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
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowUnit(!showUnity)}>
          <Text style={{ flex: 1, textAlign: 'right' }}>{showUnity ? 'Unity Price' : 'Total'}</Text>
        </TouchableOpacity>

        {showOpened && <Text style={{ flex: 0.5, textAlign: 'right' }}>Cancel</Text>}
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
          onPress={() => {
            setShowOpened(true);
          }}
        >
          <Text style={{ fontWeight: showOpened ? 'bold' : 'normal' }}>OPENED</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setShowOpened(false);
          }}
        >
          <Text style={{ fontWeight: !showOpened ? 'bold' : 'normal' }}>CLOSED</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
}
