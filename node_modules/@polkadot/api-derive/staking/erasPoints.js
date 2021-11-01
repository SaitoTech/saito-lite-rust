// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { map, of, switchMap } from 'rxjs';
import { BN_ZERO } from '@polkadot/util';
import { deriveCache, memo } from "../util/index.js";
import { filterEras } from "./util.js";
const CACHE_KEY = 'eraPoints';

function mapValidators({
  individual
}) {
  return [...individual.entries()].filter(([, points]) => points.gt(BN_ZERO)).reduce((result, [validatorId, points]) => {
    result[validatorId.toString()] = points;
    return result;
  }, {});
}

function mapPoints(eras, points) {
  return eras.map((era, index) => ({
    era,
    eraPoints: points[index].total,
    validators: mapValidators(points[index])
  }));
}

export function _erasPoints(instanceId, api) {
  return memo(instanceId, (eras, withActive) => {
    if (!eras.length) {
      return of([]);
    }

    const cached = withActive ? [] : eras.map(era => deriveCache.get(`${CACHE_KEY}-${era.toString()}`)).filter(value => !!value);
    const remaining = filterEras(eras, cached);
    return !remaining.length ? of(cached) : api.query.staking.erasRewardPoints.multi(remaining).pipe(map(points => {
      const query = mapPoints(remaining, points);
      !withActive && query.forEach(q => deriveCache.set(`${CACHE_KEY}-${q.era.toString()}`, q));
      return eras.map(era => cached.find(cached => era.eq(cached.era)) || query.find(query => era.eq(query.era)));
    }));
  });
}
export function erasPoints(instanceId, api) {
  return memo(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe(switchMap(eras => api.derive.staking._erasPoints(eras, withActive))));
}