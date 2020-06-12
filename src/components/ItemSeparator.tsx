import React from 'react';
import { View } from 'react-native';

const ItemSeparator = ({ width }) => {
  return <View style={{ width: width || '100%', alignSelf: 'center', height: 2, backgroundColor: 'lightgray' }} />;
};

export default ItemSeparator;
