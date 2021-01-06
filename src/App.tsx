import codePush from 'react-native-code-push';
import React, { ReactElement, useState } from 'react';
import { createDrawerNavigator, DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeArea } from 'react-native-safe-area-context';
import { StatusBar, View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as Ionicons } from 'react-native-vector-icons/Ionicons';
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
import { H1, H3 } from './components/Hs';
import AppProvider from './hooks';
import SecurityPage from './pages/Security';
import DonatePage from './pages/Donate';
import { useKeys } from './hooks/KeysContext';
import AlertPage from './pages/Alert';
import OneSignalWrapper from './controllers/OneSignal';
import ContactPage from './pages/Contact';
import { useExchange } from './hooks/ExchangeContext';
import Poloniex from './controllers/exchanges/Poloniex';
import Bittrex from './controllers/exchanges/Bittrex';
import MyText from './components/MyText';

declare global {
  interface Number {
    idealDecimalPlaces: () => string;
  }
  interface String {
    idealDecimalPlaces: () => string;
  }
}

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
    <Stack.Screen name="Alert" component={AlertPage} />
  </Stack.Navigator>
);

const SettingsPageStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Settings">
    <Stack.Screen name="Settings" component={SettingsPage} />
  </Stack.Navigator>
);

const DonatePageStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Donate">
    <Stack.Screen name="Donate" component={DonatePage} />
  </Stack.Navigator>
);

const AlertPageStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Alert">
    <Stack.Screen name="Alert" component={AlertPage} />
  </Stack.Navigator>
);

const ContactPageStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Contact">
    <Stack.Screen name="Contact" component={ContactPage} />
  </Stack.Navigator>
);

const AboutPageStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="About">
    <Stack.Screen name="About" component={AboutPage} />
  </Stack.Navigator>
);

function CustomDrawerContent({ exchange, changeExchange, usingKeys, drawerPosition, navigation }): ReactElement {
  const insets = useSafeArea();

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
        <H1 center>EXTRACKER</H1>
        <H3 center>
          ({exchange.name}
          )
</H3>

        <DrawerItem
          icon={() => <Icon name="home" size={20} />}
          label="Home"
          onPress={() => navigation.navigate('Home')}
        />

        {usingKeys && (
          <DrawerItem
            icon={() => <Icon name="wallet" size={20} />}
            label="Wallets"
            onPress={() => navigation.navigate('Wallets')}
          />
        )}
        <DrawerItem
          icon={() => <Ionicons name="settings" size={20} />}
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <DrawerItem
          icon={() => <Icon name="message" size={20} />}
          label="Contact"
          onPress={() => navigation.navigate('Contact')}
        />
        <DrawerItem
          icon={() => <Icon name="bell" size={20} />}
          label="Alert"
          onPress={() => navigation.navigate('Alert')}
        />
        {/* <DrawerItem
          icon={() => <FA name="money" size={20} />}
          label="Donate"
          onPress={() => navigation.navigate('Donate')}
        /> */}
        <DrawerItem
          icon={() => <Icon name="information" size={20} />}
          label="About"
          onPress={() => navigation.navigate('About')}
        />
      </View>
      <TouchableOpacity
        onPress={() => {
          changeExchange(exchange === Bittrex ? Poloniex : Bittrex);
        }}
      >
        <H3 center>
          Change exchange to
          {exchange === Bittrex ? 'Poloniex' : 'Bittrex'}
        </H3>
      </TouchableOpacity>
      <DivisionLine />
      <View>
        <TouchableOpacity onPress={() => Linking.openURL('https://twitter.com/JonathanVeg2')}>
          <MyText style={{ alignSelf: 'center', color: colors.darker }}>Made by @JonathanVeg</MyText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GlobalNavigator = () => {
  const { usingKeys } = useKeys();
  const { exchange, changeExchange } = useExchange();

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props): ReactElement => (
        <CustomDrawerContent exchange={exchange} changeExchange={changeExchange} usingKeys={usingKeys} {...props} />
      )}
    >
      <Drawer.Screen name="Home" component={HomeStack} />
      {usingKeys && <Drawer.Screen name="Wallets" component={WalletPageStack} />}
      <Drawer.Screen name="Settings" component={SettingsPageStack} />
      <Drawer.Screen name="Alert" component={AlertPageStack} />
      <Drawer.Screen name="Contact" component={ContactPageStack} />
      <Drawer.Screen name="Donate" component={DonatePageStack} />
      <Drawer.Screen name="About" component={AboutPageStack} />
    </Drawer.Navigator>
  );
};

const App = () => {
  const [read, setRead] = useState(false);

  if (!read) return <SecurityPage setRead={setRead} />;

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="black" />
      <AppProvider>
        <OneSignalWrapper />
        <SafeAreaProvider>
          <NavigationContainer>
            <GlobalNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AppProvider>
    </>
  );
};

export default codePush(App);

const DivisionLine = styled.View`
  margin-bottom: 10px;
  margin-top: 10px;
  width: 80%;
  align-self: center;
  border-bottom-color: black;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
`;
