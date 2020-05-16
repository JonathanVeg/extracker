import React from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';

export default function CopiableText({ text, children, style }) {
  function onLongPressButton() {
    Clipboard.setString(text || children);

    const message = `Value ${text || children} copied to clipboard`;

    Alert.alert(message);
  }

  return (
    <TouchableOpacity onLongPress={onLongPressButton}>
      <Text numberOfLines={1} ellipsizeMode="middle" style={style}>
        {text || children}
      </Text>
    </TouchableOpacity>
  );
}

CopiableText.defaultProps = {
  style: {},
};
