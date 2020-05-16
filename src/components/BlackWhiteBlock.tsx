import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { colors } from '../style/globals';

export default function BlackWhiteBlock({ label, amount = 1 }) {
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
        {`${label}`}
      </Text>
      <Text style={{ padding: 3 }}>{amount.idealDecimalPlaces(3)} </Text>
    </View>
  );
}
