import type { HexString } from '@polkadot/util/types';
/**
 * @name naclSign
 * @summary Verifies the signature on the supplied message.
 * @description
 * Verifies the `signature` on `message` with the supplied `publicKey`. Returns `true` on sucess, `false` otherwise.
 * @example
 * <BR>
 *
 * ```javascript
 * import { naclVerify } from '@polkadot/util-crypto';
 *
 * naclVerify([...], [...], [...]); // => true/false
 * ```
 */
export declare function naclVerify(message: HexString | Uint8Array | string, signature: HexString | Uint8Array | string, publicKey: HexString | Uint8Array | string, onlyJs?: boolean): boolean;
