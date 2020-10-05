import { AMPLITUDE_KEY } from 'react-native-dotenv';
import RNAmplitute from 'react-native-amplitude-analytics';
import { Platform } from 'react-native';

export default class Tracker {
  static amplitude: RNAmplitute;
  static init() {
    this.amplitude = new RNAmplitute(AMPLITUDE_KEY);
  }

  static identifyUser() {
    this.amplitude = this.amplitude || new RNAmplitute(AMPLITUDE_KEY);
  }

  static track(eventName, properties = {}) {
    if (!this.amplitude) this.amplitude = new RNAmplitute(AMPLITUDE_KEY);

    const eventParams = { Plataforma: Platform.OS, ...properties };

    this.amplitude.logEvent(eventName, eventParams);
  }
}
