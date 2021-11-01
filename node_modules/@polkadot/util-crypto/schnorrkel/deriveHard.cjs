"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schnorrkelDeriveHard = void 0;

var _wasmCrypto = require("@polkadot/wasm-crypto");

var _derive = require("./derive.cjs");

// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
const schnorrkelDeriveHard = (0, _derive.createDeriveFn)(_wasmCrypto.sr25519DeriveKeypairHard);
exports.schnorrkelDeriveHard = schnorrkelDeriveHard;