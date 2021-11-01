"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eraProgress = eraProgress;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function eraProgress(instanceId, api) {
  return (0, _index.memo)(instanceId, () => api.derive.session.progress().pipe((0, _rxjs.map)(info => info.eraProgress)));
}