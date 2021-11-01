"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Metadata = void 0;

var _util = require("@polkadot/util");

var _MetadataVersioned = require("./MetadataVersioned.cjs");

// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
// magic u32 preceding the version id
const VERSION_IDX = 4; // magic + lowest supported version

const EMPTY_METADATA = new Uint8Array([0x6d, 0x65, 0x74, 0x61, 9]);
const EMPTY_U8A = new Uint8Array();

function toU8a(value = EMPTY_U8A) {
  if ((0, _util.isHex)(value)) {
    return toU8a((0, _util.u8aToU8a)(value));
  } else if ((0, _util.isU8a)(value)) {
    return value.length === 0 ? EMPTY_METADATA : value;
  }

  throw new Error('Invalid type passed to Metadata constructor');
}

function decodeMetadata(registry, _value) {
  if (!_value || (0, _util.isU8a)(_value) || (0, _util.isHex)(_value)) {
    const value = toU8a(_value);
    const version = value[VERSION_IDX];

    try {
      return new _MetadataVersioned.MetadataVersioned(registry, value);
    } catch (error) {
      // This is an f-ing hack as a follow-up to another ugly hack
      // https://github.com/polkadot-js/api/commit/a9211690be6b68ad6c6dad7852f1665cadcfa5b2
      // when we fail on V9, try to re-parse it as v10... yes... HACK
      if (version === 9) {
        value[VERSION_IDX] = 10;
        return decodeMetadata(registry, value);
      }

      throw error;
    }
  }

  return new _MetadataVersioned.MetadataVersioned(registry, _value);
}
/**
 * @name Metadata
 * @description
 * The versioned runtime metadata as a decoded structure
 */


class Metadata extends _MetadataVersioned.MetadataVersioned {
  constructor(registry, value) {
    super(registry, decodeMetadata(registry, value));
  }

}

exports.Metadata = Metadata;