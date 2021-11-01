import type { HexString } from '@polkadot/util/types';
import type { Keypair } from '../../types';
/**
 * @name schnorrkelKeypairFromSeed
 * @description Returns a object containing a `publicKey` & `secretKey` generated from the supplied seed.
 */
export declare function schnorrkelKeypairFromSeed(seed: HexString | Uint8Array | string): Keypair;
