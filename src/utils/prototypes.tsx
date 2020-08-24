import { parse } from '@babel/core';

/*jshint freeze: true */
Object.defineProperty(Number.prototype, 'idealDecimalPlaces', {
  value: function () {
    'use strict';
    if (this >= 100000) return this.toFixed(1);
    if (this >= 10000) return this.toFixed(2);
    if (this >= 10) return this.toFixed(4);

    return this.toFixed(8);
  },
});

Object.defineProperty(String.prototype, 'idealDecimalPlaces', {
  value: function () {
    'use strict';
    const fValue = parseFloat(this);
    if (fValue >= 100000) return fValue.toFixed(1);
    if (fValue >= 10000) return fValue.toFixed(2);
    if (fValue >= 10) return fValue.toFixed(4);

    return fValue.toFixed(8);
  },
});
