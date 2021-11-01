import type { Observable } from 'rxjs';
import type { ApiInterfaceRx } from '@polkadot/api/types';
import type { AccountId } from '@polkadot/types/interfaces';
export declare function members(instanceId: string, api: ApiInterfaceRx): () => Observable<AccountId[]>;
