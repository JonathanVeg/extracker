import React, { createContext, useEffect, useState, useContext } from 'react';
import { Dimensions, View, Text } from 'react-native';

import styled from 'styled-components/native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface ToastContextI {
  showToast(text: string): void | null;
  cancelToast(): void | null;
}

const initialValue = { showToast: null, cancelToast: null };

const KeysContext = createContext<ToastContextI>(initialValue);

const windowHeight = Dimensions.get('window').height;

const ToastProvider = ({ children }) => {
  const TOAST_TIME_MS = 2000;

  const [text, setText] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (text) setShow(true);
  }, [text]);

  function showToast(text: string) {
    setText(text);
  }

  function cancelToast() {
    setShow(false);
  }

  useEffect(() => {
    if (show) {
      setTimeout(() => {
        setShow(false);
        setText('');
      }, TOAST_TIME_MS);
    }
  }, [show]);

  const Toast = () => (
    <Container>
      <TouchableWithoutFeedback onPress={cancelToast}>
        <ToastText>{text}</ToastText>
      </TouchableWithoutFeedback>
    </Container>
  );

  return (
    <KeysContext.Provider value={{ showToast, cancelToast }}>
      {show && <Toast />}
      {children}
    </KeysContext.Provider>
  );
};

function useToast(): ToastContextI {
  const context = useContext(KeysContext);

  if (!context) throw new Error('useToast must be used within a ToastProvider');

  return context;
}

export { useToast, ToastProvider };

const Container = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  margin-top: ${windowHeight - 100}px;
  justify-content: center;
  z-index: 999;
`;
const ToastText = styled.Text`
  align-self: center;
  padding: 10px;
  background-color: #ff000010;
`;
