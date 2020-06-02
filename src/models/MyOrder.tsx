import { cancelOrder } from '../controllers/Bittrex';

export default class MyOrder {
  canceling = false;
  id = '';
  type = '';
  coin = '';
  market = '';
  quantity = 0.0;
  price = 0.0;
  total = 0.0;
  closedAt = '';
  openedAt = '';

  constructor(
    id: string,
    type: string,
    coin: string,
    market: string,
    quantity: number,
    price: number,
    openedAt: string,
    closedAt: string,
  ) {
    this.id = id;
    this.type = type;
    this.coin = coin;
    this.market = market;
    this.quantity = quantity;
    this.price = price;
    this.closedAt = closedAt;
    this.openedAt = openedAt;

    this.total = price * quantity;
  }

  isBuy() {
    return this.type.toLowerCase() === 'buy';
  }

  toJson() {
    return {
      id: this.id,
      type: this.type,
      coin: this.coin,
      market: this.market,
      quantity: this.quantity,
      price: this.price,
    };
  }

  async cancel() {
    await cancelOrder(this);
  }
}
