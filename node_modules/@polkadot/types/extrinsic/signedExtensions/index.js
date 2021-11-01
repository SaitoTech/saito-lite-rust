import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { polkadot } from "./polkadot.js";
import { shell } from "./shell.js";
import { statemint } from "./statemint.js";
import { substrate } from "./substrate.js"; // A mapping of the known signed extensions to the extra fields that they contain. Unlike in the actual extensions,
// we define the extra fields not as a Tuple, but rather as a struct so they can be named. These will be expanded
// into the various fields when added to the payload (we only support V4 onwards with these, V3 and earlier are
// deemed fixed and non-changeable)

export const allExtensions = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, substrate), polkadot), shell), statemint); // the v4 signed extensions prior to the point of exposing these to the metadata.
// This may not match 100% with the current defaults and are used when not specified
// in the metadata (which is for very old chains). The order is important here, as
// applied by default

export const fallbackExtensions = ['CheckVersion', 'CheckGenesis', 'CheckEra', 'CheckNonce', 'CheckWeight', 'ChargeTransactionPayment', 'CheckBlockGasLimit'];
export function findUnknownExtensions(extensions, userExtensions = {}) {
  const names = [...Object.keys(allExtensions), ...Object.keys(userExtensions)];
  return extensions.filter(key => !names.includes(key));
}
export function expandExtensionTypes(extensions, type, userExtensions = {}) {
  return extensions // Always allow user extensions first - these should provide overrides
  .map(key => userExtensions[key] || allExtensions[key]).filter(info => !!info).reduce((result, info) => _objectSpread(_objectSpread({}, result), info[type]), {});
}