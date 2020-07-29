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
      setSaving(true);

      const newAlert = new Alert(`${Math.random()}`, coin, market, 'GT', parseFloat(price));

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

  useEffect(() => {
    readAlerts();
  }, []);

  const [price, setPrice] = useState<string>('0.0');
  const [coin, setCoin] = useState<string>('DCR');
  const [market, setMarket] = useState<string>('BTC');

  const inputs = (
    <>
      <H2>Coin</H2>
      <MyInput value={coin} onChangeText={setCoin} />
      <H2>Market</H2>
      <MyInput value={market} onChangeText={setMarket} />
      <H2>Price</H2>
      <MyInput value={price} onChangeText={setPrice} />

      <TouchableOpacity onPress={handleCreateAlert}>
        <H2 center>{saving ? 'Saving...' : 'Save'}</H2>
      </TouchableOpacity>
      <Spacer />
    </>
  );

  const renderItem = ({ item }) => {
    const alert: Alert = item;

    return (
      <Row key={alert.id} style={{ justifyContent: 'space-between', paddingHorizontal: 10 }}>
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
      </Row>
    );
  };

  return (
    <View>
      {inputs}
      <FlatList data={alerts} keyExtractor={it => it.coin} renderItem={renderItem} />
    </View>
  );
};

export default AlertPage;
