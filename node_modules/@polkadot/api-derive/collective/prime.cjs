"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prime = prime;

var _rxjs = require("rxjs");

var _util = require("@polkadot/util");

var _index = require("../util/index.cjs");

var _getInstance = require("./getInstance.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function prime(instanceId, api, _section) {
  const section = (0, _getInstance.getInstance)(api, _section);
  return (0, _index.memo)(instanceId, () => {
    var _api$query;

    return (0, _util.isFunction)((_api$query = api.query[section]) === null || _api$query === void 0 ? void 0 : _api$query.prime) ? api.query[section].prime().pipe((0, _rxjs.map)(optPrime => optPrime.unwrapOr(null))) : (0, _rxjs.of)(null);
  });
}