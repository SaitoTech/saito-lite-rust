"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.members = members;

var _rxjs = require("rxjs");

var _util = require("@polkadot/util");

var _index = require("../util/index.cjs");

var _getInstance = require("./getInstance.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function members(instanceId, api, _section) {
  const section = (0, _getInstance.getInstance)(api, _section);
  return (0, _index.memo)(instanceId, () => {
    var _api$query$section;

    return (0, _util.isFunction)((_api$query$section = api.query[section]) === null || _api$query$section === void 0 ? void 0 : _api$query$section.members) ? api.query[section].members() : (0, _rxjs.of)([]);
  });
}