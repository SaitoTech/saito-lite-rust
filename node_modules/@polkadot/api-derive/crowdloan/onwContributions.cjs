"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ownContributions = ownContributions;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

var _util = require("./util.cjs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _getValues(api, childKey, keys) {
  // We actually would love to use multi-keys https://github.com/paritytech/substrate/issues/9203
  return (0, _rxjs.combineLatest)(keys.map(k => api.rpc.childstate.getStorage(childKey, k))).pipe((0, _rxjs.map)(values => values.map(v => api.registry.createType('Option<StorageData>', v)).map(o => o.isSome ? api.registry.createType('Balance', o.unwrap()) : api.registry.createType('Balance')).reduce((all, b, index) => _objectSpread(_objectSpread({}, all), {}, {
    [keys[index]]: b
  }), {})));
}

function _watchOwnChanges(api, paraId, childkey, keys) {
  return api.query.system.events().pipe((0, _rxjs.switchMap)(events => {
    const changes = (0, _util.extractContributed)(paraId, events);
    const filtered = keys.filter(k => changes.added.includes(k) || changes.removed.includes(k));
    return filtered.length ? _getValues(api, childkey, filtered) : _rxjs.EMPTY;
  }), (0, _rxjs.startWith)({}));
}

function _contributions(api, paraId, childKey, keys) {
  return (0, _rxjs.combineLatest)([_getValues(api, childKey, keys), _watchOwnChanges(api, paraId, childKey, keys)]).pipe((0, _rxjs.map)(([all, latest]) => _objectSpread(_objectSpread({}, all), latest)));
}

function ownContributions(instanceId, api) {
  return (0, _index.memo)(instanceId, (paraId, keys) => api.derive.crowdloan.childKey(paraId).pipe((0, _rxjs.switchMap)(childKey => childKey && keys.length ? _contributions(api, paraId, childKey, keys) : (0, _rxjs.of)({}))));
}