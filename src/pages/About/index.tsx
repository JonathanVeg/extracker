/* eslint-disable global-require */
import React from 'react';
import { Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  Container,
  Disclaimer,
  DivisionLine,
  Header,
  Link,
  Links,
  LinkText,
  Logo,
  SmallText,
  Space,
  TopText,
} from './styles';
import { colors } from '../../style/globals';
import HamburgerIcon from '../../components/HamburgerIcon';

const AboutPage = ({ navigation }) => {
  navigation.setOptions({
    title: 'About',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
  });

  const links = [
    {
      icon: 'logo-twitter',
      label: 'Twitter',
      url: 'https://twitter.com/jonathanveg2',
    },
    {
      icon: 'logo-github',
      label: 'GitHub',
      url: 'https://github.com/jonathanveg',
    },
    { icon: 'md-at', label: 'Gmail', url: 'mailto:jonathan.jgs@gmail.com' },
  ];

  return (
    <Container>
      <Header>
        <Logo source={require('../../../trexlogo.jpg')} />
        <TopText> This app was developed by Jonathan Silva</TopText>
        <TopText> Logo by Abunagaya Aceh</TopText>
        <TopText> UX/UI by Fagner Marques</TopText>
        <DivisionLine />
      </Header>

      <Links>
        {links.map(link => {
          return (
            <Link key={link.label} onPress={() => Linking.openURL(link.url)}>
              <LinkText>{link.label}</LinkText>
              <Icon name={link.icon} size={60} color={colors.darker} />
            </Link>
          );
        })}
      </Links>

      <Space />
      <Disclaimer>
        <DivisionLine />
        <SmallText>
          Disclaimer: this app is not official app developed by Bittrex!
        </SmallText>
      </Disclaimer>
    </Container>
  );
};

export default AboutPage;
