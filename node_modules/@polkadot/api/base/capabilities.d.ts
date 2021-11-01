import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@polkadot/api/types';
import type { InterfaceTypes } from '@polkadot/types/types';
declare type DetectedKeys = keyof Pick<InterfaceTypes, 'AccountInfo' | 'ValidatorPrefs'>;
declare type DetectedValues = keyof InterfaceTypes;
interface DetectedTypes extends Record<DetectedKeys, DetectedValues> {
    AccountInfo: 'AccountInfoWithRefCount' | 'AccountInfoWithDualRefCount' | 'AccountInfoWithTripleRefCount';
    Keys: 'SessionKeys1' | 'SessionKeys2' | 'SessionKeys3' | 'SessionKeys4' | 'SessionKeys5' | 'SessionKeys6' | 'SessionKeys7' | 'SessionKeys8' | 'SessionKeys9' | 'SessionKeys10';
    RefCount: 'u8' | 'u32';
    SlotRange: Record<string, unknown>;
    ValidatorPrefs: 'ValidatorPrefsWithBlocked' | 'ValidatorPrefsWithCommission';
    WinningData: string;
}
/**
 * @description Query the chain for the specific capabilities
 */
export declare function detectedCapabilities(api: ApiInterfaceRx, blockHash?: Uint8Array | string | undefined): Observable<Partial<DetectedTypes>>;
export {};
