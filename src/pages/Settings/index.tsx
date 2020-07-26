import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import Fiats from './Fiats';
import HamburgerIcon from '../../components/HamburgerIcon';
import { Container } from '../../components/Generics';

const SettingsPage = ({ navigation }) => {
  navigation.setOptions({
    title: 'Settings',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
  });

  return (
    <Container>
      <ScrollView>
        {/* <Keys /> */}
        {/* <DivisionLine /> */}
        <Fiats />
      </ScrollView>
    </Container>
  );
};

export default SettingsPage;

// const DivisionLine = styled.View`
//   align-self: center;
//   margin-bottom: 10px;
//   margin-top: 10px;
//   width: 80%;
//   border-bottom-color: black;
//   border-bottom-width: ${StyleSheet.hairlineWidth}px;
// `;
