import axios from 'axios';
import Alert from '../models/Alert';
import StorageUtils from '../utils/StorageUtils';
import { readOneSignalUserId } from './OneSignal';

const baseURL = 'http://localhost:3333/alerts';

export default class AlertsAPI {
  static async createAlert(alert: Alert) {
    const uid = await readOneSignalUserId();

    const response = await axios.post(`${baseURL}`, { ...alert.toJSON(), uid });

    const { data } = response;

    console.log(data);
  }

  static async getAlerts(uid: string): Promise<Alert[]> {
    const response = await axios.get(`${baseURL}?uid=${uid}`);

    return response.data;
  }

  static async toggleAlertStatus(alert: Alert, uid: string): Promise<void> {
    await axios.put(`${baseURL}/${alert.id}?uid=${uid}`);
  }
}
