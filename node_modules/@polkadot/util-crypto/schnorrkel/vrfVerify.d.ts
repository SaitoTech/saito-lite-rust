import type { HexString } from '@polkadot/util/types';
/**
 * @name schnorrkelVrfVerify
 * @description Verify with sr25519 vrf verification
 */
export declare function schnorrkelVrfVerify(message: HexString | Uint8Array | string, signOutput: HexString | string | Uint8Array, publicKey: HexString | Uint8Array | string, context?: HexString | string | Uint8Array, extra?: HexString | string | Uint8Array): boolean;
