import Alert from './Alert';
import MyOrder from './MyOrder';

export default class Order {
  isMine = false;
  myOrder: MyOrder | null = null;
  alerts: Alert[] = [];

  constructor(
    public coin: string,
    public marker: string,
    public quantity: number,
    public rate: number,
    public total: number,
    public totalTotal: number,
    public quantityTotal: number,
    public key: string,
  ) {
    this.isMine = false;
  }
}
