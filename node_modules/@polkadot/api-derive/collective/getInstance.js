// Copyright 2017-2021 @polkadot/api-derive authors & contributors
// SPDX-License-Identifier: Apache-2.0
export function getInstance(api, section) {
  const instances = api.registry.getModuleInstances(api.runtimeVersion.specName.toString(), section);
  return instances && instances.length ? instances[0] : section;
}