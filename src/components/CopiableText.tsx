import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { useToast } from '../hooks/ToastContext';

export default function CopiableText({ text, children, style }) {
  const { showToast } = useToast();

  function onLongPressButton() {
    Clipboard.setString(text || children);

    const message = `Value ${text || children} copied to clipboard`;

    showToast({ text: message, type: 'info' });
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
