import AsyncStorage from '@react-native-community/async-storage';
import Axios from 'axios';
import MyCoin from '../models/MyCoin';
import Coin from '../models/Coin';
import Order from '../models/Order';
import MyOrder from '../models/MyOrder';
import OrderHistory from '../models/OrderHistory';
import ChartData from '../models/ChartData';
import StorageUtils from '../utils/StorageUtils';

function sign(url: string, secret: string) {
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
    console.log(err);

    return [[], []];
  }
}

export async function loadBalances(includeZeros = false): Promise<MyCoin[]> {
  return [];
}

export async function loadBalance(currency: string): Promise<MyCoin | null> {
  return null;
}

export async function loadClosedOrders(coin: Coin = null): Promise<MyOrder[]> {
  return [];
}

export async function loadMyOrders(coin: Coin = null): Promise<MyOrder[]> {
  return [];
}

export async function loadOrderBook(coin: Coin, type): Promise<Order[]> {
  return [];
}

export async function loadSummary(coin: Coin): Promise<Coin> {
  const url = 'https://poloniex.com/public?command=returnTicker';

  const response = await Axios.get(url, { method: 'get' });
  const json = response.data;
  const pairs = Object.keys(json);

  const data = pairs[`${coin.market.toUpperCase()}_${coin.name.toUpperCase()}`];

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

export async function loadCandleChartData(coin: Coin, chartCandle = 'ThirtyMin', chartZoom = 0): Promise<ChartData[]> {
  const url = `https://poloniex.com/public?command=returnChartData&currencyPair=${coin.market.toUpperCase()}_${coin.name.toUpperCase()}&start=1546300800&end=1546646400&period=14400`;
  const response = await Axios.get(url, { method: 'get' });

  const json = await response.data;

  console.log(json);

  return [];
}

export async function cancelOrder(order: MyOrder) {}
export async function execOrder(type, market, coin, quantity, price) {}
