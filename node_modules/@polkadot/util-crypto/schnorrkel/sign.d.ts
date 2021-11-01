import type { HexString } from '@polkadot/util/types';
import type { Keypair } from '../types';
/**
 * @name schnorrkelSign
 * @description Returns message signature of `message`, using the supplied pair
 */
export declare function schnorrkelSign(message: HexString | Uint8Array | string, { publicKey, secretKey }: Partial<Keypair>): Uint8Array;
