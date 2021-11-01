import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { combineLatest, EMPTY, map, of, startWith, switchMap } from 'rxjs';
import { memo } from "../util/index.js";
import { extractContributed } from "./util.js";

function _getValues(api, childKey, keys) {
  // We actually would love to use multi-keys https://github.com/paritytech/substrate/issues/9203
  return combineLatest(keys.map(k => api.rpc.childstate.getStorage(childKey, k))).pipe(map(values => values.map(v => api.registry.createType('Option<StorageData>', v)).map(o => o.isSome ? api.registry.createType('Balance', o.unwrap()) : api.registry.createType('Balance')).reduce((all, b, index) => _objectSpread(_objectSpread({}, all), {}, {
    [keys[index]]: b
  }), {})));
}

function _watchOwnChanges(api, paraId, childkey, keys) {
  return api.query.system.events().pipe(switchMap(events => {
    const changes = extractContributed(paraId, events);
    const filtered = keys.filter(k => changes.added.includes(k) || changes.removed.includes(k));
    return filtered.length ? _getValues(api, childkey, filtered) : EMPTY;
  }), startWith({}));
}

function _contributions(api, paraId, childKey, keys) {
  return combineLatest([_getValues(api, childKey, keys), _watchOwnChanges(api, paraId, childKey, keys)]).pipe(map(([all, latest]) => _objectSpread(_objectSpread({}, all), latest)));
}

export function ownContributions(instanceId, api) {
  return memo(instanceId, (paraId, keys) => api.derive.crowdloan.childKey(paraId).pipe(switchMap(childKey => childKey && keys.length ? _contributions(api, paraId, childKey, keys) : of({}))));
}