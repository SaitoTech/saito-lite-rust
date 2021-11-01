// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { members as collectiveMembers } from "../collective/index.js";
import { memo } from "../util/index.js";
export function members(instanceId, api) {
  return memo(instanceId, collectiveMembers(instanceId, api, 'council'));
}