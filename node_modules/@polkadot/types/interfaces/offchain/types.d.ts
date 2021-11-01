import type { Enum } from '@polkadot/types';
/** @name StorageKind */
export interface StorageKind extends Enum {
    readonly isPersistent: boolean;
    readonly isLocal: boolean;
}
export declare type PHANTOM_OFFCHAIN = 'offchain';
