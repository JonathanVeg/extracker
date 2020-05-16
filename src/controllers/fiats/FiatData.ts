export default class FiatData {
  last: number;
  high: number;
  low: number;

  constructor(last: number, high: number, low: number) {
    this.last = last;
    this.high = high;
    this.low = low;
  }

  toString() {
    return {
      last: this.last.toFixed(4),
      high: this.high.toFixed(4),
      low: this.low.toFixed(4),
    };
  }
}
