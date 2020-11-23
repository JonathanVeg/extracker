import querystring from 'querystring';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import Axios from 'axios';
import MyCoin from '../../models/MyCoin';
import Coin from '../../models/Coin';
import Order from '../../models/Order';
import MyOrder from '../../models/MyOrder';
import OrderHistory from '../../models/OrderHistory';
import ChartData from '../../models/ChartData';
import { sign, nonce } from './utils';
import ExchangeInterface, { CandleChartData, CandleChartDataItem } from './ExchangeInterface';
import StorageUtils from '../../utils/StorageUtils';

class Poloniex implements ExchangeInterface {
  baseURL = 'https://poloniex.com/public';
  baseTradingURL = 'https://poloniex.com/tradingApi';
  name = 'Poloniex';

  async prepareHeaders(params: object) {
    const s = await StorageUtils.getKeys(this);
    const { key } = s;
    const { secret } = s;

    const postData = Object.keys(params)
      .map(param => `${encodeURIComponent(param)}=${encodeURIComponent(params[param])}`)
      .join('&');

    return {
      Key: key,
      Sign: sign(postData, secret),
      'Content-Type': 'application/x-www-form-urlencoded',
    };
  }

  async loadMarketSummaries(): Promise<[Coin[], string[]]> {
    try {
      const url = `${this.baseURL}?command=returnTicker`;

      const response = await Axios.get(url);
      const json = response.data;
      const pairs = Object.keys(json);

      const listMarkets = [];
      const listCoins = [];
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const data = json[pair];
        const market = pair.split('_')[0];
        const name = pair.split('_')[1];
        const coin = new Coin(name, market);

        coin.last = data.last;
        coin.bid = data.highestBid;
        coin.ask = data.lowestAsk;
        coin.high = data.high24hr;
        coin.low = data.low24hr;
        coin.volume = data.quoteVolume;
        coin.baseVolume = data.baseVolume;
        coin.change = parseFloat(data.percentChange) * 100;

        listCoins.push(coin);
        if (listMarkets.indexOf(market) === -1) listMarkets.push(market);
      }

      await AsyncStorage.setItem('@extracker@Poloniex:coins', JSON.stringify(listCoins));
      await AsyncStorage.setItem('@extracker@Poloniex:markets', JSON.stringify(listMarkets));

      return [listCoins, listMarkets];
    } catch (err) {
      return [[], []];
    }
  }

  async loadOrderBook(coin: Coin, type: string): Promise<Order[]> {
    const url = `${this.baseURL}?command=returnOrderBook&currencyPair=${coin.market}_${coin.name}&depth=100`;
    const response = await Axios.get(url);
    const json = response.data;

    const data = type === 'buy' ? json.bids : json.asks;

    let quantity = 0.0;
    let total = 0.0;

    return data.map(it => {
      quantity += parseFloat(it[1]);
      total += parseFloat(it[0]) * parseFloat(it[1]);

      return new Order(coin.name, coin.market, it[1], it[0], it[0] * it[1], total, quantity, type);
    });
  }

  async loadSummary(coin: Coin): Promise<Coin> {
    const [coins] = await this.loadMarketSummaries();

    const data = coins.find(it => it.market === coin.market && it.name === coin.name);

    coin.last = data.last;
    coin.bid = data.bid;
    coin.ask = data.ask;
    coin.high = data.high;
    coin.low = data.low;
    coin.volume = data.volume;
    coin.baseVolume = data.baseVolume;
    coin.change = data.change;
    return coin;
  }

  async loadMarketHistory(coin: Coin): Promise<OrderHistory[]> {
    const url = `${
      this.baseURL
    }?command=returnTradeHistory&currencyPair=${coin.market.toUpperCase()}_${coin.name.toUpperCase()}`;

    const response = await Axios.get(url);

    const json = await response.data;

    return json.map(it => new OrderHistory(it.amount, it.rate, it.total, it.type.toLowerCase(), it.date));
  }

  async loadCandleChartData(coin: Coin, chartCandle = `${30 * 60}`, chartZoom = 0): Promise<ChartData[]> {
    const end = moment().unix();
    const start = end - chartZoom * 60 * 60;

    const url = `${
      this.baseURL
    }?command=returnChartData&currencyPair=${coin.market.toUpperCase()}_${coin.name.toUpperCase()}&start=${start}&end=${end}&period=${chartCandle}`;
    const response = await Axios.get(url);

    const data = await response.data;

    const ret: ChartData[] = [];

    for (let i = 0; i < data.length; i++) {
      const it = data[i];

      ret.push(new ChartData(it.high, it.low, it.open, it.close, it.quoteVolume, it.volume));
    }

    return ret;
  }

  candleChartData(): CandleChartData {
    const zoomItems = [
      { label: '3h', value: (3).toString() },
      { label: '6h', value: (6).toString() },
      { label: '24h', value: (24).toString() },
      { label: '2d', value: (24 * 2).toString() },
      { label: '1w', value: (24 * 7).toString() },
      { label: '2w', value: (24 * 7 * 2).toString() },
      { label: '1m', value: (24 * 30).toString() },
    ];

    const candleItems: CandleChartDataItem = [300, 900, 1800, 7200, 14400, 86400].map(sec =>
      sec / 60 < 60 ? { label: `${sec / 60} min`, value: sec } : { label: `${sec / 60 / 60} h`, value: sec },
    );

    return { zoom: zoomItems, candle: candleItems };
  }

  async cancelOrder(order: MyOrder): Promise<void> {
    const url = `${this.baseTradingURL}`;
    const aNonce = nonce();

    const params = {
      command: 'cancelOrder',
      nonce: aNonce,
      orderNumber: `${order.id}`,
    };

    const headers = await this.prepareHeaders(params);
    const options = { headers };

    await Axios.post(url, querystring.stringify(params), options);
  }

  async loadBalances(includeZeros = false): Promise<MyCoin[]> {
    const url = `${this.baseTradingURL}`;
    const aNonce = nonce();

    const params = {
      command: 'returnCompleteBalances',
      nonce: aNonce,
    };

    const headers = await this.prepareHeaders(params);
    const options = { headers };

    const ret: MyCoin[] = [];

    try {
      const { data } = await Axios.post(url, querystring.stringify(params), options).catch(error => { 
        console.error("====")
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
        console.error("====")
      });

      const dataToReturn = includeZeros
        ? data
        : Object.keys(data).filter(it => parseFloat(data[it].available) + parseFloat(data[it].onOrders) !== 0.0);

      for (let i = 0; i < dataToReturn.length; i++) {
        const coin = dataToReturn[i];

        // TODO load deposit address
        ret.push(
          new MyCoin(
            coin,
            parseFloat(data[coin].available) + parseFloat(data[coin].onOrders),
            data[coin].available,
            0,
            '---',
          ),
        );
      }
      return ret;
    } catch (err) {
      console.error("error", err.response)
      return [];
    }
  }

  async loadBalance(currency: string): Promise<MyCoin | null> {
    const balances = await this.loadBalances();

    const ret = balances.find(it => it.name === currency);

    return ret;
  }

  async loadClosedOrders(coin: Coin = null): Promise<MyOrder[]> {
    const url = `${this.baseTradingURL}`;
    const aNonce = nonce();

    const params = {
      command: 'returnTradeHistory',
      nonce: aNonce,
      currencyPair: 'all',
    };

    const headers = await this.prepareHeaders(params);
    const options = { headers };

    const { data } = await Axios.post(url, querystring.stringify(params), options);

    const ret: MyOrder[] = [];

    let pairs = Object.keys(data);

    if (coin) pairs = pairs.filter(it => it.toLowerCase() === `${coin.market}_${coin.name}`.toLowerCase());

    for (let i = 0; i < pairs.length; i++) {
      const pair = data[pairs[i]];

      for (let j = 0; j < pair.length; j++) {
        const order = pair[j];

        ret.push(
          new MyOrder(
            order.globalTradeID,
            order.type,
            pairs[i].split('_')[1],
            pairs[i].split('_')[0],
            parseFloat(order.amount),
            0,
            parseFloat(order.rate),
            order.date,
            order.date,
            this,
          ),
        );
      }
    }

    return ret;
  }

  async loadMyOrders(coin: Coin = null): Promise<MyOrder[]> {
    const url = `${this.baseTradingURL}`;
    const aNonce = nonce();

    const params = {
      command: 'returnOpenOrders',
      nonce: aNonce,
      currencyPair: 'all',
    };

    const headers = await this.prepareHeaders(params);
    const options = { headers };

    const { data } = await Axios.post(url, querystring.stringify(params), options);

    const ret: MyOrder[] = [];

    let pairs = Object.keys(data);

    if (coin) pairs = pairs.filter(it => it.toLowerCase() === `${coin.market}_${coin.name}`.toLowerCase());

    for (let i = 0; i < pairs.length; i++) {
      const pair = data[pairs[i]];

      for (let j = 0; j < pair.length; j++) {
        const order = pair[j];

        ret.push(
          new MyOrder(
            order.orderNumber,
            order.type,
            pairs[i].split('_')[1],
            pairs[i].split('_')[0],
            parseFloat(order.startingAmount),
            parseFloat(order.amount),
            parseFloat(order.rate),
            order.date,
            order.date,
            this,
          ),
        );
      }
    }

    return ret;
  }

  async execOrder(type: string, market: string, coin: string, quantity: number, price: number): Promise<object> {
    const url = `${this.baseTradingURL}`;
    const aNonce = nonce();

    const params = {
      command: type.toLowerCase(),
      currencyPair: `${market}_${coin}`.toUpperCase(),
      rate: price.toString(),
      amount: quantity.toString(),
      nonce: aNonce,
    };

    const headers = await this.prepareHeaders(params);
    const options = { headers };

    try {
      await Axios.post(url, querystring.stringify(params), options);

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }
}

export default new Poloniex();
