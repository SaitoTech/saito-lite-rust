"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasProposals = hasProposals;
exports.proposal = proposal;
exports.proposalCount = proposalCount;
exports.proposalHashes = proposalHashes;
exports.proposals = proposals;

var _index = require("../collective/index.cjs");

var _index2 = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function hasProposals(instanceId, api) {
  return (0, _index2.memo)(instanceId, (0, _index.hasProposals)(instanceId, api, 'council'));
}

function proposal(instanceId, api) {
  return (0, _index2.memo)(instanceId, (0, _index.proposal)(instanceId, api, 'council'));
}

function proposalCount(instanceId, api) {
  return (0, _index2.memo)(instanceId, (0, _index.proposalCount)(instanceId, api, 'council'));
}

function proposalHashes(instanceId, api) {
  return (0, _index2.memo)(instanceId, (0, _index.proposalHashes)(instanceId, api, 'council'));
}

function proposals(instanceId, api) {
  return (0, _index2.memo)(instanceId, (0, _index.proposals)(instanceId, api, 'council'));
}