/// <reference types="node" />
/// <reference types="bn.js" />
import { BN } from '@polkadot/util';
export default function xxhash64AsBn(data: Buffer | Uint8Array | string, seed: number): BN;
