import React from 'react';
import { TouchableWithoutFeedback } from 'react-native';
import styled from 'styled-components/native';
import { Row } from './Generics';
import MyText from './MyText';

interface ParamsInterface {
  label: string;
  onPress: () => void;
  checked: boolean;
}

const MyCheckbox: React.FC = ({ label, onPress, checked }: ParamsInterface) => {
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Row>
        <CheckboxView checked={checked} />
        {label && <MyText>{label}</MyText>}
      </Row>
    </TouchableWithoutFeedback>
  );
};

const CheckboxView = styled.View`
  height: 20px;
  width: 20px;
  border-radius: 10px;
  padding: 5px;
  margin: 5px;
  border-color: black;
  background-color: ${({ checked }) => (checked ? 'black' : 'transparent')};
  border-width: 1px;
`;

export default MyCheckbox;
