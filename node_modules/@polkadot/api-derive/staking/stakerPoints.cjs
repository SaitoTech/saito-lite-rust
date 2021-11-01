"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._stakerPoints = _stakerPoints;
exports.stakerPoints = stakerPoints;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function _stakerPoints(instanceId, api) {
  return (0, _index.memo)(instanceId, (accountId, eras, withActive) => {
    const stakerId = api.registry.createType('AccountId', accountId).toString();
    return api.derive.staking._erasPoints(eras, withActive).pipe((0, _rxjs.map)(points => points.map(({
      era,
      eraPoints,
      validators
    }) => ({
      era,
      eraPoints,
      points: validators[stakerId] || api.registry.createType('RewardPoint')
    }))));
  });
}

function stakerPoints(instanceId, api) {
  return (0, _index.memo)(instanceId, (accountId, withActive = false) => api.derive.staking.erasHistoric(withActive).pipe((0, _rxjs.switchMap)(eras => api.derive.staking._stakerPoints(accountId, eras, withActive))));
}