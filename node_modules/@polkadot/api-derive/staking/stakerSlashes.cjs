"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._stakerSlashes = _stakerSlashes;
exports.stakerSlashes = stakerSlashes;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function _stakerSlashes(instanceId, api) {
  return (0, _index.memo)(instanceId, (accountId, eras, withActive) => {
    const stakerId = api.registry.createType('AccountId', accountId).toString();
    return api.derive.staking._erasSlashes(eras, withActive).pipe((0, _rxjs.map)(slashes => slashes.map(({
      era,
      nominators,
      validators
    }) => ({
      era,
      total: nominators[stakerId] || validators[stakerId] || api.registry.createType('Balance')
    }))));
  });
}

function stakerSlashes(instanceId, api) {
  return (0, _index.memo)(instanceId, (accountId, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe((0, _rxjs.switchMap)(eras => api.derive.staking._stakerSlashes(accountId, eras, withActive))));
}