const AlertConditions = ['GT', 'LT'];

export default class Alert {
  constructor(
    public id: string,
    public coin: string,
    public market: string,
    public condition: string,
    public price: number,
    public active = true,
  ) {}

  toJSON() {
    return { coin: this.coin, market: this.market, condition: this.condition, price: this.price };
  }
}
