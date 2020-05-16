export default class ChartData {
  high = 0.0;
  low = 0.0;
  open = 0.0;
  close = 0.0;
  volume = 0.0;
  baseVolume = 0.0;

  constructor(
    high: number,
    low: number,
    open: number,
    close: number,
    volume: number,
    baseVolume: number,
  ) {
    this.high = high;
    this.low = low;
    this.open = open;
    this.close = close;
    this.volume = volume;
    this.baseVolume = baseVolume;
  }
}
