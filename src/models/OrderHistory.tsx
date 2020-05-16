export default class OrderHistory {
  quantity = 0;
  rate = 0;
  total = 0;
  type = '';

  isMine = false;
  timestamp = '';

  constructor(quantity, rate, total, type, timestamp) {
    this.quantity = quantity;
    this.rate = rate;
    this.total = total;
    this.type = type;
    this.timestamp = timestamp;
  }
}
