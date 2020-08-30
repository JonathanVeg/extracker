import moment from 'moment';
import Exchange from '../controllers/exchanges/Exchange';

export default class MyOrder {
  canceling = false;
  total = 0.0;

  constructor(
    public id: string,
    public type: string,
    public coin: string,
    public market: string,
    public quantity: number,
    public quantityRemaining: number,
    public price: number,
    public openedAt: string,
    public closedAt: string,
  ) {
    this.total = price * quantity;
  }

  openedAtAgo() {
    try {
      return this.atAgo(this.openedAt);
    } catch (_) {
      return '';
    }
  }

  closedAtAgo() {
    try {
      return this.atAgo(this.closedAt);
    } catch (_) {
      return '';
    }
  }

  atAgo(what) {
    const b = what.split(/\D+/);
    const iso = new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));

    let fromNow = moment(`${iso}`).fromNow();
    fromNow = fromNow.replace('minutes', 'min(s)').replace('an', '1');

    return fromNow;
  }

  toResumeString() {
    let resume = `Pair: ${this.coin}/${this.market}\n`;
    resume += `Type: ${this.type}\n`;
    resume += `Unity price: ${this.price.idealDecimalPlaces()}\n`;
    resume += `Quantity: ${this.quantity.idealDecimalPlaces()}\n`;
    resume += `Quantity done: ${(this.quantity - this.quantityRemaining).idealDecimalPlaces()}\n`;
    resume += `Quantity remaining: ${this.quantityRemaining.idealDecimalPlaces()}\n`;
    resume += `Total: ${this.total.idealDecimalPlaces()}\n`;
    if (this.openedAtAgo()) resume += `Opened: ${this.openedAtAgo()}\n`;
    if (this.closedAtAgo()) resume += `Closed: ${this.closedAtAgo()}\n`;

    return resume;
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
    await Exchange.cancelOrder(this);
  }
}
