"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._ownSlashes = _ownSlashes;
exports.ownSlash = ownSlash;
exports.ownSlashes = ownSlashes;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function _ownSlashes(instanceId, api) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (0, _index.memo)(instanceId, (accountId, eras, _withActive) => eras.length ? api.queryMulti([...eras.map(era => [api.query.staking.validatorSlashInEra, [era, accountId]]), ...eras.map(era => [api.query.staking.nominatorSlashInEra, [era, accountId]])]).pipe((0, _rxjs.map)(values => eras.map((era, index) => ({
    era,
    total: values[index].isSome ? values[index].unwrap()[1] : values[index + eras.length].unwrapOrDefault()
  })))) : (0, _rxjs.of)([]));
}

function ownSlash(instanceId, api) {
  return (0, _index.memo)(instanceId, (accountId, era) => api.derive.staking._ownSlashes(accountId, [era], true).pipe((0, _rxjs.map)(([first]) => first)));
}

function ownSlashes(instanceId, api) {
  return (0, _index.memo)(instanceId, (accountId, withActive = false) => {
    return api.derive.staking.erasHistoric(withActive).pipe((0, _rxjs.switchMap)(eras => api.derive.staking._ownSlashes(accountId, eras, withActive)));
  });
}