"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._ownExposures = _ownExposures;
exports.ownExposure = ownExposure;
exports.ownExposures = ownExposures;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function _ownExposures(instanceId, api) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (0, _index.memo)(instanceId, (accountId, eras, _withActive) => eras.length ? api.queryMulti([...eras.map(era => [api.query.staking.erasStakersClipped, [era, accountId]]), ...eras.map(era => [api.query.staking.erasStakers, [era, accountId]])]).pipe((0, _rxjs.map)(all => eras.map((era, index) => ({
    clipped: all[index],
    era,
    exposure: all[eras.length + index]
  })))) : (0, _rxjs.of)([]));
}

function ownExposure(instanceId, api) {
  return (0, _index.memo)(instanceId, (accountId, era) => api.derive.staking._ownExposures(accountId, [era], true).pipe((0, _rxjs.map)(([first]) => first)));
}

function ownExposures(instanceId, api) {
  return (0, _index.memo)(instanceId, (accountId, withActive = false) => {
    return api.derive.staking.erasHistoric(withActive).pipe((0, _rxjs.switchMap)(eras => api.derive.staking._ownExposures(accountId, eras, withActive)));
  });
}