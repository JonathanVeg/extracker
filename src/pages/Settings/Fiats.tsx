import ModalSelector from 'react-native-modal-selector';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { StyleSheet, Alert, View } from 'react-native';
import { useFiats } from '../../hooks/FiatContext';
import { H1 } from '../../components/Hs';
import { colors } from '../../style/globals';
import StorageUtils from '../../utils/StorageUtils';
import Fiat from '../../controllers/fiats/Fiat';
import allFiats from '../../controllers/fiats/ListFiats';
import listFiats from '../../controllers/fiats/FiatsHelper';
import { useToast } from '../../hooks/ToastContext';
import MyText from '../../components/MyText';

export default function Fiats() {
  const [fiats, setFiats] = useState<Fiat[]>([]);
  const { reloadFiats } = useFiats();

  const { showToast } = useToast();

  async function loadFiats() {
    const fiats = await listFiats();
    setFiats(fiats);
  }

  useEffect(() => {
    loadFiats();
  }, []);

  async function saveFiats() {
    await StorageUtils.setItem('@extracker:fiats', fiats.map(it => it.label).join(','));

    reloadFiats();

    showToast({ text: 'New fiats saved', type: 'success' });
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
        <MyText>SALVAR</MyText>
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
