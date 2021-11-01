"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proposals = proposals;

var _rxjs = require("rxjs");

var _index = require("../util/index.cjs");

// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
function parseResult(api, {
  allIds,
  allProposals,
  approvalIds,
  councilProposals,
  proposalCount
}) {
  const approvals = [];
  const proposals = [];
  const councilTreasury = councilProposals.filter(({
    proposal
  }) => api.tx.treasury.approveProposal.is(proposal) || api.tx.treasury.rejectProposal.is(proposal));
  allIds.forEach((id, index) => {
    if (allProposals[index].isSome) {
      const council = councilTreasury.filter(({
        proposal
      }) => id.eq(proposal.args[0])).sort((a, b) => a.proposal.method.localeCompare(b.proposal.method));
      const isApproval = approvalIds.some(approvalId => approvalId.eq(id));
      const derived = {
        council,
        id,
        proposal: allProposals[index].unwrap()
      };

      if (isApproval) {
        approvals.push(derived);
      } else {
        proposals.push(derived);
      }
    }
  });
  return {
    approvals,
    proposalCount,
    proposals
  };
}

function retrieveProposals(api, proposalCount, approvalIds) {
  const proposalIds = [];
  const count = proposalCount.toNumber();

  for (let index = 0; index < count; index++) {
    if (!approvalIds.some(id => id.eqn(index))) {
      proposalIds.push(api.registry.createType('ProposalIndex', index));
    }
  }

  const allIds = [...proposalIds, ...approvalIds];
  return (0, _rxjs.combineLatest)([api.query.treasury.proposals.multi(allIds), api.derive.council ? api.derive.council.proposals() : (0, _rxjs.of)([])]).pipe((0, _rxjs.map)(([allProposals, councilProposals]) => parseResult(api, {
    allIds,
    allProposals,
    approvalIds,
    councilProposals,
    proposalCount
  })));
}
/**
 * @description Retrieve all active and approved treasury proposals, along with their info
 */


function proposals(instanceId, api) {
  return (0, _index.memo)(instanceId, () => api.query.treasury ? (0, _rxjs.combineLatest)([api.query.treasury.proposalCount(), api.query.treasury.approvals()]).pipe((0, _rxjs.switchMap)(([proposalCount, approvalIds]) => retrieveProposals(api, proposalCount, approvalIds))) : (0, _rxjs.of)({
    approvals: [],
    proposalCount: api.registry.createType('ProposalIndex'),
    proposals: []
  }));
}