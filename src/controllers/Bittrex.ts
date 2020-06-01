/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-param-reassign */
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import MyCoin from '../models/MyCoin';
import Coin from '../models/Coin';
import Order from '../models/Order';
import MyOrder from '../models/MyOrder';
import OrderHistory from '../models/OrderHistory';
import ChartData from '../models/ChartData';
import StorageUtils from '../utils/StorageUtils';

export function sign(url: string, secret: string) {
  const sha512 = require('js-sha512');

  const hash = sha512.hmac.create(secret);

  hash.update(url);

  return hash.hex();
}

function nonce(): number {
  return new Date().getTime();
}

function prepareOptions(url: string, secret: string) {
  const myHeaders = { apisign: '' };

  myHeaders.apisign = sign(url, secret);

  return {
    headers: myHeaders,
  };
}

export async function loadBalances(includeZeros = false): Promise<MyCoin[]> {
  try {
    const s = await StorageUtils.getKeys();
    const { key } = s;
    const { secret } = s;

    const url = `https://bittrex.com/api/v1.1/account/getbalances?apikey=${key}&nonce=${nonce()}`;

    const response = await axios.get(url, prepareOptions(url, secret));

    const data = await response.data;

    if (!data.success) return [];

    let coins = data.result;

    if (!includeZeros) coins = coins.filter(coin => coin.Balance > 0.00000001 || coin.Pending > 0);

    return coins.map(coin => new MyCoin(coin.Currency, coin.Balance, coin.Available, coin.Pending, coin.CryptoAddress));
  } catch (err) {
    return [];
  }
}

export async function loadBalance(currency: string): Promise<MyCoin | null> {
  try {
    const s = await StorageUtils.getKeys();
    const { key } = s;
    const { secret } = s;

    const url = `https://bittrex.com/api/v1.1/account/getbalance?currency=${currency}&apikey=${key}&nonce=${nonce()}`;

    const response = await axios.get(url, prepareOptions(url, secret));

    const data = await response.data;

    if (!data.success) return null;

    const coin = data.result;

    return new MyCoin(coin.Currency, coin.Balance, coin.Available, coin.Pending, coin.CryptoAddress);
  } catch (err) {
    return null;
  }
}

export async function loadClosedOrders(coin: Coin = null): Promise<MyOrder[]> {
  let orders: MyOrder[] = [];

  try {
    const s = await StorageUtils.getKeys();
    const { key } = s;
    const { secret } = s;
    const url = `https://bittrex.com/api/v1.1/account/getorderhistory?apikey=${key}&nonce=${nonce()}`;

    const response = await axios.get(url, prepareOptions(url, secret));

    const data = await response.data;

    data.result.map(it => {
      const order = new MyOrder(
        it.OrderUuid,
        it.OrderType.split('_')[1],
        it.Exchange.split('-')[1],
        it.Exchange.split('-')[0],
        it.Quantity,
        it.Limit,
        it.Opened,
        it.Closed,
      );

      orders.push(order);
    });

    if (coin) {
      orders = orders.filter(
        it =>
          (it.coin === coin.name && it.market === coin.market) || (it.coin === coin.market && it.market === coin.name),
      );
    }

    return orders;
  } catch (err) {
    return orders;
  }
}

export async function loadMyOrders(coin: Coin = null): Promise<MyOrder[]> {
  try {
    const s = await StorageUtils.getKeys();
    const { key } = s;
    const { secret } = s;

    const url = `https://bittrex.com/api/v1.1/market/getopenorders?apikey=${key}&nonce=${nonce()}`;

    const response = await axios.get(url, prepareOptions(url, secret));

    const data = await response.data;

    if (!data.success) {
      return [];
    }

    let orders: MyOrder[] = [];

    data.result.map(it => {
      const order = new MyOrder(
        it.OrderUuid,
        it.OrderType.split('_')[1],
        it.Exchange.split('-')[1],
        it.Exchange.split('-')[0],
        it.Quantity,
        it.Limit,
        it.Opened,
        it.Closed,
      );

      orders.push(order);
    });

    if (coin) {
      orders = orders.filter(
        it =>
          (it.coin === coin.name && it.market === coin.market) || (it.coin === coin.market && it.market === coin.name),
      );
    }

    return orders;
  } catch (err) {
    return [];
  }
}

export async function loadOrderBook(coin: Coin, type): Promise<Order[]> {
  const url = `https://api.bittrex.com/api/v1.1/public/getorderbook?market=${coin.market.toUpperCase()}-${coin.name.toUpperCase()}&type=${type}`;

  const response = await axios.get(url, { method: 'get' });

  let json = await response.data;

  json = json.result;

  let quantity = 0.0;
  let total = 0.0;

  return json.map(it => {
    quantity += it.Quantity;
    total += it.Rate * it.Quantity;

    return new Order(it.Quantity, it.Rate, it.Rate * it.Quantity, total, quantity);
  });
}

export async function loadSummary(coin: Coin): Promise<Coin> {
  const url = `https://api.bittrex.com/api/v1.1/public/getmarketsummary?market=${coin.market.toLowerCase()}-${coin.name.toLowerCase()}`;

  const response = await axios.get(url, { method: 'get' });

  const json = await response.data;

  if (!json.success) return coin;

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

export async function loadMarketHistory(coin: Coin) {
  const url = `https://api.bittrex.com/api/v1.1/public/getmarkethistory?market=${coin.market.toUpperCase()}-${coin.name.toUpperCase()}`;

  const response = await axios.get(url, { method: 'get' });

  let json = await response.data;

  json = json.result;

  return json.map(it => new OrderHistory(it.Quantity, it.Price, it.Price * it.Quantity, it.OrderType, it.TimeStamp));
}

export async function cancelOrder(order: MyOrder) {
  const s = await StorageUtils.getKeys();
  const { key } = s;
  const { secret } = s;

  const url = `https://bittrex.com/api/v1.1/market/cancel?apikey=${key}&nonce=${nonce()}&uuid=${order.id}`;

  await axios.get(url, prepareOptions(url, secret));
}

export async function execOrder(type, market, coin, quantity, price) {
  const s = await StorageUtils.getKeys();
  const { key } = s;
  const { secret } = s;

  const trextype = type.toLowerCase() === 'sell' ? 'selllimit' : 'buylimit';

  const url = `https://bittrex.com/api/v1.1/market/${trextype}?apikey=${key}&nonce=${nonce()}&market=${market.toUpperCase()}-${coin.toUpperCase()}&quantity=${quantity}&rate=${price}`;

  const response = await axios.get(url, prepareOptions(url, secret));

  const data = await response.data;

  return data;
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

export async function loadCandleChartData(coin: Coin, chartCandle = 'ThirtyMin', chartZoom = 0): Promise<ChartData[]> {
  const tickInterval = chartCandle;

  const url = `https://bittrex.com/Api/v2.0/pub/market/GetTicks?marketName=${coin.market}-${coin.name}&tickInterval=${tickInterval}`;

  const response = await axios.get(url);

  let json = await response.data;

  json = json.result;

  let quantity = (24 * 60) / 30;

  if (chartZoom !== 0) {
    if (chartCandle === 'OneMin') quantity = chartZoom * 60;
    else if (chartCandle === 'FiveMin') quantity = (chartZoom * 60) / 5;
    else if (chartCandle === 'ThirtyMin') quantity = (chartZoom * 60) / 30;
    else if (chartCandle === 'Hour') quantity = chartZoom;
    else if (chartCandle === 'Day') quantity = chartZoom / 24;
  }

  const data = [];

  for (let i = json.length - quantity; i < json.length; i++) {
    const it = json[i];

    data.push(new ChartData(it.H, it.L, it.O, it.C, it.V, it.BV));
  }

  return data;
}

export async function loadMarketSummaries(): Promise<[Coin[], string[]]> {
  const url = 'https://api.bittrex.com/api/v1.1/public/getmarketsummaries';

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

  await AsyncStorage.setItem('@extracker:coins', JSON.stringify(listCoins));
  await AsyncStorage.setItem('@extracker:markets', JSON.stringify(listMarkets));

  return [listCoins, listMarkets];
}

export async function calcAllCoinsInBtc() {
  const d = await loadMarketSummaries();
  const coins: Coin[] = d[0];
  const markets: string[] = d[1];

  const allCoinsInBtc = { BTC: 1 };

  const fakeCoins = markets.filter(it => it !== 'BTC').map(it => new Coin(it, 'BTC'));

  [...coins, ...fakeCoins]
    .filter(it => it.name !== 'BTC')
    .map(it => {
      let pair = coins.find(it2 => it2.name === it.name && it2.market === 'BTC');

      if (pair) {
        allCoinsInBtc[it.name] = pair.last;
      } else {
        pair = coins.find(it2 => it2.name === 'BTC' && it2.market === it.name);
        if (pair) {
          allCoinsInBtc[it.name] = 1 / pair.last;
        }
      }
    });

  return allCoinsInBtc;
}
