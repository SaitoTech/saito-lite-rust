// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map, of } from 'rxjs';
import { isFunction } from '@polkadot/util';
import { memo } from "../util/index.js";
import { getInstance } from "./getInstance.js";
export function prime(instanceId, api, _section) {
  const section = getInstance(api, _section);
  return memo(instanceId, () => {
    var _api$query;

    return isFunction((_api$query = api.query[section]) === null || _api$query === void 0 ? void 0 : _api$query.prime) ? api.query[section].prime().pipe(map(optPrime => optPrime.unwrapOr(null))) : of(null);
  });
}