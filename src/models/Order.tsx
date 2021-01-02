import Alert from './Alert';
import MyOrder from './MyOrder';

export default class Order {
  isMine = false;
  myOrder: MyOrder | null = null;
  alerts: Alert[] = [];

  percentFromBase = 100;

  constructor(
    public coin: string,
    public market: string,
    public quantity: number,
    public rate: number,
    public total: number,
    public totalTotal: number,
    public quantityTotal: number,
    public type: string,
  ) {
    this.isMine = false;
  }

  isSell() {
    return this.type.toLowerCase() === 'sell';
  }

  isBuy() {
    return this.type.toLowerCase() === 'buy';
  }
}
