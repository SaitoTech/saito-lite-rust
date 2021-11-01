// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { BN } from '@polkadot/util';
import xxhash64AsRaw from "./asRaw.js";
export default function xxhash64AsBn(data, seed) {
  return new BN(xxhash64AsRaw(data, seed), 16);
}