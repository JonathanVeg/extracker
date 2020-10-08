import AsyncStorage from '@react-native-community/async-storage';
import * as Keychain from 'react-native-keychain';
import ExchangeInterface from '../controllers/exchanges/ExchangeInterface';
import Tracker from '../services/Tracker';

interface KeysInterface {
  key: string;
  secret: string;
}

class StorageUtils {
  static async clearKeys(): Promise<boolean> {
    const deleted = await Keychain.resetGenericPassword();

    return deleted;
  }

  static async saveKeys(exchange: ExchangeInterface, key: string, secret: string): Promise<false | Keychain.Result> {
    const r = await Keychain.setGenericPassword('@extracker:keys', `${key} ${secret}`, {
      service: `@extracker:@${exchange.name}`,
    });

    Tracker.track('saveKeys');

    return r;
  }

  static async getKeys(exchange: ExchangeInterface): Promise<KeysInterface> {
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword({ service: `@extracker:@${exchange.name}` });

      if (credentials) {
        const s = credentials.password.split(' ');

        const ret = { key: s[0], secret: s[1] };

        return ret;
      }

      return { key: '', secret: '' };
    } catch (error) {
      return { key: '', secret: '' };
    }
  }

  static async setItem(key, value): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  static async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  static async getItem(key: string): Promise<string> {
    const data = await AsyncStorage.getItem(key);

    return data;
  }
}

export default StorageUtils;
