import ModalSelector from 'react-native-modal-selector';
import { CandleStickChart } from 'react-native-charts-wrapper';
import React, { useEffect, useState } from 'react';
import { View, Text, processColor } from 'react-native';
import { colors } from '../../style/globals';
import Coin from '../../models/Coin';
import StorageUtils from '../../utils/StorageUtils';
import { Container } from '../../components/Generics';
import { H2 } from '../../components/Hs';
import { useExchange } from '../../hooks/ExchangeContext';

export default function CoinPageChart({ coin: pCoin, showControllers = true }) {
  const { exchange } = useExchange();
  const coin: Coin = pCoin || new Coin('DCR', 'BTC');
  // const [coin, setCoin] = useState<Coin>(props.coin || new Coin('DCR', 'BTC'));
  const [zoom, setZoom] = useState(exchange.candleChartData().zoom[2]);
  const [candle, setCandle] = useState(exchange.candleChartData().candle[2]);
  const [values, setValues] = useState([]);

  async function load() {
    const data = await exchange.loadCandleChartData(coin, candle.value.toString(), parseFloat(zoom.value));

    setValues(prepareChartData(data));
  }

  function refresh() {
    load();
  }

  useEffect(() => {
    load();

    StorageUtils.setItem(`@extracker@${exchange.name}:chartZoom`, JSON.stringify(zoom));
    StorageUtils.setItem(`@extracker@${exchange.name}:chartCandle`, JSON.stringify(candle));
  }, [zoom, candle]);

  useEffect(() => {
    async function readChartDefaults() {
      const chartZoom = await StorageUtils.getItem(`@extracker@${exchange.name}:chartZoom`);
      const chartCandle = await StorageUtils.getItem(`@extracker@${exchange.name}:chartCandle`);

      if (chartZoom) setZoom(JSON.parse(chartZoom));
      if (chartCandle) setCandle(JSON.parse(chartCandle));
    }

    readChartDefaults();
  }, []);

  useEffect(() => {
    refresh();
  }, [pCoin]);

  function prepareChartData(chartData) {
    const values = [];

    chartData.map(data => {
      values.push({
        shadowH: data.high,
        shadowL: data.low,
        open: data.open,
        close: data.close,
        marker: `H: ${data.high.toFixed(8)}.\nL: ${data.low.toFixed(8)}.\nO: ${data.open.toFixed(
          8,
        )}.\nC: ${data.close.toFixed(8)}.\nV: ${data.baseVolume.toFixed(8)} ${coin.market}.`,
      });
    });

    return values;
  }

  const candleChart = {
    legend: { enabled: false },
    data: {
      dataSets: [
        {
          values,
          label: `${coin.name} - ${coin.market}`,
          config: {
            highlightColor: processColor('darkgray'),
            shadowColor: processColor('black'),
            shadowWidth: 1,
            drawValues: false,
            shadowColorSameAsCandle: false,
            increasingColor: processColor(colors.chartUp),
            increasingPaintStyle: 'FILL',
            decreasingColor: processColor(colors.chartDown),
            neutralColor: processColor(colors.dark),
          },
        },
      ],
    },
  };

  const chart = (
    <CandleStickChart
      dragEnabled
      pinchZoom
      logEnabled={false}
      yAxis={{ right: { enabled: false } }}
      scaleYEnabled={false}
      chartDescription={{ text: '' }}
      marker={{
        enabled: true,
        markerColor: processColor('#2c3e50'),
        textColor: processColor(colors.white),
      }}
      style={{ flex: 1 }}
      data={candleChart.data}
      animation={{ durationX: 500 }}
      legend={candleChart.legend}
      gridBackgroundColor={processColor(colors.white)}
      drawBarShadow={false}
      drawValueAboveBar
      drawHighlightArrow
    />
  );

  const selectors = (
    <View style={{ flexDirection: 'row', marginVertical: 8 }}>
      <View style={{ flexDirection: 'column', marginVertical: 8, flex: 1 }}>
        <Text style={{ alignSelf: 'stretch', textAlign: 'center' }}>Zoom</Text>
        <ModalSelector
          key={Math.random()}
          data={exchange.candleChartData().zoom}
          initValue={zoom.label}
          style={{ marginHorizontal: 8, alignSelf: 'stretch' }}
          onChange={item => {
            setZoom(item);
          }}
        />
      </View>

      <View style={{ flexDirection: 'column', marginVertical: 8, flex: 1 }}>
        <Text style={{ alignSelf: 'stretch', textAlign: 'center' }}>Candle</Text>
        <ModalSelector
          key={Math.random()}
          data={exchange.candleChartData().candle}
          initValue={candle.label}
          style={{ marginHorizontal: 8, alignSelf: 'stretch' }}
          onChange={item => {
            setCandle(item);
          }}
        />
      </View>
    </View>
  );

  return (
    <Container>
      {!showControllers && (
        <View>
          <H2 center>{`${coin.name}/${coin.market} - ${candle.label}/${zoom.label}`}</H2>
        </View>
      )}
      {showControllers && selectors}

      {values.length > 0 && chart}
    </Container>
  );
}
