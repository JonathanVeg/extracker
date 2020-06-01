import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, SafeAreaView } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import StorageUtils from '../../utils/StorageUtils';
import { H1, H2 } from '../../components/Hs';
import { Spacer } from '../../components/Spacer';

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
    const { available } = await ReactNativeBiometrics.isSensorAvailable();

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
      <H1>READING BIOMETRIC</H1>
      <Spacer />
      <Text>{error}</Text>
      <Spacer />
      {showTryAgain && (
        <TouchableOpacity onPress={readBiometrics}>
          <H2>Try Again</H2>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
