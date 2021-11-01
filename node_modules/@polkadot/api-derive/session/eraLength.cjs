"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eraLength = eraLength;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function eraLength(instanceId, api) {
  return (0, _index.memo)(instanceId, () => api.derive.session.info().pipe((0, _rxjs.map)(info => info.eraLength)));
}