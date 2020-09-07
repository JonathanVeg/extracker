/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-param-reassign */
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import MyCoin from '../../models/MyCoin';
import Coin from '../../models/Coin';
import Order from '../../models/Order';
import MyOrder from '../../models/MyOrder';
import OrderHistory from '../../models/OrderHistory';
import ChartData from '../../models/ChartData';
import StorageUtils from '../../utils/StorageUtils';
import { sign, nonce } from './utils';
import ExchangeInterface from './ExchangeInterface';

class Bittrex implements ExchangeInterface {
  baseURL = 'https://bittrex.com';
  name = 'Bittrex';
  key = '';
  secret = '';

  async loadKeys() {
    const { key, secret } = await StorageUtils.getKeys();

    this.key = key;
    this.secret = secret;
  }

  async prepareOptions(url: string) {
    const headers = { apisign: '' };

    headers.apisign = sign(url, this.secret);

    return { headers };
  }

  coinToPair(coin: Coin) {
    return `${coin.market}-${coin.name}`.toLowerCase();
  }

  async loadBalances(includeZeros = false): Promise<MyCoin[]> {
    try {
      if (!this.key) await this.loadKeys();
      const url = `${this.baseURL}/api/v1.1/account/getbalances?apikey=${this.key}&nonce=${nonce()}`;
      const headers = await this.prepareOptions(url);
      const response = await axios.get(url, headers);

      const data = await response.data;

      if (!data.success) return [];

      let coins = data.result;

      if (!includeZeros) coins = coins.filter(coin => coin.Balance > 0.00000001 || coin.Pending > 0);

      return coins.map(
        coin => new MyCoin(coin.Currency, coin.Balance, coin.Available, coin.Pending, coin.CryptoAddress),
      );
    } catch (err) {
      return [];
    }
  }

  async loadBalance(currency: string): Promise<MyCoin | null> {
    try {
      const url = `${this.baseURL}/api/v1.1/account/getbalance?currency=${currency}&apikey=${
        this.key
      }&nonce=${nonce()}`;

      const headers = await this.prepareOptions(url);
      const response = await axios.get(url, headers);

      const data = await response.data;

      if (!data.success) return null;

      const coin = data.result;

      return new MyCoin(coin.Currency, coin.Balance, coin.Available, coin.Pending, coin.CryptoAddress);
    } catch (err) {
      return null;
    }
  }

  async loadClosedOrders(coin: Coin = null): Promise<MyOrder[]> {
    let orders: MyOrder[] = [];

    try {
      if (!this.key) await this.loadKeys();
      const url = `${this.baseURL}/api/v1.1/account/getorderhistory?apikey=${this.key}&nonce=${nonce()}`;
      const headers = await this.prepareOptions(url);
      const response = await axios.get(url, headers);

      const data = await response.data;

      data.result.map(it =>
        orders.push(
          new MyOrder(
            it.OrderUuid,
            it.OrderType.split('_')[1].toLowerCase(),
            it.Exchange.split('-')[1],
            it.Exchange.split('-')[0],
            it.Quantity,
            it.QuantityRemaining,
            it.Limit,
            it.Opened,
            it.Closed,
          ),
        ),
      );

      if (coin) {
        orders = orders.filter(
          it =>
            (it.coin === coin.name && it.market === coin.market) ||
            (it.coin === coin.market && it.market === coin.name),
        );
      }

      return orders;
    } catch (err) {
      return orders;
    }
  }

  async loadMyOrders(coin: Coin = null): Promise<MyOrder[]> {
    try {
      if (!this.key) await this.loadKeys();
      const url = `${this.baseURL}/api/v1.1/market/getopenorders?apikey=${this.key}&nonce=${nonce()}`;
      const headers = await this.prepareOptions(url);
      const response = await axios.get(url, headers);

      const data = await response.data;

      if (!data.success) {
        return [];
      }

      let orders: MyOrder[] = [];
      data.result.map(it =>
        orders.push(
          new MyOrder(
            it.OrderUuid,
            it.OrderType.split('_')[1].toLowerCase(),
            it.Exchange.split('-')[1],
            it.Exchange.split('-')[0],
            it.Quantity,
            it.QuantityRemaining,
            it.Limit,
            it.Opened,
            it.Closed,
          ),
        ),
      );

      if (coin) {
        orders = orders.filter(
          it =>
            (it.coin === coin.name && it.market === coin.market) ||
            (it.coin === coin.market && it.market === coin.name),
        );
      }

      return orders;
    } catch (err) {
      return [];
    }
  }

  async loadOrderBook(coin: Coin, type: string): Promise<Order[]> {
    const url = `${this.baseURL}/api/v1.1/public/getorderbook?market=${this.coinToPair(coin)}&type=${type}`;

    console.log(url);

    const response = await axios.get(url, { method: 'get' });

    let json = await response.data;

    json = json.result;

    let quantity = 0.0;
    let total = 0.0;

    return json.map(it => {
      quantity += it.Quantity;
      total += it.Rate * it.Quantity;

      return new Order(coin.name, coin.market, it.Quantity, it.Rate, it.Rate * it.Quantity, total, quantity, type);
    });
  }

  async loadSummary(coin: Coin): Promise<Coin> {
    const url = `${this.baseURL}/api/v1.1/public/getmarketsummary?market=${this.coinToPair(coin)}`;

    const response = await axios.get(url, { method: 'get' });

    const json = await response.data;

    if (!json.success) {
      coin.pairAvailable = false;

      return coin;
    }

    const item = await json.result[0];
    coin.ask = item.Ask;
    coin.baseVolume = item.BaseVolume;
    coin.bid = item.Bid;

    coin.spread = item.Bid && item.Bid !== 0 ? (item.Ask / item.Bid - 1) * 100 : 0;
    coin.high = item.High;
    coin.last = item.Last;
    coin.low = item.Low;
    coin.change = ((item.PrevDay - item.Last) / item.PrevDay) * -100 || 0;
    coin.volume = item.Volume;

    return coin;
  }

  async loadMarketHistory(coin: Coin) {
    const url = `${this.baseURL}/api/v1.1/public/getmarkethistory?market=${this.coinToPair(coin)}`;

    const response = await axios.get(url, { method: 'get' });

    let json = await response.data;

    json = json.result;

    return json.map(
      it => new OrderHistory(it.Quantity, it.Price, it.Price * it.Quantity, it.OrderType.toLowerCase(), it.TimeStamp),
    );
  }

  async cancelOrder(order: MyOrder) {
    const s = await StorageUtils.getKeys();
    const { key } = s;
    const { secret } = s;

    if (!this.key) await this.loadKeys();
    const url = `${this.baseURL}/api/v1.1/market/cancel?apikey=${this.key}&nonce=${nonce()}&uuid=${order.id}`;
    const headers = await this.prepareOptions(url);
    await axios.get(url, headers);
  }

  async execOrder(type, market, coin, quantity, price) {
    const s = await StorageUtils.getKeys();
    const { key } = s;
    const { secret } = s;

    const trextype = type.toLowerCase() === 'sell' ? 'selllimit' : 'buylimit';

    const url = `${this.baseURL}/api/v1.1/market/${trextype}?apikey=${
      this.key
    }&nonce=${nonce()}&market=${market.toUpperCase()}-${coin.toUpperCase()}&quantity=${quantity}&rate=${price}`;

    const headers = await this.prepareOptions(url);
    const response = await axios.get(url, headers);

    const data = await response.data;

    return data;
  }

  candleChartData() {
    const zoomItems = [
      { label: '3h', value: (3).toString() },
      { label: '6h', value: (6).toString() },
      { label: '24h', value: (24).toString() },
      { label: '2d', value: (24 * 2).toString() },
      { label: '1w', value: (24 * 7).toString() },
      { label: '2w', value: (24 * 7 * 2).toString() },
      { label: '1m', value: (24 * 30).toString() },
      { label: '2m', value: (2 * 24 * 30).toString() },
      { label: '3m', value: (3 * 24 * 30).toString() },
      { label: '6m', value: (6 * 24 * 30).toString() },
      { label: '9m', value: (9 * 24 * 30).toString() },
      { label: '12m', value: (12 * 24 * 30).toString() },
    ];

    const candleItems = [
      { label: '1 min', value: 'OneMin' },
      { label: '5 min', value: 'FiveMin' },
      { label: '30 min', value: 'ThirtyMin' },
      { label: '1 hour', value: 'Hour' },
      { label: 'Day', value: 'Day' },
    ];

    return { zoom: zoomItems, candle: candleItems };
  }

  async loadCandleChartData(coin: Coin, chartCandle = 'ThirtyMin', chartZoom = 0): Promise<ChartData[]> {
    const tickInterval = chartCandle;

    const url = `${this.baseURL}/Api/v2.0/pub/market/GetTicks?marketName=${coin.market}-${coin.name}&tickInterval=${tickInterval}`;

    const response = await axios.get(url);

    let { data } = response;

    data = data.result;

    let quantity = (24 * 60) / 30;

    if (chartZoom !== 0) {
      if (chartCandle === 'OneMin') quantity = chartZoom * 60;
      else if (chartCandle === 'FiveMin') quantity = (chartZoom * 60) / 5;
      else if (chartCandle === 'ThirtyMin') quantity = (chartZoom * 60) / 30;
      else if (chartCandle === 'Hour') quantity = chartZoom;
      else if (chartCandle === 'Day') quantity = chartZoom / 24;
    }

    const ret = [];

    for (let i = data.length - quantity; i < data.length; i++) {
      const it = data[i];

      ret.push(new ChartData(it.H, it.L, it.O, it.C, it.V, it.BV));
    }

    return ret;
  }

  async loadMarketSummaries(): Promise<[Coin[], string[]]> {
    const url = `${this.baseURL}/api/v1.1/public/getmarketsummaries`;

    const response = await axios.get(url, { method: 'get' });

    let json = await response.data;

    if (!json.success) {
      return [[], []];
    }

    json = await json.result;

    const listCoins = [];
    const listMarkets = ['BTC'];

    json.map(item => {
      const name = item.MarketName.split('-')[1];
      const market = item.MarketName.split('-')[0];

      if (listMarkets.indexOf(market) === -1) {
        listMarkets.push(market);
      }

      const coin = new Coin(name, market);

      coin.ask = item.Ask;
      coin.baseVolume = item.BaseVolume;
      coin.bid = item.Bid;
      coin.spread = (item.Ask / item.Bid - 1) * 100;
      coin.high = item.High;
      coin.last = item.Last;
      coin.low = item.Low;
      coin.change = ((item.PrevDay - item.Last) / item.PrevDay) * -100 || 0;
      coin.volume = item.Volume;

      listCoins.push(coin);
    });

    await AsyncStorage.setItem('@extracker@Bittrex:coins', JSON.stringify(listCoins));
    await AsyncStorage.setItem('@extracker@Bittrex:markets', JSON.stringify(listMarkets));

    return [listCoins, listMarkets];
  }
}

export default new Bittrex();
