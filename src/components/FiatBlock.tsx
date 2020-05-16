import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../style/globals';

export default function FiatBlock({ fiat, amount = 1 }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: StyleSheet.hairlineWidth,
        margin: 5,
      }}
    >
      <Text
        style={{
          backgroundColor: colors.darker,
          color: colors.white,
          fontWeight: 'bold',
          padding: 3,
        }}
      >
        {`${fiat.label}`}
      </Text>
      <Text style={{ padding: 3 }}>
        {`${(fiat.data.last * amount).toFixed(3)} `}
      </Text>
    </View>
  );
}
