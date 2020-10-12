/* eslint-disable global-require */
import React from 'react';
import { Linking, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { default as FA } from 'react-native-vector-icons/FontAwesome';
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
    [
      { icon: 'logo-twitter', label: 'Twitter', url: 'https://twitter.com/jonathanveg2' },
      { icon: 'logo-github', label: 'GitHub', url: 'https://github.com/jonathanveg' },
      { icon: 'md-at', label: 'E-mail', url: 'mailto:jonathan.jgs@gmail.com' },
    ],
    [
      { icon: 'ios-code', label: 'Code', url: 'https://github.com/JonathanVeg/extracker' },
      { icon: 'telegram', label: 'Telegram', url: 'https://t.me/TrackersAppGroup' },
    ],
  ];

  return (
    <Container>
      <Header>
        {/* <Image source={require('../../../trexlogo.jpg')} /> */}
        {/* <Logo source={require('../../../logo180.png')} /> */}
        <TopText> App developed by Jonathan Silva</TopText>
        {/* <TopText> Logo by Abunagaya Aceh</TopText> */}
        <TopText> UX/UI/Logo by Fagner Marques</TopText>
        <DivisionLine />
      </Header>

      <Links>
        {links[0].map(link => {
          return (
            <Link key={link.label} style={{ flex: 1 }} onPress={() => Linking.openURL(link.url)}>
              <LinkText>{link.label}</LinkText>
              {link.icon === 'telegram' ? (
                <FA name={link.icon} size={60} color={colors.darker} />
              ) : (
                <Icon name={link.icon} size={60} color={colors.darker} />
              )}
            </Link>
          );
        })}
      </Links>
      <Links>
        {links[1].map(link => {
          return (
            <Link key={link.label} style={{ flex: 1 }} onPress={() => Linking.openURL(link.url)}>
              <LinkText>{link.label}</LinkText>
              {link.icon === 'telegram' ? (
                <FA name={link.icon} size={60} color={colors.darker} />
              ) : (
                <Icon name={link.icon} size={60} color={colors.darker} />
              )}
            </Link>
          );
        })}
      </Links>

      <Space />
      <Disclaimer>
        <DivisionLine />
        <SmallText>Disclaimer: this app is not official app developed</SmallText>
        <SmallText>by Bittrex or Poloniex!</SmallText>
      </Disclaimer>
    </Container>
  );
};

export default AboutPage;
