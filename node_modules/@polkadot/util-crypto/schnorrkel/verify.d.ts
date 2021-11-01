import type { HexString } from '@polkadot/util/types';
/**
 * @name schnorrkelVerify
 * @description Verifies the signature of `message`, using the supplied pair
 */
export declare function schnorrkelVerify(message: HexString | Uint8Array | string, signature: HexString | Uint8Array | string, publicKey: HexString | Uint8Array | string): boolean;
