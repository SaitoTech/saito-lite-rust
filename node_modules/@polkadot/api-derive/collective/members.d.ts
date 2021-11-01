import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@polkadot/api/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { Collective } from './types';
export declare function members(instanceId: string, api: ApiInterfaceRx, _section: Collective): () => Observable<AccountId[]>;
