export default class OrderHistory {
  isMine = false;

  constructor(
    public quantity: number,
    public rate: number,
    public total: number,
    public type: string,
    public timestamp: string,
  ) {}
}
