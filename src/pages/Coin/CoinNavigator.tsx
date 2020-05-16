import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CoinPageSummary from './Summary';
import CoinPageOrders from './Orders';

const Tab = createBottomTabNavigator();

export default function CoinPageNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="CoinPageSummary" component={CoinPageSummary} />
      <Tab.Screen name="CoinPageOrders" component={CoinPageOrders} />
    </Tab.Navigator>
  );
}
