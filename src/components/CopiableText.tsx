import React from 'react';
import { TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { useToast } from '../hooks/ToastContext';
import MyText from './MyText';

export default function CopiableText({ text, children, style }) {
  const { showToast } = useToast();

  function onLongPressButton() {
    Clipboard.setString(text || children);

    const message = `Value ${text || children} copied to clipboard`;

    showToast({ text: message, type: 'info' });
  }

  return (
    <TouchableOpacity onLongPress={onLongPressButton}>
      <MyText numberOfLines={1} ellipsizeMode="middle" style={style}>
        {text || children}
      </MyText>
    </TouchableOpacity>
  );
}

CopiableText.defaultProps = {
  style: {},
};
