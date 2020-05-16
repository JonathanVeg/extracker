import React from 'react';
import { View, Text } from 'react-native';
import CopiableText from './CopiableText';

export default function LabelValueBlock({
  label,
  value,
  copiable = false,
  adjustDecimals = false,
  style = {},
}) {
  return (
    <View style={{ flexDirection: 'row', ...style }}>
      <Text style={{ fontWeight: 'bold' }}>{`${label}: `}</Text>

      {copiable ? (
        <CopiableText>
          {adjustDecimals ? parseFloat(value).idealDecimalPlaces() : value}
        </CopiableText>
      ) : (
        <Text>
          {adjustDecimals ? parseFloat(value).idealDecimalPlaces() : value}
        </Text>
      )}
    </View>
  );
}
