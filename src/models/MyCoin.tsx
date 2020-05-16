export default class MyCoin {
  name: string;
  balance: number;
  available: number;
  pending: number;
  address: string;
  key = '';

  constructor(
    name: string,
    balance: number,
    available: number,
    pending: number,
    address: string,
  ) {
    this.name = name;
    this.balance = balance;
    this.available = available;
    this.pending = pending;
    this.address = address;

    this.key = `my_${name}`;
  }
}
