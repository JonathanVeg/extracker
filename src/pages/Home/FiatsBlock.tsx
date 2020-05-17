import React from 'react';
import { View } from 'react-native';
import { H1 } from '../../components/Hs';
import FiatBlock from '../../components/FiatBlock';
import Fiat from '../../controllers/fiats/Fiat';

interface FiatsBlockProps {
  market: string;
  fiats: Fiat[];
  allCoinsInBtc: object;
}

export default function FiatsBlock(props: FiatsBlockProps) {
  const { market, fiats, allCoinsInBtc } = props;

  return (
    <View>
      <H1>{market}</H1>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {fiats
          .filter(it => it.data)
          .map(it => (
            <FiatBlock
              fiat={it}
              key={`total_${it.name}`}
              amount={allCoinsInBtc[market]}
            />
          ))}
      </View>
    </View>
  );
}
