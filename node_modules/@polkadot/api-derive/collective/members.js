// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { of } from 'rxjs';
import { isFunction } from '@polkadot/util';
import { memo } from "../util/index.js";
import { getInstance } from "./getInstance.js";
export function members(instanceId, api, _section) {
  const section = getInstance(api, _section);
  return memo(instanceId, () => {
    var _api$query$section;

    return isFunction((_api$query$section = api.query[section]) === null || _api$query$section === void 0 ? void 0 : _api$query$section.members) ? api.query[section].members() : of([]);
  });
}