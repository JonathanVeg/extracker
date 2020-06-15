import { StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { colors } from '../../style/globals';

export const PercentButton = styled.TouchableOpacity`
  border-width: ${StyleSheet.hairlineWidth}px;
  padding: 8px;
  margin: 3px;
  border-color: ${({ more }) => (more ? colors.buyBackground : colors.sellBackground)};
`;

export const ToggleButton = styled.Text`
  border-width: ${StyleSheet.hairlineWidth}px;
  padding: 8px;
  margin: 3px;
  font-weight: ${({ bold }) => (bold ? 'bold' : 'normal')};
`;

export const ExecOrderButton = styled.TouchableOpacity`
  border-width: ${StyleSheet.hairlineWidth}px;
  margin: 8px;
  padding: 8px;
  border-color: ${({ buying }) => (buying ? colors.buyBackground : colors.sellBackground)};
`;
