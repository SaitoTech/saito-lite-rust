// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { hasProposals as collectiveHasProposals, proposal as collectiveProposal, proposalCount as collectiveProposalCount, proposalHashes as collectiveProposalHashes, proposals as collectiveProposals } from "../collective/index.js";
import { memo } from "../util/index.js";
export function hasProposals(instanceId, api) {
  return memo(instanceId, collectiveHasProposals(instanceId, api, 'membership'));
}
export function proposal(instanceId, api) {
  return memo(instanceId, collectiveProposal(instanceId, api, 'membership'));
}
export function proposalCount(instanceId, api) {
  return memo(instanceId, collectiveProposalCount(instanceId, api, 'membership'));
}
export function proposalHashes(instanceId, api) {
  return memo(instanceId, collectiveProposalHashes(instanceId, api, 'membership'));
}
export function proposals(instanceId, api) {
  return memo(instanceId, collectiveProposals(instanceId, api, 'membership'));
}