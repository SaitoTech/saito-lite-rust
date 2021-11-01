// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map, of, switchMap } from 'rxjs';
import { deriveCache, memo } from "../util/index.js";
import { filterEras } from "./util.js";
const CACHE_KEY = 'eraRewards';

function mapRewards(eras, optRewards) {
  return eras.map((era, index) => ({
    era,
    eraReward: optRewards[index].unwrapOrDefault()
  }));
}

export function _erasRewards(instanceId, api) {
  return memo(instanceId, (eras, withActive) => {
    if (!eras.length) {
      return of([]);
    }

    const cached = withActive ? [] : eras.map(era => deriveCache.get(`${CACHE_KEY}-${era.toString()}`)).filter(value => !!value);
    const remaining = filterEras(eras, cached);

    if (!remaining.length) {
      return of(cached);
    }

    return api.query.staking.erasValidatorReward.multi(remaining).pipe(map(optRewards => {
      const query = mapRewards(remaining, optRewards);
      !withActive && query.forEach(q => deriveCache.set(`${CACHE_KEY}-${q.era.toString()}`, q));
      return eras.map(era => cached.find(cached => era.eq(cached.era)) || query.find(query => era.eq(query.era)));
    }));
  });
}
export function erasRewards(instanceId, api) {
  return memo(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._erasRewards(eras, withActive))));
}