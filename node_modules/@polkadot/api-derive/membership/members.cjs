"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.members = members;

var _index = require("../collective/index.cjs");

var _index2 = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function members(instanceId, api) {
  return (0, _index2.memo)(instanceId, (0, _index.members)(instanceId, api, 'membership'));
}