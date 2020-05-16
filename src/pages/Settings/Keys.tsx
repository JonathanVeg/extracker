import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Text, StyleSheet, Alert } from 'react-native';
import { H1, H2, H3 } from '../../components/Hs';
import { colors } from '../../style/globals';
import MyInput from '../../components/MyInput';
import StorageUtils from '../../utils/StorageUtils';

export default function Keys({ onSave }) {
  const [alreadyHaveKey, setAlreadyHaveKey] = useState(false);
  const [key, setKey] = useState('');
  const [secret, setSecret] = useState('');

  async function readKeys() {
    const data = await StorageUtils.getKeys();

    const hasKeys = !!data.key && !!data.secret;

    if (hasKeys) {
      setKey(`${data.key.substring(0, 3)}...${data.key.slice(-3)}`);
      setSecret(`${data.secret.substring(0, 3)}...${data.secret.slice(-3)}`);
    }

    setAlreadyHaveKey(hasKeys);
  }

  useEffect(() => {
    readKeys();
  }, []);

  async function saveKeys() {
    try {
      await StorageUtils.saveKeys(key, secret);

      Alert.alert('Success', 'Keys saved');

      if (onSave) onSave();
    } catch (err) {
      Alert.alert('Error', 'Error while saving keys');
    }
  }

  return (
    <>
      <H1>Account Keys</H1>
      {alreadyHaveKey && <H3>(you will override saved data)</H3>}

      <H2>Key</H2>
      <MyInput
        spellCheck={false}
        value={key}
        onChangeText={text => {
          setKey(text);
        }}
      />

      <H2>Secret</H2>

      <MyInput
        spellCheck={false}
        value={secret}
        onChangeText={text => {
          setSecret(text);
        }}
      />

      <Button onPress={saveKeys}>
        <Text>SALVAR</Text>
      </Button>
    </>
  );
}

const Button = styled.TouchableOpacity`
  border-width: ${StyleSheet.hairlineWidth}px;
  margin: 8px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  border-color: ${colors.darker};
`;
