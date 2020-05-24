import React, { useState } from 'react';
import { View } from 'react-native';
import { default as FA } from 'react-native-vector-icons/FontAwesome';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import CoinPageSummary from './Summary';
import Coin from '../../models/Coin';
import CoinPageOrders from './Orders';
import CoinPageOrdersHistory from './OrdersHistory';
import CoinPageMyOrdersHistory from '../Wallet/MyOrdersHistory';
import CoinPageChart from './Chart';
import { colors } from '../../style/globals';
import { Container } from '../../components/Generics';
import CoinPageCalculator from './Calculator';

const CoinPage: React.FC = props => {
  const coin: Coin = (props?.route?.params || {}).coin || new Coin('DCR', 'BTC');

  const { navigation } = props;

  const headerRight = () => (
    <View style={{ marginStart: 5, flexDirection: 'row' }}>
      <TouchableOpacity onPress={gotoOrders}>
        <FA name="exchange" size={25} style={{ marginEnd: 15 }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={gotoNewOrder}>
        <FA name="cart-plus" size={25} style={{ marginEnd: 15 }} />
      </TouchableOpacity>
    </View>
  );

  const gotoNewOrder = () => navigation.navigate('NewOrder', { coin });
  const gotoOrders = () => navigation.navigate('Orders');

  navigation.setOptions({ title: 'Wallets', headerRight });

  navigation.setOptions({ title: `${coin.name}-${coin.market}` });

  const footerItems = [
    { icon: 'list' },
    { icon: 'plus' },
    { icon: 'minus' },
    { icon: 'history' },
    { icon: 'line-chart' },
    { icon: 'exchange' },
    { icon: 'calculator' },
  ];

  const [currentPage, setCurrentPage] = useState(footerItems[0]);

  const Footer = () => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      {footerItems.map(it => (
        <TouchableOpacity style={{ padding: 8 }} key={`coinitem${it.icon}`} onPress={() => setCurrentPage(it)}>
          <FA name={it.icon} size={25} color={currentPage.icon === it.icon ? colors.darker : colors.light} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const CurrentPage = () => {
    if (currentPage.icon === 'list') return <CoinPageSummary coin={coin} />;
    if (currentPage.icon === 'plus') return <CoinPageOrders coin={coin} type="buy" />;
    if (currentPage.icon === 'minus') return <CoinPageOrders coin={coin} type="sell" />;
    if (currentPage.icon === 'history') return <CoinPageOrdersHistory coin={coin} />;
    if (currentPage.icon === 'line-chart') return <CoinPageChart coin={coin} />;
    if (currentPage.icon === 'exchange') return <CoinPageMyOrdersHistory coin={coin} />;
    // if (currentPage.icon === 'calculator')
    return <CoinPageCalculator coin={coin} />;
  };

  return (
    <Container>
      <Content>
        <CurrentPage />
      </Content>
      <Footer />
    </Container>
  );
};

export default CoinPage;

const Content = styled.View`
  flex: 1;
`;
