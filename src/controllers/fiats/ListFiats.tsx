import Fiat from './Fiat';

const allFiats: Fiat[] = [
  // (new Fiat('USDT', 'USDT', 'Bittrex', 'https://bittrex.com/api/v1.1/public/getmarketsummary?market=usdt-btc', 'BTC_USDT.last', 'BTC_USDT.low24h', 'BTC_USDT.high24h', 1)),
  new Fiat('USD', 'USD', 'blockchain.info', 'https://blockchain.info/ticker', 'USD.last', 'USD.sell', 'USD.buy', 1),
  new Fiat(
    'BRL',
    'BRL',
    'Mercado Bitcoin',
    'https://www.mercadobitcoin.net/api/BTC/ticker/',
    'ticker.last',
    'ticker.low',
    'ticker.high',
    1,
  ),
  new Fiat(
    'AUD',
    'AUD',
    'btcmarkets.net',
    'https://api.btcmarkets.net/market/BTC/AUD/tick',
    'lastPrice',
    'bestBid',
    'bestAsk',
    1,
  ),
  new Fiat(
    'GBP',
    'GBP',
    'coinfloor.co.uk',
    'https://webapi.coinfloor.co.uk:8090/bist/XBT/GBP/ticker/',
    'last',
    'low',
    'high',
    1,
  ),
  new Fiat('EUR', 'EUR', 'blockchain.info', 'https://blockchain.info/ticker', 'EUR.last', 'EUR.sell', 'EUR.buy', 1),
  new Fiat('KRW', 'KRW', 'blockchain.info', 'https://blockchain.info/ticker', 'KRW.last', 'KRW.sell', 'KRW.buy', 1),
  new Fiat(
    'CAD',
    'CAD',
    'cbix.ca',
    'https://api.cbix.ca/v1/index',
    'index.value',
    'index.low_24hour',
    'index.high_24hour',
    1,
  ),
  new Fiat(
    'IDR',
    'IDR',
    'bitcoin.co.id',
    'https://vip.bitcoin.co.id/api/btc_idr/ticker',
    'ticker.last',
    'ticker.low',
    'ticker.high',
    1,
  ),
  new Fiat('INR', 'INR', 'blockchain.info', 'https://blockchain.info/ticker', 'INR.last', 'INR.sell', 'INR.buy', 1),
  new Fiat(
    'SGD',
    'SGD',
    'coinbase.com',
    'https://api.coinbase.com/v2/prices/BTC-SGD/spot',
    'data.amount',
    'data.amount',
    'data.amount',
    1,
  ),
  new Fiat(
    'MYR',
    'MYR',
    'mybitx.com',
    'https://api.mybitx.com/api/1/ticker?pair=XBTMYR',
    'last_trade',
    'bid',
    'ask',
    1,
  ),
  new Fiat(
    'TRY',
    'TRY',
    'coinbase.com',
    'https://api.coinbase.com/v2/prices/BTC-TRY/spot',
    'data.amount',
    'data.amount',
    'data.amount',
    1,
  ),
  new Fiat('YEN', 'YEN', 'bitflyer.jp', 'https://api.bitflyer.jp/v1/getticker', 'ltp', 'best_bid', 'best_ask', 1),
  new Fiat(
    'RUR',
    'RUR',
    'Yobit',
    'https://yobit.net/api/3/ticker/btc_rur',
    'btc_rur.last',
    'btc_rur.low',
    'btc_rur.high',
    1,
  ),
  new Fiat(
    'NZD',
    'NZD',
    'coinbase.com',
    'https://api.coinbase.com/v2/prices/BTC-NZD/spot',
    'data.amount',
    'data.amount',
    'data.amount',
    1,
  ),
  new Fiat(
    'ZAR',
    'ZAR',
    'mybitx.com',
    'https://api.mybitx.com/api/1/ticker?pair=XBTZAR',
    'last_trade',
    'bid',
    'ask',
    1,
  ),
  new Fiat(
    'CLP',
    'CLP',
    'coinbase.com',
    'https://api.coinbase.com/v2/prices/BTC-CLP/spot',
    'data.amount',
    'data.amount',
    'data.amount',
    1,
  ),
];

export default allFiats;
