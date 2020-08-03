import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import React from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import Order from '../../../models/Order';
import { colors } from '../../../style/globals';
import { useToast } from '../../../hooks/ToastContext';

const Item = ({ index, item, showSumPrice, showSumQuantity, coin, type, navigation, refresh }) => {
  const order: Order = item;

  const { showToast } = useToast();

  async function cancelMyOrder() {
    try {
      await order.myOrder.cancel();

      showToast({ text: 'Order cancelled', type: 'success' });

      refresh();
    } catch (e) {
      Alert.alert(`Error while cancelling order:\n\n${e.toString()}`);
    }
  }

  function offerCancelOrders() {
    Alert.alert(
      'Cancel order',
      `Do you want to cancel your order to ${type} ${coin.name} for ${item.rate.idealDecimalPlaces()}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: cancelMyOrder,
        },
      ],
      { cancelable: true },
    );
  }

  function offerCreateNewOrder() {
    Alert.alert(
      'Create order',
      `Do you want to create an order to ${type} ${coin.name} for ${item.rate.idealDecimalPlaces()}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            navigation.navigate('NewOrder', { coin, rate: item.rate, type });
          },
        },
      ],
      { cancelable: true },
    );
  }

  const backgroundColor =
    type === 'buy'
      ? index % 2 === 0
        ? colors.buyBackground
        : colors.buyBackground2
      : index % 2 === 0
      ? colors.sellBackground
      : colors.sellBackground2;
  return (
    <TouchableOpacity
      onLongPress={() => {
        if (order.isMine) offerCancelOrders();
        else offerCreateNewOrder();
      }}
    >
      <RowContainer backgroundColor={backgroundColor}>
        <Icon name="star" size={13} style={{ margin: 2 }} color={item.isMine ? 'black' : 'transparent'} />
        <Text
          style={{
            flex: 1,
            textAlign: 'left',
            fontVariant: ['tabular-nums'],
          }}
        >
          {(showSumQuantity ? order.quantityTotal : order.quantity).idealDecimalPlaces()}
        </Text>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontVariant: ['tabular-nums'],
          }}
        >
          {order.rate.idealDecimalPlaces()}
        </Text>
        <Text
          style={{
            flex: 1,
            textAlign: 'right',
            fontVariant: ['tabular-nums'],
            paddingRight: 2,
          }}
        >
          {(showSumPrice ? order.totalTotal : order.total).idealDecimalPlaces()}
        </Text>
      </RowContainer>
    </TouchableOpacity>
  );
};

const RowContainer = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  padding: 3px 0 3px 2px;
`;

export default Item;