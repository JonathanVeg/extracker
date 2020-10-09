import React, { useEffect } from 'react';
import { TextInput } from 'react-native';
import { colors } from '../style/globals';
import StorageUtils from '../utils/StorageUtils';

function MyInput(props) {
  useEffect(() => {
    if (!props.autoSaveKey) return;
    if (!props.onChangeText) return;

    setTimeout(() => {
      async function get() {
        let got = await StorageUtils.getItem(props.autoSaveKey);

        if (got) props.onChangeText(got);
      }
      get();
    }, 100);
  }, []);

  return (
    <TextInput
      keyboardType={props.text ? 'default' : 'numeric'}
      spellCheck={false}
      style={{ margin: 8, height: 25, borderWidth: 1, alignSelf: 'stretch', color: colors.darker, padding: 3 }}
      {...props}
      onChangeText={text => {
        if (props.onChangeText) props.onChangeText(text.replace(',', '.'));

        if (props.autoSaveKey) {
          setTimeout(() => {
            StorageUtils.setItem(props.autoSaveKey, text.replace(',', '.'));
          }, 100);
        }
      }}
    />
  );
}

export default MyInput;
