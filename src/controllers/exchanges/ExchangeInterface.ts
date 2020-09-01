import MyCoin from '../../models/MyCoin';
import Coin from '../../models/Coin';
import Order from '../../models/Order';
import MyOrder from '../../models/MyOrder';
import ChartData from '../../models/ChartData';
import OrderHistory from '../../models/OrderHistory';

export default interface ExchangeInterface {
  name(): string;
  loadMarketSummaries(): Promise<[Coin[], string[]]>;
  loadOrderBook(coin: Coin, type: string): Promise<Order[]>;
  loadSummary(coin: Coin): Promise<Coin>;
  loadMarketHistory(coin: Coin): Promise<OrderHistory[]>;
  loadCandleChartData(coin: Coin, chartCandle: string, chartZoom: number): Promise<ChartData[]>;
  cancelOrder(order: MyOrder): Promise<void>;
  loadBalances(includeZeros: boolean): Promise<MyCoin[]>;
  loadBalance(currency: string): Promise<MyCoin | null>;
  loadClosedOrders(coin: Coin): Promise<MyOrder[]>;
  loadMyOrders(coin: Coin): Promise<MyOrder[]>;
  execOrder(type: string, market: string, coin: string, quantity: number, price: number): Promise<object>;
}
