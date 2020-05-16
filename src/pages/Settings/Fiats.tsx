import ModalSelector from 'react-native-modal-selector';
import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Alert, View } from 'react-native';
import styled from 'styled-components/native';
import { H1 } from '../../components/Hs';
import { colors } from '../../style/globals';
import StorageUtils from '../../utils/StorageUtils';
import Fiat from '../../controllers/fiats/Fiat';
import allFiats from '../../controllers/fiats/ListFiats';
import listFiats from '../../controllers/fiats/FiatsHelper';

export default function Fiats() {
  const [fiats, setFiats] = useState<Fiat[]>([]);

  async function loadFiats() {
    const fiats = await listFiats();
    setFiats(fiats);
  }

  useEffect(() => {
    loadFiats();
  }, []);

  async function saveFiats() {
    StorageUtils.setItem(
      '@extracker:fiats',
      fiats.map(it => it.label).join(','),
    );

    Alert.alert('Saved', 'New fiats saved.');
  }

  return (
    <>
      <H1>Fiats</H1>

      <View style={{ flexDirection: 'row', marginTop: 8 }}>
        {fiats.map((cf, i) => (
          <ModalSelector
            key={Math.random()}
            data={allFiats}
            initValue={cf.label}
            style={{ marginHorizontal: 8, flex: 1 }}
            onChange={fiat => {
              const cf2 = [...fiats];

              cf2[i] = fiat;

              setFiats(cf2);
            }}
          />
        ))}
      </View>

      <Button onPress={saveFiats}>
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
