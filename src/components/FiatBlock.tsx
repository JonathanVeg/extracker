import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../style/globals';
import MyText from './MyText';

export default function FiatBlock({ fiat, amount = 1 }) {
  if (!fiat) return <></>;

  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: StyleSheet.hairlineWidth,
        margin: 5,
        width: 'auto',
      }}
    >
      <MyText
        style={{
          backgroundColor: colors.darker,
          color: colors.white,
          fontWeight: 'bold',
          padding: 3,
        }}
      >
        {`${fiat.label}`}
      </MyText>
      <MyText style={{ padding: 3 }}>{fiat.data ? `${(fiat.data.last * amount).toFixed(3)} ` : '...'}</MyText>
    </View>
  );
}
