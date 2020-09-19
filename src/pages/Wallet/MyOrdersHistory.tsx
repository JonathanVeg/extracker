/* eslint-disable no-await-in-loop */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { TouchableWithoutFeedback, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { H1 } from '../../components/Hs';
import { colors } from '../../style/globals';
import MyOrder from '../../models/MyOrder';
import { Container } from '../../components/Generics';
import { useToast } from '../../hooks/ToastContext';
import { useExchange } from '../../hooks/ExchangeContext';
import MyText from '../../components/MyText';

export default function CoinPageMyOrdersHistory(props) {
  const { exchange } = useExchange();
  const { coin } = props;

  const [selecteds, setSelecteds] = useState<MyOrder[]>([]);
  const [showOpened, setShowOpened] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [showUnit, setShowUnit] = useState(true);
  const [showQuantity, setShowQuantity] = useState(true);

  const { showToast } = useToast();

  const handleSelectItem = (item: MyOrder) => {
    const exists = selecteds.filter(it => it.id === item.id).length > 0;
    const newSelecteds = !exists ? [...selecteds, item] : selecteds.filter(it => it.id !== item.id);
    setSelecteds(newSelecteds);
  };

  async function loadOrders(toggleRefreshing = true) {
    try {
      if (toggleRefreshing) setRefreshing(true);

      const orders = await (showOpened ? exchange.loadMyOrders(coin) : exchange.loadClosedOrders(coin));

      setOrders(orders);
    } finally {
      setRefreshing(false);
    }
  }

  function refresh(toggleRefreshing = true) {
    loadOrders(toggleRefreshing);
  }

  async function cancelSelectedOrders() {
    try {
      for (let i = 0; i < selecteds.length; i++) {
        await selecteds[i].cancel();
      }
      setSelecteds([]);
      showToast(`${selecteds.length} order(s) cancelled`);
      refresh(false);
    } catch (e) {
      Alert.alert(`Error while cancelling orders:\n\n${e.toString()}`);
    }
  }

  useEffect(() => {
    refresh(true);
  }, [showOpened]);

  const showDetails = (item: MyOrder) => {
    Alert.alert('Resume', item.toResumeString());
  };

  function handleCancelAllOrders() {
    if (selecteds.length === 0) return;
    const line = `Are you sure you want to cancel ${selecteds.length} order(s)?\nIt can not be undone!`;

    Alert.alert(
      'Cancel order',
      line,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => cancelSelectedOrders(),
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
          <MyText style={{ flex: 0.8, textAlign: 'left', fontVariant: ['tabular-nums'] }}>
            {order.type === 'buy' ? '+ ' : '- '}
            {`${order.coin}/${order.market}`}
          </MyText>

          <MyText style={{ flex: 1, textAlign: 'left', fontVariant: ['tabular-nums'] }}>
            {order.type === 'buy' ? '+ ' : '- '}
            {showQuantity
              ? `${order.quantity.idealDecimalPlaces()}`
              : showOpened
              ? `${order.quantityRemaining.idealDecimalPlaces()}`
              : `${(order.quantity - order.quantityRemaining).idealDecimalPlaces()}`}
          </MyText>
          <MyText style={{ flex: 1, textAlign: 'right', fontVariant: ['tabular-nums'] }}>
            {showUnit ? order.price.idealDecimalPlaces() : order.total.idealDecimalPlaces()}
          </MyText>

          {showOpened && (
            <TouchableWithoutFeedback style={{ flex: 0.6 }} onPress={() => handleSelectItem(order)}>
              <MyCheckbox checked={selecteds.indexOf(item) !== -1} />
            </TouchableWithoutFeedback>
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
        <MyText style={{ fontWeight: 'bold', flex: 0.8, textAlign: 'left' }}>Pair</MyText>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowQuantity(!showQuantity)}>
          <MyText style={{ fontWeight: 'bold', flex: 1, textAlign: 'left' }}>
            {showQuantity ? 'Quantity' : showOpened ? 'Remaining' : 'Done'}
          </MyText>
        </TouchableOpacity>

        <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowUnit(!showUnit)}>
          <MyText style={{ fontWeight: 'bold', flex: 1, textAlign: 'right' }}>
            {showUnit ? 'Unity Price' : 'Total'}
          </MyText>
        </TouchableOpacity>

        {showOpened && (
          <TouchableOpacity style={{ flex: 0.6, alignItems: 'flex-end' }} onPress={handleCancelAllOrders}>
            <Icon name="trash-alt" size={20} color={selecteds.length === 0 ? 'transparent' : colors.black} />
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
        <ShowOpenedButton onPress={() => setShowOpened(true)}>
          <MyText style={{ fontWeight: showOpened ? 'bold' : 'normal' }}>OPENED</MyText>
        </ShowOpenedButton>
        <View style={{ width: 4 }} />
        <ShowClosedButton onPress={() => setShowOpened(false)}>
          <MyText style={{ fontWeight: !showOpened ? 'bold' : 'normal' }}>CLOSED</MyText>
        </ShowClosedButton>
      </View>
    </Container>
  );
}

const OrderItemContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 5px;
  background-color: ${({ type }) => (type === 'buy' ? colors.buyBackground : colors.sellBackground)};
`;

const MyCheckbox = styled.View`
  height: 20px;
  width: 20px;
  border-radius: 10px;
  padding: 5px;
  margin: 5px;
  border-color: colors.black;
  background-color: ${({ checked }) => (checked ? colors.black : 'transparent')};
  border-width: 1px;
`;

const ShowOpenedButton = styled.TouchableOpacity`
  padding: 3px 0;
  /* margin: 0 0 0 2px; */
  border-width: 1px;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ShowClosedButton = styled.TouchableOpacity`
  padding: 3px 0;
  /* margin: 0 0 2px 0; */
  border-width: 1px;
  flex: 1;
  justify-content: center;
  align-items: center;
`;
