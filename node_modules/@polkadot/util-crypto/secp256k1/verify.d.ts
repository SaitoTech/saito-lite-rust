import type { HexString } from '@polkadot/util/types';
import type { HashType } from './types';
/**
 * @name secp256k1Verify
 * @description Verifies the signature of `message`, using the supplied pair
 */
export declare function secp256k1Verify(message: HexString | Uint8Array | string, signature: HexString | Uint8Array | string, address: HexString | Uint8Array | string, hashType?: HashType): boolean;
