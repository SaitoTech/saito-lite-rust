import type { HexString } from '@polkadot/util/types';
/**
 * @name schnorrkelAgreement
 * @description Key agreement between other's public key and self secret key
 */
export declare function schnorrkelAgreement(secretKey: HexString | Uint8Array | string, publicKey: HexString | Uint8Array | string): Uint8Array;
