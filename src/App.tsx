import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AboutPage from './pages/About';
import CoinPage from './pages/Coin';
import Home from './pages/Home';
import NewOrder from './pages/Wallet/NewOrder';
import SettingsPage from './pages/Settings';
import WalletPage from './pages/Wallet';
import { colors } from './style/globals';
import './utils/prototypes';
import CoinPageMyOrdersHistory from './pages/Wallet/MyOrdersHistory';
import CoinPageCalculator from './pages/Coin/Calculator';
import { FiatProvider } from './context/FiatContext';

// const CoinPageNavigator = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.white },
  cardStyle: { backgroundColor: colors.white },
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Home">
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="Coins" component={CoinPage} />
    <Stack.Screen name="NewOrder" component={NewOrder} />
    <Stack.Screen name="Orders" component={CoinPageMyOrdersHistory} />
  </Stack.Navigator>
);

const WalletPageStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Wallet">
    <Stack.Screen name="Wallet" component={WalletPage} />
    <Stack.Screen name="Coins" component={CoinPage} />
    <Stack.Screen name="NewOrder" component={NewOrder} />
    <Stack.Screen name="Orders" component={CoinPageMyOrdersHistory} />
    <Stack.Screen name="Calculator" component={CoinPageCalculator} />
  </Stack.Navigator>
);

const SettingsPageStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Settings">
    <Stack.Screen name="Settings" component={SettingsPage} />
  </Stack.Navigator>
);

const AboutPageStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="About">
    <Stack.Screen name="About" component={AboutPage} />
  </Stack.Navigator>
);

const GlobalNavigator = () => (
  <Drawer.Navigator initialRouteName="Home">
    <Drawer.Screen
      name="Home"
      component={HomeStack}
      options={{ drawerIcon: () => <Icon name="home" size={20} /> }}
    />

    <Drawer.Screen
      name="Wallets"
      component={WalletPageStack}
      options={{ drawerIcon: () => <Icon name="wallet" size={20} /> }}
    />

    <Drawer.Screen
      name="Settings"
      component={SettingsPageStack}
      options={{ drawerIcon: () => <Icon name="settings" size={20} /> }}
    />

    <Drawer.Screen
      name="About"
      component={AboutPageStack}
      options={{ drawerIcon: () => <Icon name="information" size={20} /> }}
    />
  </Drawer.Navigator>
);

const App = () => (
  <>
    <StatusBar barStyle="dark-content" backgroundColor="white" />
    <FiatProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <GlobalNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </FiatProvider>
  </>
);

export default App;
