import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map } from 'rxjs';
import { memo } from "../util/index.js";
/**
 * @description Retrieves all the session and era query and calculates specific values on it as the length of the session and eras
 */

export function info(instanceId, api) {
  return memo(instanceId, () => api.derive.session.indexes().pipe(map(indexes => {
    var _api$consts, _api$consts$babe, _api$consts2, _api$consts2$staking;

    const sessionLength = ((_api$consts = api.consts) === null || _api$consts === void 0 ? void 0 : (_api$consts$babe = _api$consts.babe) === null || _api$consts$babe === void 0 ? void 0 : _api$consts$babe.epochDuration) || api.registry.createType('u64', 1);
    const sessionsPerEra = ((_api$consts2 = api.consts) === null || _api$consts2 === void 0 ? void 0 : (_api$consts2$staking = _api$consts2.staking) === null || _api$consts2$staking === void 0 ? void 0 : _api$consts2$staking.sessionsPerEra) || api.registry.createType('SessionIndex', 1);
    return _objectSpread(_objectSpread({}, indexes), {}, {
      eraLength: api.registry.createType('BlockNumber', sessionsPerEra.mul(sessionLength)),
      isEpoch: !!api.query.babe,
      sessionLength,
      sessionsPerEra
    });
  })));
}