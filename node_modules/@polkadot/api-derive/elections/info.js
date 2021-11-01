import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { combineLatest, map, of } from 'rxjs';
import { memo } from "../util/index.js"; // SeatHolder is current tuple is 2.x-era Substrate

function isSeatHolder(value) {
  return !Array.isArray(value);
}

function isCandidateTuple(value) {
  return Array.isArray(value);
}

function getAccountTuple(value) {
  return isSeatHolder(value) ? [value.who, value.stake] : value;
}

function getCandidate(value) {
  return isCandidateTuple(value) ? value[0] : value;
}

function sortAccounts([, balanceA], [, balanceB]) {
  return balanceB.cmp(balanceA);
}

function queryElections(api) {
  const elections = api.query.phragmenElection ? 'phragmenElection' : api.query.electionsPhragmen ? 'electionsPhragmen' : api.query.elections ? 'elections' : null;
  const [council] = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), 'council') || ['council'];
  return (elections ? api.queryMulti([api.query[council].members, api.query[elections].candidates, api.query[elections].members, api.query[elections].runnersUp]) : combineLatest([api.query[council].members(), of([]), of([]), of([])])).pipe(map(([councilMembers, candidates, members, runnersUp]) => _objectSpread(_objectSpread({}, elections ? {
    candidacyBond: api.consts[elections].candidacyBond,
    desiredRunnersUp: api.consts[elections].desiredRunnersUp,
    desiredSeats: api.consts[elections].desiredMembers,
    termDuration: api.consts[elections].termDuration,
    votingBond: api.consts[elections].votingBond
  } : {}), {}, {
    candidateCount: api.registry.createType('u32', candidates.length),
    candidates: candidates.map(getCandidate),
    members: members.length ? members.map(getAccountTuple).sort(sortAccounts) : councilMembers.map(accountId => [accountId, api.registry.createType('Balance')]),
    runnersUp: runnersUp.map(getAccountTuple).sort(sortAccounts)
  })));
}
/**
 * @name info
 * @returns An object containing the combined results of the storage queries for
 * all relevant election module properties.
 * @example
 * <BR>
 *
 * ```javascript
 * api.derive.elections.info(({ members, candidates }) => {
 *   console.log(`There are currently ${members.length} council members and ${candidates.length} prospective council candidates.`);
 * });
 * ```
 */


export function info(instanceId, api) {
  return memo(instanceId, () => queryElections(api));
}