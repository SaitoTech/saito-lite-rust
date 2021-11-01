"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
// order important in structs... :)

/* eslint-disable sort-keys */
const SLOT_RANGE_COUNT = 10;
const oldTypes = {
  Bidder: {
    _enum: {
      New: 'NewBidder',
      Existing: 'ParaId'
    }
  },
  IncomingParachain: {
    _enum: {
      Unset: 'NewBidder',
      Fixed: 'IncomingParachainFixed',
      Deploy: 'IncomingParachainDeploy'
    }
  },
  IncomingParachainDeploy: {
    code: 'ValidationCode',
    initialHeadData: 'HeadData'
  },
  IncomingParachainFixed: {
    codeHash: 'Hash',
    codeSize: 'u32',
    initialHeadData: 'HeadData'
  },
  NewBidder: {
    who: 'AccountId',
    sub: 'SubId'
  },
  SubId: 'u32'
};

var _default = _objectSpread(_objectSpread({}, oldTypes), {}, {
  AuctionIndex: 'u32',
  LeasePeriod: 'BlockNumber',
  LeasePeriodOf: 'BlockNumber',
  SlotRange: {
    _enum: ['ZeroZero', 'ZeroOne', 'ZeroTwo', 'ZeroThree', 'OneOne', 'OneTwo', 'OneThree', 'TwoTwo', 'TwoThree', 'ThreeThree']
  },
  WinningData: `[WinningDataEntry; ${SLOT_RANGE_COUNT}]`,
  WinningDataEntry: 'Option<(AccountId, ParaId, BalanceOf)>',
  WinnersData: 'Vec<WinnersDataTuple>',
  WinnersDataTuple: '(AccountId, ParaId, BalanceOf, SlotRange)'
});

exports.default = _default;