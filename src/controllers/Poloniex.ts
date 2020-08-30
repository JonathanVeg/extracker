import querystring from 'querystring';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import Axios from 'axios';
import MyCoin from '../models/MyCoin';
import Coin from '../models/Coin';
import Order from '../models/Order';
import MyOrder from '../models/MyOrder';
import OrderHistory from '../models/OrderHistory';
import ChartData from '../models/ChartData';

const baseTradingURL = 'https://poloniex.com/tradingApi';

function sign(data: string, secret: string) {
  const sha512 = require('js-sha512');

  const hash = sha512.hmac.create(secret);

  hash.update(data);

  return hash.hex();
}

const nonce = () => `${new Date().getTime() * 100}`;

function prepareHeaders(params: object) {
  const secret = 'sss';

  const postData = Object.keys(params)
    .map(param => `${encodeURIComponent(param)}=${encodeURIComponent(params[param])}`)
    .join('&');

  const key = 'kkk';

  return {
    Key: key,
    Sign: sign(postData, secret),
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

export async function loadMarketSummaries(): Promise<[Coin[], string[]]> {
  try {
    const url = 'https://poloniex.com/public?command=returnTicker';

    const response = await Axios.get(url, { method: 'get' });
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

    await AsyncStorage.setItem('@extracker:coins', JSON.stringify(listCoins));
    await AsyncStorage.setItem('@extracker:markets', JSON.stringify(listMarkets));

    return [listCoins, listMarkets];
  } catch (err) {
    return [[], []];
  }
}

export async function loadOrderBook(coin: Coin, type): Promise<Order[]> {
  const url = `https://poloniex.com/public?command=returnOrderBook&currencyPair=${coin.market}_${coin.name}&depth=100`;
  const response = await Axios.get(url, { method: 'get' });
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

export async function loadSummary(coin: Coin): Promise<Coin> {
  const url = 'https://poloniex.com/public?command=returnTicker';

  const response = await Axios.get(url, { method: 'get' });
  const json = response.data;
  const pairs = Object.keys(json);

  const data = pairs[`${coin.market}_${coin.name}`.toUpperCase()];

  coin.last = data.last;
  coin.bid = data.highestBid;
  coin.ask = data.lowestAsk;
  coin.high = data.high24hr;
  coin.low = data.low24hr;
  coin.volume = data.quoteVolume;
  coin.baseVolume = data.baseVolume;
  coin.change = parseFloat(data.percentChange) * 100;

  return coin;
}

export async function loadMarketHistory(coin: Coin) {
  const url = `https://poloniex.com/public?command=returnTradeHistory&currencyPair=${coin.market.toUpperCase()}_${coin.name.toUpperCase()}`;

  const response = await Axios.get(url, { method: 'get' });

  const json = await response.data;

  return json.map(it => new OrderHistory(it.amount, it.rate, it.total, it.type.toLowerCase(), it.date));
}

export async function loadCandleChartData(coin: Coin, chartCandle = `${30 * 60}`, chartZoom = 0): Promise<ChartData[]> {
  const end = moment().unix();
  const start = end - chartZoom * 60 * 60;

  const url = `https://poloniex.com/public?command=returnChartData&currencyPair=${coin.market.toUpperCase()}_${coin.name.toUpperCase()}&start=${start}&end=${end}&period=${chartCandle}`;
  const response = await Axios.get(url, { method: 'get' });

  const data = await response.data;

  const ret: ChartData[] = [];

  for (let i = 0; i < data.length; i++) {
    const it = data[i];

    ret.push(new ChartData(it.high, it.low, it.open, it.close, it.quoteVolume, it.volume));
  }

  return ret;
}

export function candleChartData() {
  const zoomItems = [
    { label: '3h', value: (3).toString() },
    { label: '6h', value: (6).toString() },
    { label: '24h', value: (24).toString() },
    { label: '2d', value: (24 * 2).toString() },
    { label: '1w', value: (24 * 7).toString() },
    { label: '2w', value: (24 * 7 * 2).toString() },
    { label: '1m', value: (24 * 30).toString() },
  ];

  const candleItems = [300, 900, 1800, 7200, 14400, 86400].map(sec =>
    sec / 60 < 60 ? { label: `${sec / 60} min`, value: sec } : { label: `${sec / 60 / 60} h`, value: sec },
  );

  return { zoom: zoomItems, candle: candleItems };
}

export async function cancelOrder(order: MyOrder) {
  const url = `${baseTradingURL}`;
  const aNonce = nonce();

  const params = {
    command: 'cancelOrder',
    nonce: aNonce,
    orderNumber: `${order.id}`,
  };

  const options = {
    headers: { ...prepareHeaders(params) },
  };

  await Axios.post(url, querystring.stringify(params), options);
}

export async function loadBalances(includeZeros = false): Promise<MyCoin[]> {
  const url = `${baseTradingURL}`;
  const aNonce = nonce();

  const params = {
    command: 'returnCompleteBalances',
    nonce: aNonce,
  };

  const options = {
    headers: { ...prepareHeaders(params) },
  };

  const { data } = await Axios.post(url, querystring.stringify(params), options);

  const withBalances = Object.keys(data).filter(it => parseFloat(data[it].available) !== 0.0);

  const ret: MyCoin[] = [];
  for (let i = 0; i < withBalances.length; i++) {
    const coin = withBalances[i];

    ret.push(
      new MyCoin(
        coin,
        data[coin].available,
        parseFloat(data[coin].available) - parseFloat(data[coin].onOrders),
        0,
        '---',
      ),
    );
  }

  return ret;
}

export async function loadBalance(currency: string): Promise<MyCoin | null> {
  const balances = await loadBalances();

  return balances.find(it => it.name === currency);
}

export async function loadClosedOrders(coin: Coin = null): Promise<MyOrder[]> {
  const url = `${baseTradingURL}`;
  const aNonce = nonce();

  const params = {
    command: 'returnTradeHistory',
    nonce: aNonce,
    currencyPair: 'all',
  };

  const options = {
    headers: { ...prepareHeaders(params) },
  };

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
        ),
      );
    }
  }

  return ret;
}

export async function loadMyOrders(coin: Coin = null): Promise<MyOrder[]> {
  const url = `${baseTradingURL}`;
  const aNonce = nonce();

  const params = {
    command: 'returnOpenOrders',
    nonce: aNonce,
    currencyPair: 'all',
  };

  const options = {
    headers: { ...prepareHeaders(params) },
  };

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
        ),
      );
    }
  }

  return ret;
}

export async function execOrder(type, market, coin, quantity, price) {
  const url = `${baseTradingURL}`;
  const aNonce = nonce();

  const params = {
    command: type.toLowerCase(),
    currencyPair: `${coin.market}_${coin.name}`.toUpperCase(),
    rate: price.toString(),
    amount: quantity.toString(),
    nonce: aNonce,
  };

  const options = {
    headers: { ...prepareHeaders(params) },
  };

  try {
    await Axios.post(url, querystring.stringify(params), options);

    return { success: true };
  } catch (err) {
    console.log('AQUI', err);
    return { success: false };
  }
}
