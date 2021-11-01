// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map, of, switchMap } from 'rxjs';
import { memo } from "../util/index.js";
export function _ownExposures(instanceId, api) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return memo(instanceId, (accountId, eras, _withActive) => eras.length ? api.queryMulti([...eras.map(era => [api.query.staking.erasStakersClipped, [era, accountId]]), ...eras.map(era => [api.query.staking.erasStakers, [era, accountId]])]).pipe(map(all => eras.map((era, index) => ({
    clipped: all[index],
    era,
    exposure: all[eras.length + index]
  })))) : of([]));
}
export function ownExposure(instanceId, api) {
  return memo(instanceId, (accountId, era) => api.derive.staking._ownExposures(accountId, [era], true).pipe(map(([first]) => first)));
}
export function ownExposures(instanceId, api) {
  return memo(instanceId, (accountId, withActive = false) => {
    return api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._ownExposures(accountId, eras, withActive)));
  });
}