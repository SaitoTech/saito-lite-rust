// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map, of, switchMap } from 'rxjs';
import { memo } from "../util/index.js";
export function _ownSlashes(instanceId, api) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return memo(instanceId, (accountId, eras, _withActive) => eras.length ? api.queryMulti([...eras.map(era => [api.query.staking.validatorSlashInEra, [era, accountId]]), ...eras.map(era => [api.query.staking.nominatorSlashInEra, [era, accountId]])]).pipe(map(values => eras.map((era, index) => ({
    era,
    total: values[index].isSome ? values[index].unwrap()[1] : values[index + eras.length].unwrapOrDefault()
  })))) : of([]));
}
export function ownSlash(instanceId, api) {
  return memo(instanceId, (accountId, era) => api.derive.staking._ownSlashes(accountId, [era], true).pipe(map(([first]) => first)));
}
export function ownSlashes(instanceId, api) {
  return memo(instanceId, (accountId, withActive = false) => {
    return api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._ownSlashes(accountId, eras, withActive)));
  });
}