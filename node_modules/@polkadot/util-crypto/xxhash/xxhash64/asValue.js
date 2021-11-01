// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import xx from 'xxhashjs';
import { u8aToU8a } from '@polkadot/util';
export default function xxhash64AsValue(data, seed) {
  return xx.h64(u8aToU8a(data).buffer, seed);
}