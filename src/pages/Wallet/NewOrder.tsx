import { View, Text, Alert, RefreshControl } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { default as FA } from 'react-native-vector-icons/FontAwesome';
import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Coin from '../../models/Coin';
import MyAlert from '../../models/Alert';
import { loadBalances, loadSummary, execOrder } from '../../controllers/Bittrex';
import MyCoin from '../../models/MyCoin';
import { H1 } from '../../components/Hs';
import { Spacer } from '../../components/Spacer';
import LabelValueBlock from '../../components/LabelValueBlock';
import { PercentButton, ToggleButton, ExecOrderButton } from './NewOrderStyle';
import MyInput from '../../components/MyInput';
import { Container } from '../../components/Generics';
import { useToast } from '../../hooks/ToastContext';
import CoinSelector from '../../components/CoinSelector';
import AlertsAPI from '../../controllers/Alerts';
import Order from '../../models/Order';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export default function NewOrder({ route, navigation }) {
  function adjustHeader() {
    const headerRight = () => (
      <View style={{ marginStart: 5, flexDirection: 'row' }}>
        <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
          <FA name="exchange" size={25} style={{ marginEnd: 15 }} />
        </TouchableOpacity>
      </View>
    );

    navigation.setOptions({ title: 'Wallets', headerRight });
  }

  adjustHeader();

  const defaultCoin: Coin = (route.params || {}).coin || new Coin('DCR', 'BTC');
  const defaultRate = (route.params || {}).rate || 0;
  const defaultType = ((route.params || {}).type || '').toUpperCase();

  const { showToast } = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [coin, setCoin] = useState<Coin>(defaultCoin);
  const lastCoin = usePrevious(coin);
  const [newAlert, setNewAlert] = useState(true);

  const [myCoin, setMyCoin] = useState<MyCoin>(null);
  const [myMarket, setMyMarket] = useState<MyCoin>(null);

  const [sCoin, setSCoin] = useState(defaultCoin.name);
  const [sMarket, setSMarket] = useState(defaultCoin.market);

  // order data
  const [type, setType] = useState(defaultType || '');
  const [quantity, setQuantity] = useState('0');
  const [price, setPrice] = useState((defaultRate || 0).toString());
  const [total, setTotal] = useState('0');
  const [resume, setResume] = useState('');

  const [totalChanges, setTotalChanges] = useState('price');

  const totalChangesPrice = () => totalChanges === 'price';
  const isBuying = () => type === 'buy';
  const isTypeSelected = () => type !== '';

  useEffect(() => {
    if (lastCoin?.name !== coin.name || lastCoin?.market !== coin.market) refresh(true);
  }, [coin]);

  useEffect(() => {
    if (!!sCoin && !!sMarket && (coin.name !== sCoin || coin.market !== sMarket)) {
      setCoin(new Coin(sCoin, sMarket));
    }
  }, [sCoin, sMarket]);

  useEffect(() => {
    setTotal(calcTotal());
  }, [type]);

  useEffect(() => {
    const total = calcTotal();

    const r =
      type === 'sell'
        ? `You will ${type} ${parseFloat(quantity || '0').toFixed(8)} ${coin.name} for ${parseFloat(
            price || '0',
          ).toFixed(8)} ${coin.market} each. The total will be ${total} ${coin.market}`
        : `You will ${type} ${parseFloat(quantity || '0').toFixed(8)} ${coin.name} for ${parseFloat(
            price || '0',
          ).toFixed(8)} ${coin.market} each. The total will be ${total} ${coin.market}`;

    setResume(r);
  }, [price, quantity, type, coin.market, coin.name]);

  const calcTotal = () => {
    let total = parseFloat(quantity) * parseFloat(price);
    const fee = total * 0.002;
    total = isBuying() ? total + fee : total - fee;
    return total.toFixed(8);
  };

  function changeQuantity(quantity) {
    if (!quantity) return;
    setQuantity(quantity);
    let total = parseFloat(quantity) * parseFloat(price);
    const fee = total * 0.002;
    total = isBuying() ? total + fee : total - fee;
    setTotal(total.toFixed(8));
  }

  function changePrice(price) {
    if (!price) return;
    setPrice(price);
    let total = parseFloat(quantity) * parseFloat(price);
    const fee = total * 0.002;
    total = isBuying() ? total + fee : total - fee;
    setTotal(total.toFixed(8));
  }

  function changeTotal(total) {
    if (!total) return;
    setTotal(total);
    if (totalChangesPrice()) {
      const price = (parseFloat(total) / (parseFloat(quantity) * 1.0025)).toFixed(8);
      setPrice(price);
    } else {
      const quantity = (parseFloat(total) / (parseFloat(price) * 1.0025)).toFixed(8);
      setQuantity(quantity);
    }
  }

  async function handleCreateOrder() {
    let error = '';
    if (!type) error = `Please select if you want to buy or to sell ${coin.name}`;
    else if (parseFloat(quantity) === 0.0) error = `Please fill the quantity to ${type.toUpperCase()} ${coin.name}`;
    else if (parseFloat(price) === 0.0) error = `Please fill the price to ${type.toUpperCase()} ${coin.name}`;

    if (error) {
      showToast({ text: error, type: 'error' });

      return;
    }

    Alert.alert(
      'Create order',
      resume,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Do it!',
          onPress: () => callExecOrder(),
        },
      ],
      { cancelable: false },
    );
  }

  async function createAlert() {
    try {
      const newAlert = new MyAlert(
        `${Math.random()}`,
        coin.name,
        coin.market,
        type === 'sell' ? 'GT' : 'LT',
        parseFloat(price),
      );

      await AlertsAPI.createAlert(newAlert);

      showToast('Alert created');
    } catch (err) {
      showToast({ text: `Error while creating alert\n\n${err}`, type: 'error' });
    }
  }

  async function callExecOrder() {
    try {
      const ret = await execOrder(type, coin.market, coin.name, quantity, price);

      if (ret.success) {
        showToast('Order created');
        setTimeout(() => {
          if (newAlert) createAlert();
        }, 1000);
      } else
        showToast({
          text: 'Error while creating order',
          type: 'error',
        });
    } catch {
      Alert.alert('ERROR', 'Error while creating order');
    } finally {
      refresh(false);
    }
  }

  async function loadMyData() {
    const data = await loadBalances();

    setMyCoin(data.find(it => it.name === coin.name));
    setMyMarket(data.find(it => it.name === coin.market));
  }

  async function load(showRefreshing = true) {
    try {
      if (showRefreshing) setRefreshing(true);

      await loadSummary(coin);

      const clone = Object.assign(Object.create(Object.getPrototypeOf(coin)), coin);

      setCoin(clone);
    } finally {
      setRefreshing(false);
    }
  }

  function refresh(showRefreshing) {
    load(showRefreshing);
    loadMyData();
  }

  const newAlertBlock = (
    <TouchableOpacity onPress={() => setNewAlert(!newAlert)}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 4 }}>
        <FA name={newAlert ? 'bell' : 'bell-o'} size={25} style={{ marginEnd: 15 }} />
        <Text style={{ fontWeight: newAlert ? 'bold' : 'normal' }}>create alert</Text>
      </View>
    </TouchableOpacity>
  );

  const summaryBlock = (
    <>
      <H1>
        {`SUMMARY - ${coin.name}/${coin.market}`}
        {refreshing ? '(loading...)' : ''}
        {!coin.pairAvailable && ' (Pair unavailable)'}
      </H1>
      <Spacer margin={2} />
      <TouchableOpacity onPress={() => changePrice(coin.last.toString())}>
        <LabelValueBlock style={{ paddingBottom: 4, paddingTop: 4 }} label="Last" value={coin.last} adjustDecimals />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changePrice(coin.bid.toString())}>
        <LabelValueBlock style={{ paddingBottom: 4, paddingTop: 4 }} label="Bid" value={coin.bid} adjustDecimals />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changePrice(coin.ask.toString())}>
        <LabelValueBlock style={{ paddingBottom: 4, paddingTop: 4 }} label="Ask" value={coin.ask} adjustDecimals />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changePrice(coin.high.toString())}>
        <LabelValueBlock
          style={{ paddingBottom: 4, paddingTop: 4 }}
          label="24h highest"
          value={coin.high}
          adjustDecimals
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => changePrice(coin.low.toString())}>
        <LabelValueBlock
          style={{ paddingBottom: 4, paddingTop: 4 }}
          label="24h lowest"
          value={coin.low}
          adjustDecimals
        />
      </TouchableOpacity>
    </>
  );

  const myCoinBlock = (
    <TouchableOpacity onPress={() => changeQuantity(myCoin?.available?.toString() || '0')}>
      <LabelValueBlock
        style={{ paddingBottom: 4, paddingTop: 4 }}
        label={`${coin.name} Available`}
        value={myCoin ? myCoin.available : 0}
        adjustDecimals
      />
    </TouchableOpacity>
  );

  const myMarketBlock = (
    <TouchableOpacity
      onPress={() => {
        try {
          changeQuantity(((myMarket.available / parseFloat(price)) * 0.9975).toFixed(8));
        } catch {
          changeQuantity('0');
        }
      }}
    >
      <LabelValueBlock
        style={{ paddingBottom: 4, paddingTop: 4 }}
        label={`${coin.market} Available`}
        value={myMarket ? myMarket.available : 0}
        adjustDecimals
      />
    </TouchableOpacity>
  );

  const toggleType = (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <ToggleButton bold={isTypeSelected() && isBuying()} onPress={() => setType('buy')}>
        buy
      </ToggleButton>
      <ToggleButton bold={isTypeSelected() && !isBuying()} onPress={() => setType('sell')}>
        sell
      </ToggleButton>
    </View>
  );

  const percentChangers = (
    <>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {[1, 5, 10, 20].map(p => (
          <PercentButton more key={`+${p}`} onPress={() => changePrice((parseFloat(price) * (1 + p / 100)).toFixed(8))}>
            <Text>{`+${p}%`}</Text>
          </PercentButton>
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {[1, 5, 10, 20].map(p => (
          <PercentButton less key={`-${p}`} onPress={() => changePrice(parseFloat(price * (1 - p / 100)).toFixed(8))}>
            <Text>{`-${p}%`}</Text>
          </PercentButton>
        ))}
      </View>
    </>
  );

  const inputs = (
    <>
      <Text>{`Quantity (${((parseFloat(quantity) / (myCoin?.available || 1)) * 100).toFixed(2)}% of available)`}</Text>
      <MyInput value={quantity} onChangeText={changeQuantity} />

      <Text>{`Price (${((parseFloat(price) / coin.last) * 100).toFixed(2)}% of last price)`}</Text>
      <MyInput value={price} onChangeText={changePrice} />

      <View style={{ flexDirection: 'row' }}>
        <Text>Total</Text>
        <TouchableOpacity onPress={() => setTotalChanges('price')} style={{ marginStart: 8, marginEnd: 2 }}>
          <Text style={{ fontWeight: totalChanges === 'price' ? 'bold' : 'normal' }}>adjust price</Text>
        </TouchableOpacity>
        <Text>|</Text>
        <TouchableOpacity onPress={() => setTotalChanges('quantity')} style={{ marginStart: 2 }}>
          <Text style={{ fontWeight: totalChanges === 'quantity' ? 'bold' : 'normal' }}>adjust quantity</Text>
        </TouchableOpacity>
      </View>
      <MyInput value={total} onChangeText={changeTotal} />
    </>
  );

  return (
    <Container>
      <KeyboardAwareScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <CoinSelector sMarket={sMarket} setSMarket={setSMarket} sCoin={sCoin} setSCoin={setSCoin} />
        {summaryBlock}
        {myCoinBlock}
        {myMarketBlock}
        {inputs}
        {percentChangers}
        {toggleType}

        {newAlertBlock}
        <ExecOrderButton onPress={handleCreateOrder} buying={isBuying()}>
          <Text style={{ textAlign: 'center' }}>Create Order</Text>
        </ExecOrderButton>
        <Text>{type !== '' && resume}</Text>
      </KeyboardAwareScrollView>
    </Container>
  );
}
