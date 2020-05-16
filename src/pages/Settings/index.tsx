import React, { useEffect } from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native-gesture-handler';
import Keys from './Keys';
import Fiats from './Fiats';
import lf from '../../controllers/fiats/ListFiats';
import HamburgerIcon from '../../components/HamburgerIcon';

const SettingsPage = ({ navigation }) => {
  navigation.setOptions({
    title: 'Settings',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
  });

  return (
    <Container>
      <ScrollView>
        <Keys />
        <Fiats />
      </ScrollView>
    </Container>
  );
};

export default SettingsPage;

const Container = styled.SafeAreaView`
  flex: 1;
  margin: 8px;
`;
