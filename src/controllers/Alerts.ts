import axios from 'axios';
import { Alert as RNAlert } from 'react-native';
import Alert from '../models/Alert';
import { readOneSignalUserId } from './OneSignal';
import exchange from './exchanges/Exchange';

const baseURL = 'https://trextracker.jonathanveg.dev/alerts';
// const baseURL = 'http://localhost:3333/alerts';

export default class AlertsAPI {
  static async createAlert(alert: Alert) {
    const uid = await readOneSignalUserId();

    if (!uid) {
      RNAlert.alert('Error while creating alert.\nPlese restart the app for loading your notification ID');

      return;
    }

    const exchangeName = exchange.name.toLowerCase();
    await axios.post(`${baseURL}`, { ...alert.toJSON(), uid, exchange: exchangeName });
  }

  static async getAlerts(uid: string): Promise<Alert[]> {
    const response = await axios.get(`${baseURL}?uid=${uid}&exchange=${exchange.name.toLowerCase()}`);

    return response.data;
  }

  static async toggleAlertStatus(alert: Alert, uid: string): Promise<void> {
    await axios.put(`${baseURL}/${alert.id}?uid=${uid}`);
  }

  static async deleteAlert(alert: Alert, uid: string): Promise<void> {
    await axios.delete(`${baseURL}/${alert.id}?uid=${uid}`);
  }
}
