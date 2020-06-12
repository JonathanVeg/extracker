import React from 'react';
import { View, Text, FlatList } from 'react-native';
import LabelValueBlock from '../../components/LabelValueBlock';
import HamburgerIcon from '../../components/HamburgerIcon';
import { H0, H1, H2 } from '../../components/Hs';
import ItemSeparator from '../../components/ItemSeparator';
import { Spacer } from '../../components/Spacer';

const DonatePage = ({ navigation }) => {
  navigation.setOptions({
    title: 'Settings',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
  });

  const donationsOptions = [
    {
      coin: 'BTC',
      wallet: 'FOO',
    },
    {
      coin: 'DCR',
      wallet: 'FOO',
    },
    {
      coin: 'LTC',
      wallet: 'FOO',
    },
  ];

  return (
    <View>
      <H0 center>Pay me a coffee... or two</H0>
      <H2 center>and help to keep this project</H2>
      <Spacer />
      <ItemSeparator width="70%" />
      <Spacer />

      <H2 center>Coins</H2>
      <FlatList
        data={donationsOptions}
        keyExtractor={it => it.coin}
        renderItem={({ item }) => <LabelValueBlock label={item.coin} value={item.wallet} copiable />}
      />
    </View>
  );
};

export default DonatePage;
