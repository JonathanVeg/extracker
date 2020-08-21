import IconFA from 'react-native-vector-icons/FontAwesome';
import RNPickerSelect from 'react-native-picker-select';
import React, { useEffect, useState } from 'react';
import { Alert as RNAlert, View, Text, FlatList, TouchableOpacity } from 'react-native';
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
import Coin from '../../models/Coin';
import CoinSelector from '../../components/CoinSelector';

const AlertPage = ({ navigation }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();

  navigation?.setOptions({
    title: 'Alerts',
    headerLeft: () => <HamburgerIcon navigationProps={navigation} />,
    headerRight: () => (
      <TouchableOpacity style={{ flex: 1 }} onPress={deleteAllAlerts}>
        <Icon name="delete" size={25} style={{ marginEnd: 10 }} />
      </TouchableOpacity>
    ),
  });

  async function readAlerts(showRefreshing = true) {
    try {
      if (showRefreshing) setRefreshing(true);

      const uid = await readOneSignalUserId();
      const alerts = await AlertsAPI.getAlerts(uid);

      setAlerts(alerts);
    } finally {
      setRefreshing(false);
    }
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

  async function deleteAlert(alert: Alert) {
    const uid = await readOneSignalUserId();

    await AlertsAPI.deleteAlert(alert, uid);

    readAlerts(false);
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
      <H2>{`Alert me when the pair ${coin}/${market} gets`}</H2>

      <RNPickerSelect
        placeholder={{
          label: 'Select when',
        }}
        value={when}
        itemKey={when}
        style={pickerStyle}
        Icon={() => {
          return <IconFA name="chevron-down" size={17} color="#333" />;
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
        <Text style={{ flex: 4 }}>{`${alert.coin}/${alert.market}`}</Text>
        <Text style={{ flex: 1 }}>{alert.condition}</Text>
        <Text style={{ flex: 4, fontVariant: ['tabular-nums'] }}>{parseFloat(alert.price).idealDecimalPlaces()}</Text>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            deleteAlert(item);
          }}
        >
          <Icon name="delete" size={20} />
        </TouchableOpacity>
      </Row>
    );
  };

  return (
    <View style={{ paddingHorizontal: 10, flex: 1 }}>
      <CoinSelector sMarket="BTC" sCoin="DCR" setSMarket={setMarket} setSCoin={setCoin} />
      {inputs}
      {alerts.length > 0 ? (
        <FlatList
          onRefresh={readAlerts}
          refreshing={refreshing}
          style={{ alignSelf: 'stretch', margin: 8 }}
          data={alerts}
          keyExtractor={it => it.coin}
          renderItem={renderItem}
        />
      ) : (
        <Text>No alerts yet</Text>
      )}
    </View>
  );
};

export default AlertPage;

const pickerStyle = {
  iconContainer: {
    borderColor: 'red',
    borderRadius: 1,
    top: 10,
    right: 0,
  },

  inputIOS: {
    color: '#333',
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 12,
    paddingBottom: 10,
  },
  inputAndroid: {
    color: '#333',
    fontSize: 16,
    paddingLeft: 10,
    paddingTop: 12,
    paddingBottom: 10,
  },
};
