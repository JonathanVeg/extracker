import React from 'react';
import { View } from 'react-native';
import CopiableText from './CopiableText';
import MyText from './MyText';

export default function LabelValueBlock({ label, value, copiable = false, adjustDecimals = false, style = {} }) {
  return (
    <View style={{ flexDirection: 'row', ...style }}>
      <MyText style={{ fontWeight: 'bold' }}>{`${label}: `}</MyText>

      {copiable ? (
        <CopiableText>{adjustDecimals ? parseFloat(value).idealDecimalPlaces() : value}</CopiableText>
      ) : (
        <MyText>{adjustDecimals ? parseFloat(value).idealDecimalPlaces() : value}</MyText>
      )}
    </View>
  );
}
