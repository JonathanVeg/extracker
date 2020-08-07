export default class Coin {
  pairAvailable = true;
  volume = 0;
  baseVolume = 0;
  change = 0;
  spread = 0;
  favorite = false;

  constructor(
    public name: string,
    public market: string,
    public last = 0,
    public bid = 0,
    public ask = 0,
    public high = 0,
    public low = 0,
  ) {}

  toggleFavorite() {
    this.favorite = !this.favorite;
  }
}
