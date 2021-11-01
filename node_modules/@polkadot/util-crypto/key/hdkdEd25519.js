// Copyright 2017-2021 @polkadot/util-crypto authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { naclDeriveHard } from "../nacl/deriveHard.js";
import { naclKeypairFromSeed } from "../nacl/keypair/fromSeed.js";
import { createSeedDeriveFn } from "./hdkdDerive.js";
export const keyHdkdEd25519 = createSeedDeriveFn(naclKeypairFromSeed, naclDeriveHard);