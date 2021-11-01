import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { combineLatest, map, of, switchMap } from 'rxjs';
import { isFunction } from '@polkadot/util';
import { memo } from "../util/index.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isNewDepositors(depositors) {
  // Detect balance...
  // eslint-disable-next-line @typescript-eslint/unbound-method
  return isFunction(depositors[1].mul);
}

function parse([proposals, images, optDepositors]) {
  return proposals.filter(([,, proposer], index) => {
    var _optDepositors$index;

    return !!((_optDepositors$index = optDepositors[index]) !== null && _optDepositors$index !== void 0 && _optDepositors$index.isSome) && !proposer.isEmpty;
  }).map(([index, imageHash, proposer], proposalIndex) => {
    const depositors = optDepositors[proposalIndex].unwrap();
    return _objectSpread(_objectSpread({}, isNewDepositors(depositors) ? {
      balance: depositors[1],
      seconds: depositors[0]
    } : {
      balance: depositors[0],
      seconds: depositors[1]
    }), {}, {
      image: images[proposalIndex],
      imageHash,
      index,
      proposer
    });
  });
}

export function proposals(instanceId, api) {
  return memo(instanceId, () => {
    var _api$query$democracy, _api$query$democracy2;

    return isFunction((_api$query$democracy = api.query.democracy) === null || _api$query$democracy === void 0 ? void 0 : _api$query$democracy.publicProps) && isFunction((_api$query$democracy2 = api.query.democracy) === null || _api$query$democracy2 === void 0 ? void 0 : _api$query$democracy2.preimages) ? api.query.democracy.publicProps().pipe(switchMap(proposals => proposals.length ? combineLatest([of(proposals), api.derive.democracy.preimages(proposals.map(([, hash]) => hash)), api.query.democracy.depositOf.multi(proposals.map(([index]) => index))]) : of([[], [], []])), map(parse)) : of([]);
  });
}