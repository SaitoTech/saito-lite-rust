"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "packageInfo", {
  enumerable: true,
  get: function () {
    return _packageInfo.packageInfo;
  }
});
exports.xglobal = void 0;

var _packageInfo = require("./packageInfo.cjs");

// Copyright 2017-2021 @polkadot/x-global authors & contributors
// SPDX-License-Identifier: Apache-2.0
function evaluateThis(fn) {
  return fn('return this');
}

const xglobal = typeof globalThis !== 'undefined' ? globalThis : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : evaluateThis(Function);
exports.xglobal = xglobal;