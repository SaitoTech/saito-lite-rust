import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@polkadot/api/types';
import type { EraIndex } from '@polkadot/types/interfaces';
import type { DeriveOwnExposure } from '../types';
export declare function _ownExposures(instanceId: string, api: ApiInterfaceRx): (accountId: Uint8Array | string, eras: EraIndex[], withActive: boolean) => Observable<DeriveOwnExposure[]>;
export declare function ownExposure(instanceId: string, api: ApiInterfaceRx): (accountId: Uint8Array | string, era: EraIndex) => Observable<DeriveOwnExposure>;
export declare function ownExposures(instanceId: string, api: ApiInterfaceRx): (accountId: Uint8Array | string, withActive?: boolean) => Observable<DeriveOwnExposure[]>;
