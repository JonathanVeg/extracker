import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { Text, StyleSheet } from 'react-native';
import { H1, H2, H3 } from '../../components/Hs';
import { colors } from '../../style/globals';
import MyInput from '../../components/MyInput';
import StorageUtils from '../../utils/StorageUtils';
import { useKeys } from '../../hooks/KeysContext';
import { useToast } from '../../hooks/ToastContext';

export default function Keys() {
  const { hasKeys, key, secret, reloadKeys } = useKeys();

  const [newKey, setNewKey] = useState('');
  const [newSecret, setNewSecret] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    if (!hasKeys) return;

    setNewKey(`${key.substring(0, 3)}...${key.slice(-3)}`);
    setNewSecret(`${secret.substring(0, 3)}...${secret.slice(-3)}`);
  }, []);

  async function saveKeys() {
    try {
      await StorageUtils.saveKeys(newKey, newSecret);

      showToast({ text: 'Keys saved', type: 'success' });

      reloadKeys();
    } catch (err) {
      showToast({ text: 'Error while saving keys', type: 'error' });
    }
  }

  return (
    <>
      <H1>Account Keys</H1>
      {hasKeys && <H3>(you will override saved data)</H3>}

      <H2>Key</H2>
      <MyInput
        spellCheck={false}
        value={newKey}
        onChangeText={text => {
          setNewKey(text);
        }}
      />

      <H2>Secret</H2>

      <MyInput
        spellCheck={false}
        value={newSecret}
        onChangeText={text => {
          setNewSecret(text);
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
  width: 50%;
  margin: 8px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  align-self: center;
  border-color: ${colors.darker};
`;
