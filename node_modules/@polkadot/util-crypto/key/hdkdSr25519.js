// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { schnorrkelDeriveHard } from "../schnorrkel/deriveHard.js";
import { schnorrkelDeriveSoft } from "../schnorrkel/deriveSoft.js";
export function keyHdkdSr25519(keypair, {
  chainCode,
  isSoft
}) {
  return isSoft ? schnorrkelDeriveSoft(keypair, chainCode) : schnorrkelDeriveHard(keypair, chainCode);
}