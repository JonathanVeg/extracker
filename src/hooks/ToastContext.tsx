import React, { createContext, useEffect, useState, useContext } from 'react';
import { Dimensions } from 'react-native';

import styled from 'styled-components/native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

interface ToastContextProps {
  showToast(data: ToastData): void | null;
  cancelToast(): void | null;
}

const initialValue = { showToast: null, cancelToast: null };
const KeysContext = createContext<ToastContextProps>(initialValue);
const windowHeight = Dimensions.get('window').height;

const ToastTimes = {
  LENGTH_LONG: 3500,
  LENGTH_SHORT: 2000,
};

interface ToastData {
  type?: 'success' | 'error' | 'info';
  text: string;
  timeMS?: number;
}

const ToastProvider = ({ children }) => {
  const [toastData, setToastData] = useState<ToastData | null>(null);

  function showToast(data: ToastData) {
    setToastData(data);
  }

  function cancelToast() {
    setToastData(null);
  }

  return (
    <KeysContext.Provider value={{ showToast, cancelToast }}>
      {toastData && <Toast toastData={toastData} />}
      {children}
    </KeysContext.Provider>
  );
};

function Toast({ toastData }) {
  const data: ToastData = toastData;
  if (!data.type) data.type = 'info';

  const DEFAULT_TOAST_TIME_MS = ToastTimes.LENGTH_SHORT;

  const { cancelToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      cancelToast();
    }, data.timeMS || DEFAULT_TOAST_TIME_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Container>
      <TouchableWithoutFeedback onPress={cancelToast}>
        <ToastText type={data.type}>{data.text}</ToastText>
      </TouchableWithoutFeedback>
    </Container>
  );
}

function useToast(): ToastContextProps {
  const context = useContext(KeysContext);

  if (!context) throw new Error('useToast must be used within a ToastProvider');

  return context;
}

const Container = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  margin-top: ${windowHeight - 200}px;
  justify-content: center;
  z-index: 999;
`;

const ToastText = styled.Text`
  align-self: center;
  text-align: center;
  padding: 10px;
  margin: 0 10px;

  background-color: ${({ type }) => {
    if (type === 'success') return '#dff2bf';
    if (type === 'error') return '#ffd2d2';
    return '#bde5f8';
  }};

  color: ${({ type }) => {
    if (type === 'success') return '#4f8a10';
    if (type === 'error') return '#d8000c';
    return '#00529b';
  }};
`;

export { useToast, ToastProvider, ToastTimes };
