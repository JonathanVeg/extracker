import React, { ReactElement, useState } from 'react';
import { createDrawerNavigator, DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeArea } from 'react-native-safe-area-context';
import { StatusBar, Text, View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import styled from 'styled-components/native';
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
import { H1 } from './components/Hs';
import AppProvider from './hooks';
import SecurityPage from './pages/Security';
import OneSignalWrapper from './controllers/OneSignal';

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

function CustomDrawerContent({ drawerPosition, navigation }): ReactElement {
  const insets = useSafeArea();

  // navigation.openDrawer();

  return (
    <View
      style={{
        paddingTop: insets.top + 4,
        paddingLeft: drawerPosition === 'left' ? insets.left : 0,
        paddingRight: drawerPosition === 'right' ? insets.right : 0,
        paddingBottom: insets.bottom,
        flex: 1,
      }}
    >
      <View style={{ flex: 1 }}>
        <H1 center>TREXTRACKER</H1>

        <DrawerItem
          icon={() => <Icon name="home" size={20} />}
          label="Home"
          onPress={() => {
            navigation.navigate('Home');
          }}
        />
        <DrawerItem
          icon={() => <Icon name="wallet" size={20} />}
          label="Wallets"
          onPress={() => {
            navigation.navigate('Wallets');
          }}
        />
        <DrawerItem
          icon={() => <Icon name="settings" size={20} />}
          label="Settings"
          onPress={() => {
            navigation.navigate('Settings');
          }}
        />
        <DrawerItem
          icon={() => <Icon name="information" size={20} />}
          label="About"
          onPress={() => {
            navigation.navigate('About');
          }}
        />
      </View>
      <DivisionLine />
      <View>
        <TouchableOpacity onPress={() => Linking.openURL('https://twitter.com/JonathanVeg2')}>
          <Text style={{ alignSelf: 'center', color: colors.darker }}>Made by @JonathanVeg</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GlobalNavigator = () => (
  <Drawer.Navigator initialRouteName="Home" drawerContent={(props): ReactElement => <CustomDrawerContent {...props} />}>
    <Drawer.Screen name="Home" component={HomeStack} />
    <Drawer.Screen name="Wallets" component={WalletPageStack} />
    <Drawer.Screen name="Settings" component={SettingsPageStack} />
    <Drawer.Screen name="About" component={AboutPageStack} />
  </Drawer.Navigator>
);

const App = () => {
  const [read, setRead] = useState(false);

  if (!read) return <SecurityPage setRead={setRead} />;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <AppProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <GlobalNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
        <OneSignalWrapper />
      </AppProvider>
    </>
  );
};

export default App;

const DivisionLine = styled.View`
  margin-bottom: 10px;
  margin-top: 10px;
  width: 80%;
  align-self: center;
  border-bottom-color: black;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
`;
