import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Row } from '../../components/Generics';
import HamburgerIcon from '../../components/HamburgerIcon';
import { H2 } from '../../components/Hs';
import { Spacer } from '../../components/Spacer';
import Alert from '../../models/Alert';
import MyInput from '../../components/MyInput';
import AlertsAPI from '../../controllers/Alerts';
import { readOneSignalUserId } from '../../controllers/OneSignal';
import { useToast } from '../../hooks/ToastContext';

const AlertPage = ({ navigation }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  navigation.setOptions({
    title: 'Alerts',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
  });

  async function readAlerts() {
    const uid = await readOneSignalUserId();
    const alerts = await AlertsAPI.getAlerts(uid);

    setAlerts(alerts);
  }

  async function handleCreateAlert() {
    try {
      if (parseFloat(price) === 0.0) {
        showToast({ text: 'Please fill the price', type: 'error' });

        return;
      }

      setSaving(true);

      const newAlert = new Alert(`${Math.random()}`, coin, market, when, parseFloat(price));

      await AlertsAPI.createAlert(newAlert);

      readAlerts();
    } catch (err) {
      showToast({ text: 'Error while creating alert', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function toggleAlertActive(alert: Alert) {
    const uid = await readOneSignalUserId();

    await AlertsAPI.toggleAlertStatus(alert, uid);

    readAlerts();
  }

  async function deleteAlert(alert: Alert) {
    const uid = await readOneSignalUserId();

    await AlertsAPI.deleteAlert(alert, uid);

    readAlerts();
  }

  useEffect(() => {
    readAlerts();
  }, []);

  const [price, setPrice] = useState<string>('0.0');
  const [coin, setCoin] = useState<string>('DCR');
  const [market, setMarket] = useState<string>('BTC');
  const [when, setWhen] = useState<string>('GT');

  const inputs = (
    <View>
      <H2>Alert me when (coin)</H2>
      <MyInput text placeholder={'coin'} value={coin} onChangeText={setCoin} />

      <H2>in market (market)</H2>
      <MyInput text placeholder="market" value={market} onChangeText={setMarket} />

      <H2>gets (GT / LT)</H2>
      <MyInput text placeholder="gets (GT / LT)" value={when} onChangeText={setWhen} />

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
          onPress={() => {
            if (!saving) toggleAlertActive(item);
          }}
        >
          <Icon name={alert.active ? 'bell' : 'bell-off'} size={20} />
        </TouchableOpacity>
        <Text>
          {alert.coin}/{alert.market}
        </Text>
        <Text>{alert.condition}</Text>
        <Text>{parseFloat(alert.price).idealDecimalPlaces()}</Text>
        <TouchableOpacity
          onPress={() => {
            deleteAlert(item);
          }}
        >
          <Icon name={'delete'} size={20} />
        </TouchableOpacity>
      </Row>
    );
  };

  return (
    <View style={{ paddingHorizontal: 10 }}>
      {inputs}
      {alerts.length > 0 ? (
        <FlatList data={alerts} keyExtractor={it => it.coin} renderItem={renderItem} />
      ) : (
        <Text>No alerts yet</Text>
      )}
    </View>
  );
};

export default AlertPage;
