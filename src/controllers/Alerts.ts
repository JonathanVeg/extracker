import axios from 'axios';
import Alert from '../models/Alert';
import { readOneSignalUserId } from './OneSignal';

const baseURL = 'http://localhost:3333/alerts';

export default class AlertsAPI {
  static async createAlert(alert: Alert) {
    const uid = await readOneSignalUserId();

    await axios.post(`${baseURL}`, { ...alert.toJSON(), uid });
  }

  static async getAlerts(uid: string): Promise<Alert[]> {
    const response = await axios.get(`${baseURL}?uid=${uid}`);

    return response.data;
  }

  static async toggleAlertStatus(alert: Alert, uid: string): Promise<void> {
    await axios.put(`${baseURL}/${alert.id}?uid=${uid}`);
  }

  static async deleteAlert(alert: Alert, uid: string): Promise<void> {
    await axios.delete(`${baseURL}/${alert.id}?uid=${uid}`);
  }
}
