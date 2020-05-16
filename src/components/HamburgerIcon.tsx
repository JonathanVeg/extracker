import React from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { DrawerActions } from '@react-navigation/native';

export default function HamburgerIcon({ navigationProps }) {
  const toggleDrawer = () => {
    navigationProps.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={{ marginStart: 5, flexDirection: 'row' }}>
      <TouchableOpacity onPress={toggleDrawer}>
        <Icon name="menu" size={25} style={{ marginStart: 15 }} />
      </TouchableOpacity>
    </View>
  );
}
