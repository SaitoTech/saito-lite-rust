"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  derive: true,
  decorateDerive: true,
  packageInfo: true
};
exports.decorateDerive = decorateDerive;
exports.derive = void 0;
Object.defineProperty(exports, "packageInfo", {
  enumerable: true,
  get: function () {
    return _packageInfo.packageInfo;
  }
});

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var accounts = _interopRequireWildcard(require("./accounts/index.cjs"));

var balances = _interopRequireWildcard(require("./balances/index.cjs"));

var bounties = _interopRequireWildcard(require("./bounties/index.cjs"));

var chain = _interopRequireWildcard(require("./chain/index.cjs"));

var contracts = _interopRequireWildcard(require("./contracts/index.cjs"));

var council = _interopRequireWildcard(require("./council/index.cjs"));

var crowdloan = _interopRequireWildcard(require("./crowdloan/index.cjs"));

var democracy = _interopRequireWildcard(require("./democracy/index.cjs"));

var elections = _interopRequireWildcard(require("./elections/index.cjs"));

var imOnline = _interopRequireWildcard(require("./imOnline/index.cjs"));

var membership = _interopRequireWildcard(require("./membership/index.cjs"));

var parachains = _interopRequireWildcard(require("./parachains/index.cjs"));

var session = _interopRequireWildcard(require("./session/index.cjs"));

var society = _interopRequireWildcard(require("./society/index.cjs"));

var staking = _interopRequireWildcard(require("./staking/index.cjs"));

var technicalCommittee = _interopRequireWildcard(require("./technicalCommittee/index.cjs"));

var treasury = _interopRequireWildcard(require("./treasury/index.cjs"));

var tx = _interopRequireWildcard(require("./tx/index.cjs"));

var _packageInfo = require("./packageInfo.cjs");

var _index19 = require("./type/index.cjs");

Object.keys(_index19).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _index19[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _index19[key];
    }
  });
});

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const derive = {
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
exports.derive = derive;
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


function decorateDerive(instanceId, api, custom = {}) {
  return _objectSpread(_objectSpread({}, injectFunctions(instanceId, api, derive)), injectFunctions(instanceId, api, custom));
}