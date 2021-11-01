"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flattenUniq = flattenUniq;

// Copyright 2017-2021 @polkadot/types authors & contributors
// SPDX-License-Identifier: Apache-2.0

/** @internal */
function flattenUniq(list, start = []) {
  return [...new Set(list.reduce((result, entry) => {
    if (Array.isArray(entry)) {
      return flattenUniq(entry, result);
    }

    result.push(entry);
    return result;
  }, start))];
}