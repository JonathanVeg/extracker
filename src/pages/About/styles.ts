import { StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '../../style/globals';

export const Container = styled.SafeAreaView`
  height: 100%;
`;

export const Space = styled.View`
  flex: 1;
`;

export const Links = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
`;

export const Link = styled.TouchableOpacity`
  border-width: ${StyleSheet.hairlineWidth}px;
  border-color: ${colors.darker};
  border-radius: 8px;
  align-items: center;
  padding: 8px;
  margin: 8px;
`;

export const LinkText = styled.Text`
  color: ${colors.darker};
  font-size: 24px;
`;

export const Header = styled.View`
  /* flex: 1; */
  align-items: center;
`;

export const TopText = styled.Text`
  font-size: 15px;
  font-weight: bold;
`;

export const Disclaimer = styled.View`
  align-items: center;
`;

export const DivisionLine = styled.View`
  margin-bottom: 10px;
  margin-top: 10px;
  width: 80%;
  border-bottom-color: black;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
`;

export const Logo = styled.Image`
  width: 150px;
  height: 150px;
  margin: 10px;
`;

export const SmallText = styled.Text`
  font-weight: bold;
  font-size: 11px;
`;
