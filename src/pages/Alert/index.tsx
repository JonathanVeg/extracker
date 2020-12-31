/* eslint-disable no-await-in-loop */
import IconFA from 'react-native-vector-icons/FontAwesome';
import RNPickerSelect from 'react-native-picker-select';
import React, { useEffect, useState } from 'react';
import { Alert as RNAlert, View, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { default as FA } from 'react-native-vector-icons/FontAwesome5';
import { Row } from '../../components/Generics';
import HamburgerIcon from '../../components/HamburgerIcon';
import { H1, H2 } from '../../components/Hs';
import { Spacer } from '../../components/Spacer';
import Alert from '../../models/Alert';
import MyInput from '../../components/MyInput';
import MyText from '../../components/MyText';
import AlertsAPI from '../../controllers/Alerts';
import { readOneSignalUserId } from '../../controllers/OneSignal';
import { useToast } from '../../hooks/ToastContext';
import CoinSelector from '../../components/CoinSelector';
import { useExchange } from '../../hooks/ExchangeContext';
import { colors } from '../../style/globals';
import MyCheckbox from '../../components/MyCheckbox';
import LabelValueBlock from '../../components/LabelValueBlock';
import Coin from '../../models/Coin';
import { useSummaries } from '../../hooks/SummaryContext';

const AlertPage = ({ navigation, coinDefault, marketDefault }) => {
  const [selecteds, setSelecteds] = useState<Alert[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();
  const { exchange } = useExchange();

  const [price, setPrice] = useState<string>('0.0');
  const [coin, setCoin] = useState<string>(coinDefault || 'DCR');
  const [market, setMarket] = useState<string>(marketDefault || 'BTC');
  const [when, setWhen] = useState<string>('GT');

  const [coinObject, setCoinObject] = useState<Coin>(new Coin("DCR", "BTC"));

  async function load() {
    try {
      const newCoin = new Coin(coin, market);
      await exchange.loadSummary(newCoin);

      setCoinObject(newCoin);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, [coin, market]);
  
  navigation?.setOptions({
    title: 'Alerts',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
    headerRight: () => (
      <TouchableOpacity style={{ flex: 1 }} onPress={deleteAllAlerts}>
        <Icon name="delete" size={25} style={{ marginEnd: 10 }} />
      </TouchableOpacity>
    ),
  });

  const handleSelectItem = (item: Alert) => {
    const exists = selecteds.filter(it => it.id === item.id).length > 0;
    const newSelecteds = !exists ? [...selecteds, item] : selecteds.filter(it => it.id !== item.id);
    setSelecteds(newSelecteds);
  };

  const handleSelectAll = () => {
    setSelecteds(selecteds.length === alerts.length ? [] : [...alerts]);
  };

  async function handleCancelSeveralAlerts() {
    async function run() {
      AlertsAPI.deleteSeveralAlerts(selecteds, uid).then(() => {
        readAlerts(false);
      });
    }

    if (selecteds.length === 0) return;

    const uid = await readOneSignalUserId();

    RNAlert.alert(
      'Delete several alerts',
      `Do you want to delete all ${selecteds.length} selected alerts`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: run,
        },
      ],
      { cancelable: true },
    );
  }

  async function readAlerts(showRefreshing = true) {
    try {
      if (showRefreshing) setRefreshing(true);

      const uid = await readOneSignalUserId();
      const alerts = await AlertsAPI.getAlerts(exchange, uid);

      setAlerts(alerts);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCreateAlert() {
    try {
      if (parseFloat(price) === 0.0 || isNaN(parseFloat(price))) {
        showToast({ text: 'Please fill the price', type: 'error' });

        return;
      }

      setSaving(true);

      const newAlert = new Alert(`${Math.random()}`, coin, market, when, parseFloat(price));

      await AlertsAPI.createAlert(exchange, newAlert);

      readAlerts(false);
    } catch (err) {
      showToast({ text: 'Error while creating alert', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function toggleAlertActive(alert: Alert) {
    const uid = await readOneSignalUserId();

    await AlertsAPI.toggleAlertStatus(alert, uid);

    readAlerts(false);
  }

  async function deleteAllAlerts() {
    async function run() {
      const uid = await readOneSignalUserId();

      for (let i = 0; i < alerts.length; i++) {
        const alert = alerts[i];

        await AlertsAPI.deleteAlert(alert, uid);
      }

      readAlerts(false);
    }

    RNAlert.alert(
      'Delete all alerts',
      'Do you want to delete all alerts',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: run,
        },
      ],
      { cancelable: true },
    );
  }

  useEffect(() => {
    setSelecteds([]);
    readAlerts();
  }, []);

  const summaryBlock = (
    <>
      <H1>
        {`SUMMARY - ${coinObject.name}/${coinObject.market}`}
        {refreshing ? '(loading...)' : ''}
        {!coinObject.pairAvailable && ' (Pair unavailable)'}
      </H1>
      <Spacer margin={2} />
      <TouchableOpacity onPress={() => setPrice(coinObject.last.idealDecimalPlaces())}>
        <LabelValueBlock style={{ paddingBottom: 4, paddingTop: 4 }} label="Last" value={coinObject.last} adjustDecimals />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPrice(coinObject.bid.idealDecimalPlaces())}>
        <LabelValueBlock style={{ paddingBottom: 4, paddingTop: 4 }} label="Bid" value={coinObject.bid} adjustDecimals />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPrice(coinObject.ask.idealDecimalPlaces())}>
        <LabelValueBlock style={{ paddingBottom: 4, paddingTop: 4 }} label="Ask" value={coinObject.ask} adjustDecimals />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPrice(coinObject.high.idealDecimalPlaces())}>
        <LabelValueBlock
          style={{ paddingBottom: 4, paddingTop: 4 }}
          label="24h highest"
          value={coinObject.high}
          adjustDecimals
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setPrice(coinObject.low.idealDecimalPlaces())}>
        <LabelValueBlock
          style={{ paddingBottom: 4, paddingTop: 4 }}
          label="24h lowest"
          value={coinObject.low}
          adjustDecimals
        />
      </TouchableOpacity>

      <Text>+10</Text>
      <Text>+20</Text>
    </>
  );

  const inputs = (
    <View>
      <H2>{`Alert me when the pair ${coin}/${market} gets`}</H2>

      <RNPickerSelect
        placeholder={{
          label: 'Select when',
        }}
        value={when}
        itemKey={when}
        style={pickerStyle}
        Icon={() => {
          return <IconFA name="chevron-down" size={17} color={colors.gray} />;
        }}
        onValueChange={value => setWhen(value)}
        items={[
          { key: 'GT', label: 'Greater than', value: 'GT' },
          { key: 'LT', label: 'Lower than', value: 'LT' },
        ]}
      />

      <H2>Price</H2>
      <MyInput placeholder="price" value={price} onChangeText={setPrice} />

      <TouchableOpacity onPress={handleCreateAlert}>
        <H2 center>{saving ? 'Saving...' : 'Save'}</H2>
      </TouchableOpacity>
      <Spacer />
    </View>
  );

  const renderItem = ({ item }) => {
    const alert: Alert = item;

    return (
      <Row key={alert.id} style={{ justifyContent: 'space-between' }}>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            if (!saving) toggleAlertActive(item);
          }}
        >
          <Icon name={alert.active ? 'bell' : 'bell-off'} size={20} />
        </TouchableOpacity>
        <MyText style={{ flex: 4 }}>{`${alert.coin}/${alert.market}`}</MyText>
        <MyText style={{ flex: 1 }}>{alert.condition}</MyText>
        <MyText style={{ flex: 4, fontVariant: ['tabular-nums'] }}>
          {parseFloat(alert.price).idealDecimalPlaces()}
        </MyText>

        <MyCheckbox checked={selecteds.indexOf(item) !== -1} onPress={() => handleSelectItem(alert)} />
      </Row>
    );
  };

  return (
    <View style={{ paddingHorizontal: 10, flex: 1 }}>
      <CoinSelector sMarket={market} sCoin={coin} setSMarket={setMarket} setSCoin={setCoin} />
      {summaryBlock}
      {inputs}
      {alerts.length > 0 ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginEnd: 5 }}>
              <MyCheckbox checked={selecteds.length === alerts.length} onPress={handleSelectAll} label="Select all" />
            </View>

            <TouchableOpacity onPress={handleCancelSeveralAlerts}>
              <FA
                name="trash-alt"
                size={20}
                color={selecteds.length === 0 ? 'transparent' : colors.black}
                style={{ marginEnd: 5 }}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            onRefresh={readAlerts}
            refreshing={refreshing}
            style={{ alignSelf: 'stretch', margin: 8, flex: 1 }}
            data={alerts}
            keyExtractor={it => it.id}
            renderItem={renderItem}
          />
        </>
      ) : (
        <MyText style={{ width: '100%', textAlign: 'center' }}>No alerts yet</MyText>
      )}
    </View>
  );
};

export default AlertPage;

const pickerStyle = {
  iconContainer: {
    borderColor: colors.red,
    borderRadius: 1,
    top: 10,
    right: 0,
  },

  inputIOS: {
    color: colors.gray,
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 12,
    paddingBottom: 10,
  },
  inputAndroid: {
    color: colors.gray,
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 12,
    paddingBottom: 10,
  },
};
