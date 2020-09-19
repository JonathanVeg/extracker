import React, { useEffect, useState } from 'react';
import { TouchableOpacity, SafeAreaView, Image } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import styled from 'styled-components/native';
import StorageUtils from '../../utils/StorageUtils';
import { H1, H2 } from '../../components/Hs';
import { Spacer } from '../../components/Spacer';
import MyText from '../../components/MyText';

export default function SecurityPage({ setRead }) {
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    runSecurityFlow();
  }, []);

  async function runSecurityFlow() {
    const requireBiometricPrompt = await StorageUtils.getItem('requireBiometrics');
    if (requireBiometricPrompt) readBiometrics();
    else setRead(true);
  }

  async function readBiometrics() {
    const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();

    if (!available) {
      setRead(true);
      return;
    }

    setError('');

    setTimeout(() => {
      ReactNativeBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' })
        .then(resultObject => {
          const { error, success } = resultObject;
          setRead(success);
          setError(error);
          setShowTryAgain(true);
        })
        .catch(() => {
          // showTryAgain(true);
          setRead(false);
        });
    }, 250);
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', height: '100%', alignItems: 'center' }}>
      <Logo source={require('../../../trexlogo.jpg')} />
      <H1>Authenticating</H1>

      <Spacer />
      <MyText>{error}</MyText>
      <Spacer />
      {showTryAgain && (
        <TouchableOpacity onPress={readBiometrics}>
          <H2 style={{ borderWidth: 1, padding: 8, borderColor: 'black' }}>Try Again</H2>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const Logo = styled.Image`
  width: 150px;
  height: 150px;
  margin: 10px;
`;
