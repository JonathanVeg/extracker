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
