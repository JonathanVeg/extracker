import Axios from 'axios';
import FiatData from './FiatData';

export default class Fiat {
  key = '';
  label = '';
  source = '';
  url = '';
  priceFieldName = '';
  lowFieldName = '';
  highFieldName = '';
  divisor = '';
  data: FiatData;

  constructor(
    key: string,
    label: string,
    source: string,
    url: string,
    priceFieldName: string,
    lowFieldName: string,
    highFieldName: string,
    divisor: string,
  ) {
    this.key = key;
    this.label = label;
    this.source = source;
    this.url = url;
    this.priceFieldName = priceFieldName;
    this.lowFieldName = lowFieldName;
    this.highFieldName = highFieldName;
    this.divisor = divisor;
  }

  get name(): string {
    return this.label;
  }

  async load() {
    try {
      const response = await Axios.get(this.url);
      const { data } = response;

      let priceData = data;
      this.priceFieldName.split('.').map(it => {
        priceData = priceData[it];
      });

      let lowData = data;
      this.lowFieldName.split('.').map(it => {
        lowData = lowData[it];
      });

      let highData = data;
      this.highFieldName.split('.').map(it => {
        highData = highData[it];
      });

      this.data = new FiatData(parseFloat(priceData) || 0, parseFloat(highData) || 0, parseFloat(lowData) || 0);
    } catch (err) {
      console.error(err);
    }
  }
}
