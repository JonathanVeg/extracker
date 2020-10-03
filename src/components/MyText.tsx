import React from 'react';
import { Text } from 'react-native';
import { colors } from '../style/globals';

const MyText = props => (
  <Text {...props} style={{ color: colors.black, ...props.style }}>
    {props.children}
  </Text>
);

export default MyText;
