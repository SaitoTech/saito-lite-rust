// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { substrate } from "./substrate.js";
/** @internal */

export function getStorage(registry) {
  return {
    substrate: Object.entries(substrate).reduce((storage, [key, fn]) => {
      storage[key] = fn(registry);
      return storage;
    }, {})
  };
}