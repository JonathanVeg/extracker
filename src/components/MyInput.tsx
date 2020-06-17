import React from 'react';
import { TextInput } from 'react-native';
import { colors } from '../style/globals';

function MyInput(props) {
  return (
    <TextInput
      keyboardType={props.text ? 'default' : 'numeric'}
      spellCheck={false}
      style={{ margin: 8, height: 25, borderWidth: 1, alignSelf: 'stretch', color: colors.darker, padding: 3 }}
      {...props}
      onChangeText={text => {
        if (props.onChangeText) props.onChangeText(text.replace(',', '.'));
      }}
    />
  );
}

export default MyInput;
