// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { prime as collectivePrime } from "../collective/index.js";
import { memo } from "../util/index.js";
export function prime(instanceId, api) {
  return memo(instanceId, collectivePrime(instanceId, api, 'technicalCommittee'));
}