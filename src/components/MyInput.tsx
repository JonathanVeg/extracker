import styled from 'styled-components/native';
import { colors } from '../style/globals';

const MyInput = styled.TextInput`
  margin: 8px;
  height: 25px;
  border-width: 1px;
  align-self: stretch;
  color: ${colors.darker};
  padding: 3px;
`;

export default MyInput;
