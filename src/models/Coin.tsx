export default class Coin {
  pairAvailable = true;
  name: string;
  market: string;
  last: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  volume = 0;
  baseVolume = 0;
  change = 0;
  spread = 0;

  favorite = false;

  constructor(name: string, market: string, last = 0, bid = 0, ask = 0, high = 0, low = 0) {
    this.name = name;
    this.market = market;
    this.last = last;
    this.bid = bid;
    this.ask = ask;
    this.high = high;
    this.low = low;
  }

  toggleFavorite() {
    this.favorite = !this.favorite;
  }
}
