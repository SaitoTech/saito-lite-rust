// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { assert, isString, u8aToU8a } from '@polkadot/util';
import { Raw } from "./Raw.js";
/** @internal */

function decodeU8aFixed(value, bitLength) {
  if (Array.isArray(value) || isString(value)) {
    return decodeU8aFixed(u8aToU8a(value), bitLength);
  }

  const byteLength = bitLength / 8;
  const u8a = new Uint8Array(byteLength);

  if (!value || !value.length) {
    return u8a;
  }

  assert(value.length >= byteLength, () => `Expected at least ${byteLength} bytes (${bitLength} bits), found ${value.length} bytes`);
  return value.subarray(0, byteLength);
}
/**
 * @name U8aFixed
 * @description
 * A U8a that manages a a sequence of bytes up to the specified bitLength. Not meant
 * to be used directly, rather is should be subclassed with the specific lengths.
 */


export class U8aFixed extends Raw {
  constructor(registry, value = new Uint8Array(), bitLength = 256) {
    super(registry, decodeU8aFixed(value, bitLength));
  }

  static with(bitLength, typeName) {
    return class extends U8aFixed {
      constructor(registry, value) {
        super(registry, value, bitLength);
      }

      toRawType() {
        return typeName || super.toRawType();
      }

    };
  }
  /**
   * @description Returns the base runtime type name for this instance
   */


  toRawType() {
    return `[u8;${this.length}]`;
  }

}