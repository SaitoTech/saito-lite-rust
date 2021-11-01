import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import * as accounts from "./accounts/index.js";
import * as balances from "./balances/index.js";
import * as bounties from "./bounties/index.js";
import * as chain from "./chain/index.js";
import * as contracts from "./contracts/index.js";
import * as council from "./council/index.js";
import * as crowdloan from "./crowdloan/index.js";
import * as democracy from "./democracy/index.js";
import * as elections from "./elections/index.js";
import * as imOnline from "./imOnline/index.js";
import * as membership from "./membership/index.js";
import * as parachains from "./parachains/index.js";
import * as session from "./session/index.js";
import * as society from "./society/index.js";
import * as staking from "./staking/index.js";
import * as technicalCommittee from "./technicalCommittee/index.js";
import * as treasury from "./treasury/index.js";
import * as tx from "./tx/index.js";
export { packageInfo } from "./packageInfo.js";
export * from "./type/index.js";
export const derive = {
  accounts,
  balances,
  bounties,
  chain,
  contracts,
  council,
  crowdloan,
  democracy,
  elections,
  imOnline,
  membership,
  parachains,
  session,
  society,
  staking,
  technicalCommittee,
  treasury,
  tx
};
// Enable derive only if some of these modules are available
const checks = {
  contracts: {
    instances: ['contracts']
  },
  council: {
    instances: ['council'],
    withDetect: true
  },
  crowdloan: {
    instances: ['crowdloan']
  },
  democracy: {
    instances: ['democracy']
  },
  elections: {
    instances: ['phragmenElection', 'electionsPhragmen', 'elections', 'council'],
    withDetect: true
  },
  imOnline: {
    instances: ['imOnline']
  },
  membership: {
    instances: ['membership']
  },
  parachains: {
    instances: ['parachains', 'registrar']
  },
  session: {
    instances: ['session']
  },
  society: {
    instances: ['society']
  },
  staking: {
    instances: ['staking']
  },
  technicalCommittee: {
    instances: ['technicalCommittee'],
    withDetect: true
  },
  treasury: {
    instances: ['treasury']
  }
};
/**
 * Returns an object that will inject `api` into all the functions inside
 * `allSections`, and keep the object architecture of `allSections`.
 */

/** @internal */

function injectFunctions(instanceId, api, allSections) {
  const queryKeys = Object.keys(api.query);
  const specName = api.runtimeVersion.specName.toString();
  return Object.keys(allSections).filter(sectionName => !checks[sectionName] || checks[sectionName].instances.some(q => queryKeys.includes(q)) || checks[sectionName].withDetect && checks[sectionName].instances.some(q => (api.registry.getModuleInstances(specName, q) || []).some(q => queryKeys.includes(q)))).reduce((derives, sectionName) => {
    const section = allSections[sectionName];
    derives[sectionName] = Object.entries(section).reduce((methods, [methodName, creator]) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
      methods[methodName] = creator(instanceId, api);
      return methods;
    }, {});
    return derives;
  }, {});
} // FIXME The return type of this function should be {...ExactDerive, ...DeriveCustom}
// For now we just drop the custom derive typings

/** @internal */


export function decorateDerive(instanceId, api, custom = {}) {
  return _objectSpread(_objectSpread({}, injectFunctions(instanceId, api, derive)), injectFunctions(instanceId, api, custom));
}