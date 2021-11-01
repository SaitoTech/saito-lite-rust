"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bestNumber = bestNumber;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @name bestNumber
 * @returns The latest block number.
 * @example
 * <BR>
 *
 * ```javascript
 * api.derive.chain.bestNumber((blockNumber) => {
 *   console.log(`the current best block is #${blockNumber}`);
 * });
 * ```
 */
function bestNumber(instanceId, api) {
  return (0, _index.memo)(instanceId, () => api.derive.chain.subscribeNewHeads().pipe((0, _rxjs.map)(header => header.number.unwrap())));
}