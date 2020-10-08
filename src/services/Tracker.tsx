import { AMPLITUDE_KEY } from 'react-native-dotenv';
import RNAmplitute from 'react-native-amplitude-analytics';
import { Platform } from 'react-native';
import StorageUtils from '../utils/StorageUtils';
import DeviceInfo from 'react-native-device-info';

export default class Tracker {
  static amplitude: RNAmplitute;
  static init() {
    this.amplitude = new RNAmplitute(AMPLITUDE_KEY);
  }

  static async identifyUser() {
    this.amplitude = this.amplitude || new RNAmplitute(AMPLITUDE_KEY);

    const oneSignalUserId = await StorageUtils.getItem('@extracker:OneSignalUserId');

    const di = DeviceInfo;

    if (oneSignalUserId) {
      const a = this.amplitude;
      const manufacturer = await DeviceInfo.getManufacturer();
      const brand = di.getBrand();
      const buildNumber = di.getBuildNumber();

      const userProperties = {
        oneSignalId: oneSignalUserId,
        buildNumber,
        device: { manufacturer: manufacturer, brand },
      };

      a.setDeviceId(DeviceInfo.getUniqueId());
      a.setUserId(oneSignalUserId);
      a.setUserProperties(userProperties);
    }
  }

  static trackEvent(eventName, properties = {}) {
    try {
      if (!this.amplitude) this.amplitude = new RNAmplitute(AMPLITUDE_KEY);

      const eventParams = { Plataforma: Platform.OS, ...properties };

      console.log('Tracking event:', eventName, eventParams);

      this.amplitude.logEvent(eventName, eventParams);
    } catch (err) {
      console.error('Error logging event:', err.toString());
    }
  }
}
