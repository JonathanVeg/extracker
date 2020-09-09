import React from 'react';
import { View, Text, FlatList } from 'react-native';
import LabelValueBlock from '../../components/LabelValueBlock';
import HamburgerIcon from '../../components/HamburgerIcon';
import { H0, H1, H2 } from '../../components/Hs';
import ItemSeparator from '../../components/ItemSeparator';
import { Spacer } from '../../components/Spacer';
import { Container } from '../../components/Generics';

const DonatePage = ({ navigation }) => {
  navigation.setOptions({
    title: 'Settings',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
  });

  const donationsOptions = [
    { coin: 'BTC', wallet: '1GDa2bhgKaCwQrka2xY1P9cexKNb88HYFE' },
    { coin: 'DCR', wallet: 'DsUJTC7MZDWfnWyYnmm9P6ijsA44oRQVsSn' },
    { coin: 'LTC', wallet: 'LQKxspbkozyHkWCRuwMcjVpkaPoLEbjAoe' },
    { coin: 'ETH', wallet: '0xd6cab66bba8d079bed664cc729ccdc6a259bed8f' },
  ];

  return (
    <Container>
      <H0 center>Pay me a coffee... or two</H0>
      <H2 center>and help to keep this project</H2>
      <Spacer />
      <ItemSeparator width="70%" />
      <Spacer />

      <H2 center>Coins</H2>
      <FlatList
        data={donationsOptions}
        keyExtractor={it => it.coin}
        renderItem={({ item }) => (
          <LabelValueBlock style={{ paddingVertical: 5 }} label={item.coin} value={item.wallet} copiable />
        )}
      />
    </Container>
  );
};

export default DonatePage;
