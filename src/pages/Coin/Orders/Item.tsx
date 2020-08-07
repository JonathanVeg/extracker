import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { default as MaterialCommunityIcons } from 'react-native-vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import Order from '../../../models/Order';
import { default as MyAlert } from '../../../models/Alert';
import { colors } from '../../../style/globals';
import { useToast } from '../../../hooks/ToastContext';
import AlertsAPI from '../../../controllers/Alerts';
import { readOneSignalUserId } from '../../../controllers/OneSignal';

const Item = ({ index, item, showSumPrice, showSumQuantity, coin, type, navigation, refresh }) => {
  const order: Order = item;

  const { showToast } = useToast();

  async function createAlert() {
    try {
      const newAlert = new MyAlert(
        `${Math.random()}`,
        coin.name,
        coin.market,
        type === 'sell' ? 'GT' : 'LT',
        parseFloat(item.rate),
      );

      await AlertsAPI.createAlert(newAlert);

      showToast('Alert created');

      refresh();
    } catch (err) {
      showToast({ text: `Error while creating alert\n\n${err}`, type: 'error' });
    }
  }

  async function cancelAlert() {
    try {
      const uid = await readOneSignalUserId();
      for (let i = 0; i < item.alerts.length; i++) {
        await AlertsAPI.deleteAlert(item.alerts[i], uid);
      }

      showToast('Alert cancelled');
    } finally {
      refresh();
    }
  }

  async function cancelMyOrder() {
    try {
      await order.myOrder.cancel();

      showToast({ text: 'Order cancelled', type: 'success' });

      refresh();
    } catch (e) {
      Alert.alert(`Error while cancelling order:\n\n${e.toString()}`);
    }
  }

  function offerOptions() {
    const secondOption = item.isMine
      ? {
          text: 'Cancel order',
          onPress: cancelMyOrder,
        }
      : {
          text: 'Create order',
          onPress: () => {
            navigation.navigate('NewOrder', { coin, rate: item.rate, type });
          },
        };

    const thirdOption =
      item.alerts.length > 0
        ? {
            text: 'Cancel alert',
            onPress: () => {
              cancelAlert();
            },
          }
        : {
            text: 'Create alert',
            onPress: () => {
              createAlert();
            },
          };

    Alert.alert(
      'Select an option',
      `Do you want to create for ${coin.name} in this price (${item.rate.idealDecimalPlaces()})?`,
      [
        {
          text: 'Nothing',
          style: 'cancel',
        },
        secondOption,
        thirdOption,
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
    <TouchableOpacity onLongPress={offerOptions}>
      <RowContainer backgroundColor={backgroundColor}>
        {item.isMine ? (
          <Icon name="star" size={13} style={{ margin: 2 }} color={'black'} />
        ) : (
          <MaterialCommunityIcons
            name="bell"
            size={13}
            style={{ margin: 2 }}
            color={item.alerts.length > 0 ? 'black' : 'transparent'}
          />
        )}

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
