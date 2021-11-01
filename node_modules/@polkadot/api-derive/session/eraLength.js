// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map } from 'rxjs';
import { memo } from "../util/index.js";
export function eraLength(instanceId, api) {
  return memo(instanceId, () => api.derive.session.info().pipe(map(info => info.eraLength)));
}