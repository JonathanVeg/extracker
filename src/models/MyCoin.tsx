export default class MyCoin {
  key = '';

  constructor(
    public name: string,
    public balance: number,
    public available: number,
    public pending: number,
    public address: string,
  ) {
    this.key = `my_${name}`;
  }
}
