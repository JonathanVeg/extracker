import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../style/globals';
import MyText from './MyText';

export default function BlackWhiteBlock({ label, amount = 1 }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: StyleSheet.hairlineWidth,
        margin: 5,
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
        {`${label}`}
      </MyText>
      <MyText style={{ padding: 3 }}>{amount.idealDecimalPlaces(3)} </MyText>
    </View>
  );
}
