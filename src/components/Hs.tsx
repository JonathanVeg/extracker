import styled from 'styled-components/native';

export const H1 = styled.Text`
  font-size: 16px;
  font-weight: bold;
  text-align: ${({ center }) => (center ? 'center' : 'auto')};
`;

export const H2 = styled.Text`
  font-size: 14px;
  font-weight: bold;
`;

export const H3 = styled.Text`
  font-size: 12px;
  font-weight: bold;
`;
