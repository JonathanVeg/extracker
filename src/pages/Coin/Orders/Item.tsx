import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

// import { Container } from './styles';

const Item: React.FC = ({ item }) => {
  useEffect(() => {
    console.log('AQUI ' + item.rate);
  }, []);
  return (
    <View>
      <Text>{item.rate}</Text>
    </View>
  );
};

export default Item;
