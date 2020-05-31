import React from 'react';
import { TextInput } from 'react-native';
import { colors } from '../style/globals';

const MyInput = () => (
  <TextInput
    spellCheck={false}
    style={{ margin: 8, height: 25, borderWidth: 1, alignSelf: 'stretch', color: colors.darker, padding: 3 }}
  />
);

export default MyInput;
