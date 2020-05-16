export default class Order {
  quantity = 0;
  rate = 0;
  total = 0;
  totalTotal = 0;
  quantityTotal = 0;

  isMine = false;

  constructor(quantity, rate, total, totalTotal, quantityTotal) {
    this.quantity = quantity;
    this.rate = rate;
    this.total = total;
    this.totalTotal = totalTotal;
    this.quantityTotal = quantityTotal;

    this.isMine = false;
  }
}
