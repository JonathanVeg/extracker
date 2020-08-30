/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */

export function sign(data: string, secret: string) {
  const sha512 = require('js-sha512');

  const hash = sha512.hmac.create(secret);

  hash.update(data);

  return hash.hex();
}

export function nonce() {
  return `${new Date().getTime() * 100}`;
}
