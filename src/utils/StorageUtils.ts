import AsyncStorage from '@react-native-community/async-storage';
import * as Keychain from 'react-native-keychain';

interface KeysInterface {
  key: string;
  secret: string;
}

class StorageUtils {
  static async clearKeys(): Promise<boolean> {
    const deleted = await Keychain.resetGenericPassword();

    return deleted;
  }

  static async saveKeys(key, secret): Promise<false | Keychain.Result> {
    const r = await Keychain.setGenericPassword(
      '@extracker:keys',
      `${key} ${secret}`,
    );

    return r;
  }

  static async getKeys(): Promise<KeysInterface> {
    try {
      // Retrieve the credentials
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        const s = credentials.password.split(' ');

        return { key: s[0], secret: s[1] };
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

  static async getItem(key): Promise<string> {
    const data = await AsyncStorage.getItem(key);

    return data;
  }
}

export default StorageUtils;
