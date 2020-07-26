const AlertConditions = ['GT', 'LT'];

export default class Alert {
  id: string;
  coin: string;
  market: string;
  condition: string;
  price: number;
  active: boolean = true;

  constructor(id: string, coin: string, market: string, condition: string, price: number, active = true) {
    this.id = id;
    this.coin = coin;
    this.market = market;
    this.condition = condition;
    this.price = price;
    this.active = active;
  }

  toJSON() {
    return { coin: this.coin, market: this.market, condition: this.condition, price: this.price };
  }
}
