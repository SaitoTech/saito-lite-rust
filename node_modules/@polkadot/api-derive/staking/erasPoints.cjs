"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._erasPoints = _erasPoints;
exports.erasPoints = erasPoints;

var _rxjs = require("rxjs");

var _util = require("@polkadot/util");

var _index = require("../util/index.cjs");

var _util2 = require("./util.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
const CACHE_KEY = 'eraPoints';

function mapValidators({
  individual
}) {
  return [...individual.entries()].filter(([, points]) => points.gt(_util.BN_ZERO)).reduce((result, [validatorId, points]) => {
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

function _erasPoints(instanceId, api) {
  return (0, _index.memo)(instanceId, (eras, withActive) => {
    if (!eras.length) {
      return (0, _rxjs.of)([]);
    }

    const cached = withActive ? [] : eras.map(era => _index.deriveCache.get(`${CACHE_KEY}-${era.toString()}`)).filter(value => !!value);
    const remaining = (0, _util2.filterEras)(eras, cached);
    return !remaining.length ? (0, _rxjs.of)(cached) : api.query.staking.erasRewardPoints.multi(remaining).pipe((0, _rxjs.map)(points => {
      const query = mapPoints(remaining, points);
      !withActive && query.forEach(q => _index.deriveCache.set(`${CACHE_KEY}-${q.era.toString()}`, q));
      return eras.map(era => cached.find(cached => era.eq(cached.era)) || query.find(query => era.eq(query.era)));
    }));
  });
}

function erasPoints(instanceId, api) {
  return (0, _index.memo)(instanceId, (withActive = false) => api.derive.staking.erasHistoric(withActive).pipe((0, _rxjs.switchMap)(eras => api.derive.staking._erasPoints(eras, withActive))));
}